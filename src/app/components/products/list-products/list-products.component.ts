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
import {MatFormFieldModule} from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
    MatFormFieldModule,
    FormsModule,
    MatInputModule
  ],
  templateUrl: './list-products.component.html',
  styleUrl: './list-products.component.css',
})

export class ListProductsComponent implements OnInit, AfterViewInit {
  filterValues = {
    category: '',
    minPrice: null,
    maxPrice: null,
    minQuantity: null,
  };
  // Columnas de la tabla
  displayedColumns: string[] = [
    'codigo',
    'nombre',
    'precio_unitario',
    'Category',
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
    this.dataSource.filterPredicate = (data: Product, filter: string) => {
      const filterObj = JSON.parse(filter);
  
      const matchesCategory = !filterObj.category || data.Category?.toLowerCase().includes(filterObj.category.toLowerCase());
      const matchesPrice =
        (!filterObj.minPrice || data.Price >= filterObj.minPrice) &&
        (!filterObj.maxPrice || data.Price <= filterObj.maxPrice);
      const matchesQuantity = !filterObj.minQuantity || data.Cantidad >= filterObj.minQuantity;
  
      return matchesCategory && matchesPrice && matchesQuantity;
    };
  
    this.loadProducts();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilters(): void {
    this.dataSource.filter = JSON.stringify(this.filterValues);
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

  clearFilters(): void {
    // Reinicia los valores de los filtros
    this.filterValues = {
      category: '',
      minPrice: null,
      maxPrice: null,
      minQuantity: null,
    };
  
    // Aplica los filtros actualizados (en este caso, sin filtros)
    this.applyFilters();
  }

  generateFilteredPDF(): void {
    const doc = new jsPDF();

    // Título del PDF
    doc.text('Lista de Productos', 14, 10);

    // Obtener los datos filtrados
    const filteredProducts = this.dataSource.data.filter((product) => {
      const matchesCategory = !this.filterValues.category || product.Category?.toLowerCase().includes(this.filterValues.category.toLowerCase());
      const matchesPrice =
        (!this.filterValues.minPrice || product.Price >= this.filterValues.minPrice) &&
        (!this.filterValues.maxPrice || product.Price <= this.filterValues.maxPrice);
      const matchesQuantity = !this.filterValues.minQuantity || product.Cantidad >= this.filterValues.minQuantity;

      return matchesCategory && matchesPrice && matchesQuantity;
    });

    // Convertir los datos filtrados en un formato para jsPDF
    const products = filteredProducts.map((product) => [
      product.Code,
      product.Name,
      product.Price,
      product.Category,
      product.Description,
      product.Cantidad,
    ]);

    // Agregar la tabla al PDF
    autoTable(doc, {
      head: [['Código', 'Nombre', 'Precio', 'Categoría', 'Descripción', 'Cantidad']],
      body: products,
      startY: 20, // Posición inicial de la tabla
    });

    // Descargar el PDF
    doc.save('lista_productos.pdf');
  }
  
}
