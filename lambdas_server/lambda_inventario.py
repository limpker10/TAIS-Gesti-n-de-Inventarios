import json
import boto3
import datetime
import urllib3
import re
from decimal import Decimal
from botocore.exceptions import ClientError

# Crear cliente de DynamoDB
dynamodb = boto3.resource('dynamodb')
table_name = "Almacen"
table = dynamodb.Table(table_name)

def lambda_handler(event, context):
    print("Request event:", event)
    try:
        http_method = event.get('httpMethod', '')
        path = event.get('path', '')

        if http_method == 'POST' :
            return create_record(event)
        elif http_method == 'GET' :
            return list_records(event)
        else:
            return build_response(404, {"message": f"Ruta {path} o método {http_method} no soportado"})
    except Exception as e:
        print(f"Error general: {e}")
        return build_response(500, {"message": "Error interno del servidor", "error": str(e)})

def create_record(event):
    try:
        body = json.loads(event.get('body', '{}'))

        # Generar documento_movimiento automáticamente
        documento_movimiento = generate_document_id()

        # Extraer los datos del cuerpo de la solicitud
        tipo_operacion = body.get('tipo_operacion', '').strip()
        detalle_productos = body.get('detalle_productos', [])
        fecha_movimiento = body.get('fecha_movimiento', get_current_date())
        nota = body.get('nota', '').strip()
        cliente_proveedor = body.get('cliente_proveedor', {})
        # Extraer y validar el tipo_documento
        tipo_documento = body.get('tipo_documento', '').strip()
        
        # Validar coherencia del tipo_documento con tipo_operacion
        documentos_permitidos = {
            "INGRESO": ["FACTURA_COMPRA", "NOTA_DEVOLUCION", "ORDEN_ENTRADA", "DONACION"],
            "SALIDA": ["FACTURA_VENTA", "ORDEN_SALIDA", "NOTA_ENVIO", "GUIA_REMITO", "NOTA_TRANSFERENCIA"]
        }

        
        # Validaciones para 'tipo_operacion'
        if tipo_operacion not in ["INGRESO", "SALIDA"]:
            return build_response(400, {
                "message": "El campo 'tipo_operacion' debe ser 'INGRESO' o 'SALIDA'."
            })
        if tipo_documento not in documentos_permitidos.get(tipo_operacion, []):
            return build_response(400, {
                "message": f"El 'tipo_documento' {tipo_documento} no es válido para la operación {tipo_operacion}."
            })

        # Validaciones para 'detalle_productos'
        if not isinstance(detalle_productos, list) or not detalle_productos:
            return build_response(400, {
                "message": "El campo 'detalle_productos' debe ser una lista no vacía."
            })

        for producto in detalle_productos:
            codigo = producto.get('codigo', '').strip()
            nombre = producto.get('nombre', '').strip()
            cantidad = producto.get('cantidad', None)

            if not isinstance(codigo, str):
                return build_response(400, {
                    "message": "Cada producto debe tener un 'codigo' "
                })
            if not isinstance(nombre, str) :
                return build_response(400, {
                    "message": "Cada producto debe tener un 'nombre' "
                })
            if not isinstance(cantidad, int) or cantidad <= 0:
                return build_response(400, {
                    "message": "Cada producto debe tener una 'cantidad' entera mayor que cero."
                })

        try:
            # Intentar convertir la fecha a un objeto datetime
            fecha_obj = datetime.datetime.strptime(fecha_movimiento, "%Y-%m-%d").date()
            # Obtener la fecha actual
            fecha_actual = datetime.datetime.now().date()
            
            # Validar si la fecha proporcionada es diferente de la fecha actual
            if fecha_obj != fecha_actual:
                return build_response(400, {
                    "message": "El campo 'fecha_movimiento' debe ser la fecha actual en formato 'YYYY-MM-DD'."
                })
    
        except ValueError:
            # Si la fecha no tiene el formato esperado
            return build_response(400, {
                "message": "El campo 'fecha_movimiento' debe tener el formato 'YYYY-MM-DD'."
            })

        # Validaciones para 'nota'
        if nota and (not isinstance(nota, str) or len(nota) > 255):
            return build_response(400, {
                "message": "El campo 'nota' debe ser una cadena de máximo 255 caracteres."
            })

        # Expresión regular para permitir solo letras, números, espacios y ciertos caracteres básicos
        if nota and not re.match(r'^[a-zA-Z0-9\s.,áéíóúÁÉÍÓÚñÑ]+$', nota):
            return build_response(400, {
                "message": "El campo 'nota' no puede contener caracteres especiales no permitidos."
            })

        # Validaciones para 'cliente_proveedor'
        if not isinstance(cliente_proveedor, dict):
            return build_response(400, {
                "message": "El campo 'cliente_proveedor' debe ser un objeto con 'tipo_usuario' y 'usuario_id'."
            })

        tipo_usuario = cliente_proveedor.get('tipo_usuario', '').strip()
        usuario_id = cliente_proveedor.get('usuario_id', '').strip()


        if tipo_usuario not in ["CLIENTE", "PROVEEDOR"]:
            return build_response(400, {
                "message": "El campo 'tipo_usuario' debe ser 'CLIENTE' o 'PROVEEDOR'."
            })
        
         # Validar la coherencia entre tipo_operacion y tipo_usuario
        if tipo_operacion == "ENTRADA" and tipo_usuario != "PROVEEDOR":
            return build_response(400, {
                "message": "Por el tipo de operacion no se permiten usuarios de tipo PROVEEDOR."
            })

        if tipo_operacion == "SALIDA" and tipo_usuario != "CLIENTE":
            return build_response(400, {
               "message": "Por el tipo de operacion no se permiten usuarios de tipo CLIENTE."
            })

        if not isinstance(usuario_id, str) :
            return build_response(400, {
                "message": "El campo 'usuario_id' debe ser un identificador "
            })
        
        usuarios_table = dynamodb.Table('Usuarios')
        try:
            # Consulta usando Partition Key y Sort Key
            user_response = usuarios_table.get_item(
                Key={
                    'tipo_usuario': tipo_usuario,  # Asegúrate de usar CLIENTE o PROVEEDOR aquí
                    'usuario_id': usuario_id
                }
            )
            if 'Item' not in user_response:
                return build_response(404, {
                    "message": f"El usuario con ID '{usuario_id}' y tipo '{tipo_usuario}' no existe en la tabla 'Usuarios'."
                })
        except ClientError as e:
            print("Error al verificar el usuario:", e)
            return build_response(500, {
                "message": "Error al verificar el usuario en la tabla 'Usuarios'.",
                "error": str(e)
            })

        # Preparar el ítem para insertar en DynamoDB
        item = {
            'documento_movimiento': documento_movimiento,  # Partition Key
            'tipo_operacion': tipo_operacion,  # Sort Key
            'tipo_documento': tipo_documento,
            'detalle_productos': detalle_productos,
            'fecha_movimiento': fecha_movimiento,
            'nota': nota,
            'cliente_proveedor': {
                'tipo_usuario': tipo_usuario,
                'usuario_id': usuario_id
            }
        }

        # Inicializar urllib3
        http = urllib3.PoolManager()

        # Lógica para modificar cantidades en el inventario
        for producto in detalle_productos:
            codigo = producto['codigo']
            nombre = producto['nombre']
            cantidad = producto['cantidad']
            

            # Determinar operación para update_product_quantity
            operacion = "entrada" if tipo_operacion == "INGRESO" else "salida"

            # Construir payload para la otra API
            payload = json.dumps({
                "codigo": codigo,
                "nombre": nombre,
                "cantidad": cantidad,
                "operacion": operacion
            })

            # Llamar a la API de update_product_quantity
            api_url = "https://crnyybily9.execute-api.us-east-2.amazonaws.com/api-rest-v1/productos/cantidad"  # Cambiar por la URL real
            response = http.request(
                "PATCH",
                api_url,
                body=payload,
                headers={"Content-Type": "application/json"}
            )

            if response.status != 200:
                return build_response(500, {
                    "message": f"Error al actualizar el producto {codigo}",
                    "detalle": json.loads(response.data.decode("utf-8"))
                })

        # Insertar el ítem en la tabla
        table.put_item(Item=item)

        return build_response(201, {
            "message": f"Registro de {tipo_operacion} creado correctamente",
            "documento_movimiento": documento_movimiento,
            "item": item
        })
    except ClientError as e:
        print("Error al insertar registro:", e)
        return build_response(500, {
            "message": "Error al insertar el registro",
            "error": str(e)
        })
    except Exception as e:
        print("Error inesperado:", e)
        return build_response(500, {
            "message": "Error inesperado al procesar la solicitud",
            "error": str(e)
        })

