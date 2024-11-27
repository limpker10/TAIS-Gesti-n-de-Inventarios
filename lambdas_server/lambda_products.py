import json
import boto3
from decimal import Decimal
import hashlib
import re
from datetime import datetime
from botocore.exceptions import ClientError

dynamodb = boto3.resource('dynamodb')
table_name = "Productos"
table = dynamodb.Table(table_name)

table_categorias = dynamodb.Table("Categorias")  # Instancia de la tabla Categorias


DEFAULT_CATEGORY = "CAT-GEN-18-23-50"  # Categoría por defecto

def lambda_handler(event, context):
    try:
        http_method = event.get('httpMethod', '')
        path = event.get('path', '')

        if http_method == 'POST':
            return create_product(event)
        elif http_method == 'GET':
            return list_products_all()
        elif http_method == 'PATCH' and path == '/productos/cantidad':
            return update_product_quantity(event)
        else:
            return build_response(404, {"message": f"Ruta {path} o método {http_method} no soportado"})
    except Exception as e:
        return build_response(500, {"message": "Error interno del servidor", "error": str(e)})

def create_product(event):
    try:
        # Lista de parámetros permitidos
        allowed_keys = {'nombre', 'descripcion', 'precio_unitario', 'cantidad', 'precio_venta', 'categorias'}

        body = json.loads(event.get('body', '{}'))
        keys_in_request = set(body.keys())

        # Validar que no existan claves adicionales
        extra_keys = keys_in_request - allowed_keys
        if extra_keys:
            return build_response(400, {"message": f"Parámetros no permitidos: {', '.join(extra_keys)}"})

        nombre = body.get('nombre', '').strip()
        descripcion = body.get('descripcion', '').strip()

        # Validación del campo 'nombre'
        if not nombre:
            return build_response(400, {"message": "El campo 'nombre' es obligatorio"})

        if len(nombre) > 100:
            return build_response(400, {"message": "El nombre no puede exceder los 100 caracteres"})

        if not re.match("^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+$", nombre):
            return build_response(400, {"message": "El nombre no puede contener caracteres especiales"})

        # Validación del campo 'descripcion'
        if len(descripcion) > 250:
            return build_response(400, {"message": "La descripción no puede exceder los 250 caracteres"})

        if descripcion and not re.match(r"^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+$", descripcion):
            return build_response(400, {"message": "La descripción no puede contener caracteres especiales"})

        # Validación de campos obligatorios y tipos numéricos
        if 'precio_unitario' not in body or 'cantidad' not in body or 'precio_venta' not in body:
            return build_response(400, {"message": "Los campos 'precio_unitario', 'cantidad' y 'precio_venta' son obligatorios"})

        try:
            precio_unitario = Decimal(str(body.get('precio_unitario')))
            cantidad = Decimal(str(body.get('cantidad')))
            precio_venta = Decimal(str(body.get('precio_venta')))
        except (ValueError, TypeError):
            return build_response(400, {"message": "Los campos 'precio_unitario', 'cantidad' y 'precio_venta' deben ser valores numéricos"})

        # Validación para asegurar que los valores no sean negativos
        if precio_unitario < 0 or cantidad < 0 or precio_venta < 0:
            return build_response(400, {"message": "Los campos 'precio_unitario', 'cantidad' y 'precio_venta' no pueden ser valores negativos"})

        # Restricciones sobre el precio de venta
        
        if precio_venta < precio_unitario:
            return build_response(400, {"message": "El precio de venta no puede ser menor que el precio unitario"})

        categorias = body.get('categorias', [DEFAULT_CATEGORY])
        if not isinstance(categorias, list):
            categorias = [categorias]
        categorias = [str(categoria).strip() for categoria in categorias]



        # Verificar si las categorías existen en la tabla de categorías
        for categoria in categorias:
            category_exists = table_categorias.get_item(Key={'CategoriaID': categoria})
            if 'Item' not in category_exists:
                return build_response(400, {"message": f"La categoría '{categoria}' no existe en la tabla de categorías"})

        # Verificar duplicados por nombre
        existing_product = table.scan(
            FilterExpression="nombre = :nombre",
            ExpressionAttributeValues={":nombre": nombre}
        ).get('Items', [])
        if existing_product:
            return build_response(400, {"message": f"El producto con nombre '{nombre}' ya existe"})

        codigo = generate_product_code(nombre)

        item = {
            'codigo': codigo,
            'nombre': nombre,
            'cantidad': cantidad,
            'categorias': categorias,
            'descripcion': descripcion if descripcion else "No especificado",
            'precio_unitario': precio_unitario,
            'precio_venta': precio_venta
        }

        table.put_item(Item=item)

        return build_response(201, {"message": "Producto creado correctamente", "item": item})
    except ClientError as e:
        return build_response(500, {"message": "Error al insertar el producto", "error": str(e)})
    except Exception as e:
        return build_response(500, {"message": "Error interno del servidor", "error": str(e)})


def generate_product_code(nombre):
    timestamp = datetime.now().strftime('%H%M%S-%Y')
    unique_string = f"{nombre}-{datetime.now().timestamp()}"
    unique_hash = hashlib.md5(unique_string.encode()).hexdigest()[:6].upper()
    return f"P-{timestamp}-{unique_hash}"

def list_products_all():
    try:
        response = table.scan()
        items = response.get('Items', [])

        for item in items:
            for key, value in item.items():
                if isinstance(value, set):
                    item[key] = list(value)

        return build_response(200, {"message": "Lista completa de productos", "data": items})
    except ClientError as e:
        return build_response(500, {"message": "Error al recuperar los productos", "error": str(e)})

def update_product_quantity(event):
    try:
        body = json.loads(event.get('body', '{}'))
        codigo = body.get('codigo')
        nombre = body.get('nombre')
        cantidad = body.get('cantidad')
        operacion = body.get('operacion')

        if not codigo or not nombre or cantidad is None or operacion not in ["entrada", "salida"]:
            return build_response(400, {"message": "Campos 'codigo', 'nombre', 'cantidad' y 'operacion' son requeridos"})

        response = table.get_item(Key={'codigo': codigo, 'nombre': nombre})
        producto = response.get('Item')

        if not producto:
            return build_response(404, {"message": f"El producto con código {codigo} y nombre {nombre} no existe"})

        cantidad_actual = producto.get('cantidad', 0)
        nueva_cantidad = cantidad_actual + cantidad if operacion == "entrada" else cantidad_actual - cantidad

        if nueva_cantidad < 0:
            return build_response(400, {"message": "La cantidad no puede ser negativa"})

        update_response = table.update_item(
            Key={'codigo': codigo, 'nombre': nombre},
            UpdateExpression="SET cantidad = :cantidad",
            ExpressionAttributeValues={':cantidad': nueva_cantidad},
            ReturnValues="UPDATED_NEW"
        )

        return build_response(200, {"message": "Cantidad actualizada correctamente", "actualizado": update_response['Attributes']})
    except ClientError as e:
        return build_response(500, {"message": "Error al actualizar la cantidad", "error": str(e)})
    except Exception as e:
        return build_response(500, {"message": "Error interno del servidor", "error": str(e)})

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return int(obj) if obj % 1 == 0 else float(obj)
        return super(DecimalEncoder, self).default(obj)

def build_response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        },
        "body": json.dumps(body, cls=DecimalEncoder)
    }
