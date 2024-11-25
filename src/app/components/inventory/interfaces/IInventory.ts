export interface ProductDetail {
  codigo: string; // ID del producto
  precio_unitario: number; // Precio por unidad
  total: number; // Total por este producto
  unidad: string;
  cantidad: number; // Cantidad del producto
  nombre: string; // Nombre del producto
  
}

export interface InventoryItem {
  documento_movimiento: string; // ID del documento del movimiento
  tipo_operacion: string; // Tipo de operación (ejemplo: "INGRESO")
  detalle_productos: ProductDetail[]; // Detalle de los productos (arreglo de objetos)
  fecha_movimiento: string; // Fecha del movimiento en formato YYYY-MM-DD
  nota: string; // Nota asociada al movimiento
}

export interface ApiResponse {
  message: string; // Mensaje de la API
  data: InventoryItem[]; // Lista de registros obtenidos
}

export interface CreateRecordRequest {
  tipo_operacion: 'INGRESO' | 'EGRESO'; // Tipo de operación (Ingreso o Egreso)
  detalle_productos: DetalleProducto[]; // Lista de productos en el movimiento
  fecha_movimiento?: string; // Fecha del movimiento en formato 'YYYY-MM-DD' (opcional)
  nota?: string; // Observaciones o notas del movimiento (opcional)
}
export interface DetalleProducto {
  codigo:string;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  total: number;
}


