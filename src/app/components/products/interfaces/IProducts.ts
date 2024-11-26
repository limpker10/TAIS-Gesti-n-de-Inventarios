export interface Product {
  // ProductID: string;
  Code: string;
  Price: number;
  Description: string;
  Category: string;
  Name: string;
  Cantidad:number
}
export interface ProductPagination {
  // ProductID: string;
  codigo: string;
  precio_unitario: number;
  descripcion: string;
  categorias: string;
  nombre: string;
  cantidad:number
}


export interface CreateProduct {
  nombre: string;
  cantidad: number;
  categorias: string;
  descripcion: string;
  precio_unitario: number;
}