import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { CreateProduct, Product } from '../interfaces/IProducts';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private apiUrl = 'https://crnyybily9.execute-api.us-east-2.amazonaws.com/api-rest-v1/productos'; // URL de la API

  constructor(private http: HttpClient) {}

  getProducts(): Observable<{ products: Product[] }> {
    return this.http.get<any>(this.apiUrl).pipe(
      map((response) => ({
        products: response.data.map((item: any) => ({
          // ProductID: item.codigo, // Mapear código como ID
          Code: item.codigo,
          Price: item.precio_unitario,
          Description: item.descripcion,
          Category: item.categorias.join(', '), // Concatenar categorías como string
          Name: item.nombre,
          Cantidad: item.cantidad
        })),
      }))
    );
  }

  createProduct(product: CreateProduct): Observable<any> {
    return this.http.post<any>(this.apiUrl, product);
  }
}
