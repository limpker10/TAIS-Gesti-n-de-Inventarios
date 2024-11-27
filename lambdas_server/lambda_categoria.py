import json
import boto3
import datetime
import re
from decimal import Decimal
from botocore.exceptions import ClientError

# Crear cliente de DynamoDB
dynamodb = boto3.resource('dynamodb')
table_name = "Categorias"
table = dynamodb.Table(table_name)

def lambda_handler(event, context):
    print("Request event:", event)
    try:
        http_method = event.get('httpMethod', '')
        path = event.get('path', '')

        if http_method == 'POST':
            return create_category(event)
        elif http_method == 'GET':
            return list_categories(event)
        else:
            return build_response(404, {"message": f"Ruta {path} o método {http_method} no soportado"})
    except Exception as e:
        print(f"Error general: {e}")
        return build_response(500, {"message": "Error interno del servidor", "error": str(e)})

def create_category(event):
    """
    Crea una nueva categoría en la tabla DynamoDB.
    """
    try:
        # Validar si el cuerpo de la solicitud está presente
        if 'body' not in event or not event['body']:
            return build_response(400, {"message": "El cuerpo de la solicitud no puede estar vacío"})

        body = json.loads(event['body'])

        # Validar los campos requeridos
        nombre = body.get('nombre', '').strip()
        descripcion = body.get('descripcion', '').strip()
        estado = body.get('estado', 'activo').strip().lower()

        if not nombre:
            return build_response(400, {"message": "El campo 'nombre' es obligatorio"})
        if len(nombre) > 50:
            return build_response(400, {"message": "El nombre no debe superar los 50 caracteres"})
        if not is_valid_string(nombre):
            return build_response(400, {"message": "El nombre no debe contener caracteres especiales"})
        if not is_valid_string(descripcion):
            return build_response(400, {"message": "La descripción no debe contener caracteres especiales"})
        if estado not in ['activo', 'inactivo']:
            return build_response(400, {"message": "El estado debe ser 'activo' o 'inactivo'"})

        # Verificar si el nombre ya existe en la tabla
        if is_duplicate_name(nombre):
            return build_response(400, {"message": f"Ya existe una categoría con el nombre '{nombre}'"})

        # Generar CategoriaID automáticamente
        categoria_id = generate_category_id(nombre)

        # Preparar el ítem para insertar en DynamoDB
        item = {
            'CategoriaID': categoria_id,
            'Nombre': nombre,
            'Descripcion': descripcion if descripcion else None,
            'Fecha_creacion': get_current_date(),
            'Estado': estado
        }

        # Insertar el ítem en la tabla
        table.put_item(Item=item)

        return build_response(201, {
            "message": "Categoría creada correctamente",
            "CategoriaID": categoria_id,
            "item": item
        })
    except json.JSONDecodeError:
        return build_response(400, {"message": "El cuerpo de la solicitud debe estar en formato JSON válido"})
    except ClientError as e:
        print("Error al insertar categoría:", e)
        return build_response(500, {
            "message": "Error al insertar la categoría",
            "error": str(e)
        })
    except Exception as e:
        print("Error general en create_category:", e)
        return build_response(500, {"message": "Error interno del servidor", "error": str(e)})


def list_categories(event):
    """
    Lista todas las categorías almacenadas en la tabla DynamoDB.
    """
    try:
        # Escanear todos los elementos de la tabla
        response = table.scan()
        categorias = response.get('Items', [])

        return build_response(200, {
            "message": "Lista de categorías obtenida correctamente",
            "data": categorias
        })
    except ClientError as e:
        print("Error al recuperar categorías:", e)
        return build_response(500, {
            "message": "Error al recuperar las categorías",
            "error": str(e)
        })

def generate_category_id(nombre):
    """
    Genera un identificador único para la categoría con el formato:
    CAT-3DígitosNombre-Hora-Min-Seg
    """
    abreviatura = ''.join(filter(str.isalnum, nombre[:3])).upper()
    hora_actual = datetime.datetime.now().strftime('%H-%M-%S')
    return f"CAT-{abreviatura}-{hora_actual}"

def get_current_date():
    """
    Devuelve la fecha actual en formato YYYY-MM-DD
    """
    return datetime.datetime.now().strftime("%Y-%m-%d")

def is_valid_string(value):
    """
    Verifica que un string no contenga caracteres especiales.
    """
    return re.match("^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+$", value) is not None

def is_duplicate_name(nombre):
    """
    Verifica si ya existe una categoría con el mismo nombre.
    """
    try:
        # Consultar la tabla para buscar el nombre
        response = table.scan(
            FilterExpression="Nombre = :nombre",
            ExpressionAttributeValues={":nombre": nombre}
        )
        return len(response.get('Items', [])) > 0
    except ClientError as e:
        print(f"Error al verificar duplicados: {e}")
        return False

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            if obj % 1 == 0:
                return int(obj)
            else:
                return float(obj)
        return super(DecimalEncoder, self).default(obj)

def build_response(status_code, body):
    """
    Construye una respuesta HTTP con código de estado y cuerpo.
    """
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",  # Permitir solicitudes desde cualquier origen
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",  # Métodos permitidos
            "Access-Control-Allow-Headers": "Content-Type"  # Encabezados permitidos
        },
        "body": json.dumps(body, cls=DecimalEncoder)
    }
