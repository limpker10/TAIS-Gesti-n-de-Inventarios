import { Component } from '@angular/core';
import {MatTableModule} from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { ProductsService } from '../services/products.service';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { Product } from '../interfaces/IProducts';
@Component({
  selector: 'app-list-products',
  standalone: true,
  imports: [MatTableModule,MatButtonModule,MatIconModule,RouterLink,MatProgressSpinnerModule],
  templateUrl: './list-products.component.html',
  styleUrl: './list-products.component.css'
})
export class ListProductsComponent {

  cargando: boolean = true;

  displayedColumns: string[] = ['Code', 'Name', 'Price', 'Category', 'Description','Cantidad'];
  products: Product[] = [];

  constructor(private productService:ProductsService) {}

  ngOnInit(): void {
    this.loadProductos();
  }

  loadProductos(){
    this.productService.getProducts().subscribe({
      next: (data) => {
        // Mapear datos recibidos al formato de la interfaz Product
        this.products = data.products;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar los productos:', error);
        this.cargando = false;
      },
    });
  }
  
  editProduct(id: number): void {
    console.log('Edit product with ID:', id);
    // Lógica para editar producto
  }

  deleteProduct(id: number): void {
    console.log('Delete product with ID:', id);
    // Lógica para eliminar producto
  }
}