def list_records(event):
    try:
        # Obtener parámetros de consulta (si existen)
        query_params = event.get('queryStringParameters') or {}
        documento_movimiento = query_params.get('documento_movimiento', None)
        tipo_operacion = query_params.get('tipo_operacion', None)

        if documento_movimiento and tipo_operacion:
            # Consulta específica por documento_movimiento y tipo_operacion
            response = table.query(
                KeyConditionExpression=boto3.dynamodb.conditions.Key('documento_movimiento').eq(documento_movimiento) &
                boto3.dynamodb.conditions.Key('tipo_operacion').eq(tipo_operacion)
            )
        elif documento_movimiento:
            # Consulta por documento_movimiento
            response = table.query(
                KeyConditionExpression=boto3.dynamodb.conditions.Key('documento_movimiento').eq(documento_movimiento)
            )
        elif tipo_operacion:
            # Filtrar por tipo_operacion
            response = table.scan(
                FilterExpression=boto3.dynamodb.conditions.Attr('tipo_operacion').eq(tipo_operacion)
            )
        else:
            # Escanear toda la tabla
            response = table.scan()

        items = response.get('Items', [])

        return build_response(200, {
            "message": "Lista de registros obtenida correctamente",
            "data": items
        })
    except ClientError as e:
        print("Error al recuperar registros:", e)
        return build_response(500, {
            "message": "Error al recuperar los registros",
            "error": str(e)
        })

def generate_document_id():
    """
    Genera un identificador único con el formato "DOC"-YYYYMMDDHHMMSS
    """
    now = datetime.datetime.now().strftime("%Y%m%d%H%M%S")  # Fecha y hora actual
    return f"DOC-{now}"

def get_current_date():
    """
    Devuelve la fecha actual en formato YYYY-MM-DD
    """
    return datetime.datetime.now().strftime("%Y-%m-%d")

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            if obj % 1 == 0:
                return int(obj)
            else:
                return float(obj)
        return super(DecimalEncoder, self).default(obj)

def build_response(status_code, body):
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
