import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { CreateProduct, Product } from '../interfaces/IProducts';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private apiUrl =
    'https://crnyybily9.execute-api.us-east-2.amazonaws.com/api-rest-v1/productos'; // URL de la API

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
          Cantidad: item.cantidad,
        })),
      }))
    );
  }

  createProduct(product: CreateProduct): Observable<any> {
    return this.http.post<any>(this.apiUrl, product);
  }

  listProducts(
    pageSize: number = 10,
    lastEvaluatedKey: any = null
  ): Observable<any> {
    let params = new HttpParams().set('pageSize', pageSize.toString());

    if (lastEvaluatedKey) {
      params = params.set('lastEvaluatedKey', JSON.stringify(lastEvaluatedKey));
    }

    return this.http
      .get(`${this.apiUrl}`, { params })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocurrió un error inesperado.';
    if (error.error instanceof ErrorEvent) {
      // Error del cliente
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else {
      // Error del servidor
      errorMessage = `Código de error: ${error.status}\nMensaje: ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}
