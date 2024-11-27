import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoriasService {

  private apiUrl =
    'https://crnyybily9.execute-api.us-east-2.amazonaws.com/api-rest-v1/categorias';

  constructor(private http: HttpClient) { }

  // Obtener todas las categorías
  getCategorias(): Observable<any[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => response.data) // Extrae el array `data` de la respuesta
    );
  }

  // Obtener una categoría por ID
  getCategoriaById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Crear una nueva categoría
  createCategoria(categoria: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, categoria);
  }

  // Actualizar una categoría existente
  updateCategoria(id: string, categoria: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, categoria);
  }

  // Eliminar una categoría
  deleteCategoria(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
