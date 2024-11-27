import json
import boto3
from botocore.exceptions import ClientError

# Crear cliente de DynamoDB
dynamodb = boto3.resource('dynamodb')
table_name = "Usuarios"  # Cambiar por el nombre de tu tabla
table = dynamodb.Table(table_name)

def lambda_handler(event, context):
    try:
        # Validar el método HTTP
        if event.get('httpMethod') != 'GET':
            return build_response(405, {"message": "Método no permitido. Solo se permite GET."})

        # Obtener parámetros de consulta
        query_params = event.get('queryStringParameters', {})
        tipo_usuario = query_params.get('tipo_usuario')

        if not tipo_usuario:
            return build_response(400, {"message": "El parámetro 'tipo_usuario' es obligatorio."})

        # Consultar la tabla DynamoDB
        try:
            response = table.query(
                KeyConditionExpression=boto3.dynamodb.conditions.Key('tipo_usuario').eq(tipo_usuario)
            )
            items = response.get('Items', [])

            return build_response(200, {
                "message": f"Usuarios obtenidos correctamente.",
                "data": items
            })
        except ClientError as e:
            print(f"Error al consultar DynamoDB: {e}")
            return build_response(500, {
                "message": "Error al consultar la tabla de usuarios.",
                "error": str(e)
            })

    except Exception as e:
        print(f"Error general: {e}")
        return build_response(500, {"message": "Error interno del servidor.", "error": str(e)})

def build_response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",  # Permitir solicitudes desde cualquier origen
            "Access-Control-Allow-Methods": "GET",  # Métodos permitidos
            "Access-Control-Allow-Headers": "Content-Type"  # Encabezados permitidos
        },
        "body": json.dumps(body)
    }
