import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { ProductsService } from '../services/products.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Product, ProductPagination } from '../interfaces/IProducts';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
@Component({
  selector: 'app-list-products',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    RouterLink,
    MatProgressSpinnerModule,
    MatSortModule,
    MatPaginatorModule,
  ],
  templateUrl: './list-products.component.html',
  styleUrl: './list-products.component.css',
})
export class ListProductsComponent implements OnInit, AfterViewInit {
  // Columnas de la tabla
  displayedColumns: string[] = [
    'codigo',
    'nombre',
    'precio_unitario',
    'descripcion',
    'cantidad',
  ];

  // Fuente de datos de la tabla
  dataSource = new MatTableDataSource<Product>();

  isLoading: boolean = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private productService: ProductsService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private loadProducts(): void {
    this.isLoading = true;

    // Llama al servicio para obtener la lista de productos
    this.productService.getProducts().subscribe({
      next: (response) => {
        console.log('Respuesta de productos:', response);

        // Actualiza los datos de la tabla
        this.dataSource.data = response.products;

        // Detiene el indicador de carga
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar los productos:', error);
        this.isLoading = false;
      },
    });
  }
}
