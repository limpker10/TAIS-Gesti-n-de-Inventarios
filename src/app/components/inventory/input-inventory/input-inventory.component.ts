import { Component } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { map, Observable, startWith } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { ProductsService } from '../../products/services/products.service';
import { InventoryService } from '../../products/services/inventory/inventory.service';
import { SnackbarService } from '../../products/services/snackbar/snackbar.service';
import {
  Movimiento,
  Producto,
} from '../output-inventory/output-inventory.component';

@Component({
  selector: 'app-input-inventory',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    FormsModule,
    MatSelectModule,
    MatTableModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatAutocompleteModule,
    RouterLink,
    AsyncPipe,
  ],
  templateUrl: './input-inventory.component.html',
  styleUrl: './input-inventory.component.css',
})
export class InputInventoryComponent {
  // emailFormControl = new FormControl('', [Validators.required, Validators.min(1)]);
  myControl = new FormControl<string | Producto>('');
  options: Producto[] = [];
  filteredOptions!: Observable<Producto[]>;
  selectedUser: any;

  tableData: Producto[] = [];
  displayedColumns: string[] = [
    'codigo',
    'nombre',
    'cantidad',
    'precio_unitario',
    'total',
    'acciones',
  ];

  documentTypes: string[] = [
    'FACTURA_COMPRA',
    'NOTA_DEVOLUCION',
    'ORDEN_ENTRADA',
    'DONACION',
  ];

  users = [
    {
      tipo_usuario: 'PROVEEDOR',
      usuario_id: 'P-MAU-123456',
      estado: true,
      nombre: 'Mauricio Piero',
    },
    // { tipo_usuario: 'CLIENTE', usuario_id: 'C-JUA-123456', estado: true, nombre: 'Juan Carlos' },
  ];

  constructor(
    private productsService: ProductsService,
    private inventoryService: InventoryService,
    private snackBarService: SnackbarService
  ) {}
  // Formulario para el movimiento
  movimientoForm = new FormGroup({
    tipo_operacion: new FormControl({ value: 'INGRESO', disabled: true }, [
      Validators.required,
    ]),
    fecha_movimiento: new FormControl(
      { value: new Date().toISOString().substring(0, 10), disabled: true },
      [Validators.required]
    ),
    tipo_documento: new FormControl('', [Validators.required]),
    cliente_provedor: new FormControl(null, [Validators.required]),
    nota: new FormControl(''),
  });

  ngOnInit() {
    this.loadProducts(); // Carga los productos al inicializar el componente
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map((value) => {
        const nombre = typeof value === 'string' ? value : value?.nombre;
        return nombre ? this._filter(nombre as string) : this.options.slice();
      })
    );
  }

  loadProducts() {
    this.productsService.getProducts().subscribe((response) => {
      this.options = response.products.map((product) => ({
        codigo: product.Code, // Mapeo de `Code` como ID
        nombre: product.Name,
        cantidad: 0, // Inicializar cantidad
        precio_unitario: product.Price,
        total: 0, // Inicializar total
      }));
    });
  }

  displayFn(producto: Producto): string {
    return producto && producto.nombre ? producto.nombre : '';
  }

  private _filter(nombre: string): Producto[] {
    const filterValue = nombre.toLowerCase();
    return this.options.filter((option) =>
      option.nombre.toLowerCase().includes(filterValue)
    );
  }

  addToTable() {
    const selectedValue = this.myControl.value;
    const producto =
      typeof selectedValue === 'string'
        ? this.options.find((p) => p.nombre === selectedValue)
        : selectedValue;

    if (
      producto &&
      producto.nombre &&
      !this.tableData.some((p) => p.codigo === producto.codigo)
    ) {
      // Agregar producto a la tabla con datos inicializados
      this.tableData = [
        ...this.tableData,
        { ...producto, cantidad: 1, total: producto.precio_unitario },
      ];
      this.myControl.reset('');
    }
  }

  removeFromTable(producto: Producto) {
    this.tableData = this.tableData.filter((p) => p !== producto);
  }

  updateTotal(producto: Producto) {
    producto.total = producto.cantidad * producto.precio_unitario;
  }

  onSubmit() {
    if (this.movimientoForm.valid) {
      if (this.tableData.length === 0) {
        console.error(
          'Debe agregar al menos un producto para realizar el movimiento.'
        );
        alert('Debe agregar al menos un producto para realizar el movimiento.'); // Opcional: Mostrar alerta al usuario
        return; // Evitar que se procese el formulario
      }

      // Validar que todas las cantidades sean mayores a 0
      const invalidProducts = this.tableData.filter(
        (producto) => producto.cantidad <= 0
      );
      if (invalidProducts.length > 0) {
        alert('Todos los productos deben tener una cantidad válida mayor a 0.');
        return;
      }

      const movimiento: Movimiento = {
        tipo_operacion: this.movimientoForm.get('tipo_operacion')?.value as
          | 'INGRESO'
          | 'EGRESO', // Garantiza el tipo
        fecha_movimiento:
          this.movimientoForm.get('fecha_movimiento')?.value ?? '', // Proporciona un valor por defecto en caso de null
        nota: this.movimientoForm.get('nota')?.value || '', // Valor por defecto si no hay nota
        detalle_productos: this.tableData, // La tabla de productos
        tipo_documento: this.movimientoForm.get('tipo_documento')?.value ?? '',
        cliente_provedor:
          this.movimientoForm.get('cliente_provedor')?.value ?? '',
      };

      console.log('Formulario enviado:', movimiento);

      this.inventoryService.createRecord(movimiento).subscribe({
        next: (response) => {
          this.snackBarService.showCustom(
            'Movimiento creado con éxito',
            3000,
            'success'
          );
        },
        error: (error) => {
          this.snackBarService.showCustom(
            "Error al realizar movimiento de salida'",
            3000,
            'error'
          );
        },
      });

      // Reiniciar el formulario y la tabla después de enviar los datos
      this.movimientoForm.reset();
      this.tableData = [];

      // Reasignar la fecha actual al campo fecha_movimiento
      const today = new Date().toISOString().substring(0, 10);
      this.movimientoForm.patchValue({ fecha_movimiento: today });
    } else {
      console.error('Formulario inválido');
    }
  }

  onClienteProveedorChange(event: MatSelectChange): void {
    const selectedUser = event.value; // Aquí se obtiene el objeto seleccionado
    console.log('Usuario seleccionado:', selectedUser);

    // Si deseas realizar alguna acción adicional, como guardar el usuario seleccionado
    // en otro lugar del componente, puedes hacerlo aquí.
  }
}
