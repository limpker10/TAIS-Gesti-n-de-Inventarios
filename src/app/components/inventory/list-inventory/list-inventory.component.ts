import { Component } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InventoryService } from '../../products/services/inventory/inventory.service';
import { InventoryItem } from '../interfaces/IInventory';
import { PDFGenerator } from '../utils/pdf-generator.util';
@Component({
  selector: 'app-list-inventory',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    RouterLink,
    MatProgressSpinnerModule,
  ],
  templateUrl: './list-inventory.component.html',
  styleUrl: './list-inventory.component.css',
})
export class ListInventoryComponent {
  cargando: boolean = true;

  displayedColumns: string[] = [
    'documento_movimiento',
    'tipo_operacion',
    'detalle_productos',
    'fecha_movimiento',
    'nota',
    'acciones',
  ];
  dataSource: InventoryItem[] = [];

  constructor(private inventoryService: InventoryService) {}

  ngOnInit(): void {
    this.loadInventoryData();
  }

  loadInventoryData(): void {
    this.inventoryService.getInventoryData().subscribe(
      (data: InventoryItem[]) => {
        this.dataSource = data;
        this.cargando = false;
      },
      (error) => {
        console.error('Error al cargar los datos:', error);
        this.cargando = false;
      }
    );
  }

  // Método para formatear el detalle de productos
  formatProductDetails(details: any[]): string {
    return details.map((d) => `${d.nombre} (x${d.cantidad})`).join(', ');
  }

  editProduct(id: number): void {
    console.log('Edit product with ID:', id);
    // Lógica para editar producto
  }

  deleteProduct(id: number): void {
    console.log('Delete product with ID:', id);
    // Lógica para eliminar producto
  }

  // Método para llamar al generador de PDF
  generatePDF(item: InventoryItem): void {
    PDFGenerator.generatePDF(item);
  }
}
