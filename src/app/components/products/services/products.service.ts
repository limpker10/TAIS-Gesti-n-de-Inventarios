import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../interfaces/IProducts';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private apiUrl = 'https://3q1lb8p16m.execute-api.us-east-2.amazonaws.com/test_api_v1/products'; // URL de la API

  constructor(private http: HttpClient) {}

  getProducts(): Observable<{ products: Product[] }> {
    
    return this.http.get<{ products: Product[] }>(this.apiUrl);
  }
}
