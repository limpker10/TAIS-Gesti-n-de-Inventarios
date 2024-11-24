export interface Product {
  // ProductID: string;
  Code: string;
  Price: number;
  Description: string;
  Category: string;
  Name: string;
  Cantidad:number
}

export interface CreateProduct {
  nombre: string;
  cantidad: number;
  categorias: string;
  descripcion: string;
  precio_unitario: number;
}