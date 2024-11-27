import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { ProductsService } from '../services/products.service';
import { SnackbarService } from '../services/snackbar/snackbar.service';
import { CreateProduct } from '../interfaces/IProducts';
import { CategoriasService } from '../services/categorias/categorias.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    FormsModule,
    MatSelectModule,
    MatButtonModule,
    RouterLink,
    MatProgressSpinnerModule,
  ],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.css',
})
export class AddProductComponent {
  cargando: boolean = false;

  productForm: FormGroup;

  categorias: any[] = [];

  constructor(
    private fb: FormBuilder,
    private productsService: ProductsService,
    private snackBarService: SnackbarService,
    private categoriaSerive: CategoriasService
  ) {
    this.productForm = this.fb.group(
      {
        // code: ['', [Validators.required]],
        name: ['', [Validators.required]],
        description: [''],
        quantity: [1, [Validators.required, Validators.min(0)]],
        unitPrice: [1, [Validators.required, Validators.min(0.1)]],
        category: ['', Validators.required],
        precio_venta: ['', [Validators.required, Validators.min(0.1)]],
      },
      {
        validators: [this.precioVentaMayorQueUnitPrice],
      }
    );
  }
  ngOnInit(): void {
    this.loadCategorias();
  }

  onSubmit() {
    if (this.productForm.valid) {
      this.cargando = true;
      // const newProduct = this.productForm.value;
      const newProduct: CreateProduct = {
        nombre: this.productForm.value.name,
        cantidad: this.productForm.value.quantity,
        categorias: this.productForm.value.category,
        descripcion: this.productForm.value.description || '',
        precio_unitario: this.productForm.value.unitPrice,
        precio_venta: this.productForm.value.precio_venta,
      };
      // Lógica para registrar el producto, verificando duplicados
      this.productsService.createProduct(newProduct).subscribe({
        next: (response) => {
          this.snackBarService.showCustom(
            "Producto creado exitosamente'",
            3000,
            'success'
          );
          // console.log('Producto creado exitosamente:', response);
        },
        error: (error) => {
          this.snackBarService.showCustom(
            `Error al crear producto' ${error.error.message}`,
            3000,
            'error'
          );
          // console.error('Error al crear producto:', error);
        },
      });
      this.cargando = false;
      this.onClear();
      // console.log('Producto registrado:', newProduct);
    } else {
      console.log('Formulario inválido');
    }
  }

  loadCategorias(): void {
    this.categoriaSerive.getCategorias().subscribe((data) => {
      console.log(data);
      this.categorias = data;
    });
  }

  onClear() {
    this.productForm.reset({
      name: '',
      description: '',
      quantity: 1,
      unitPrice: 1,
      category: '',
    });
  }

  // Custom Validator
  precioVentaMayorQueUnitPrice(formGroup: FormGroup) {
    const unitPrice = formGroup.get('unitPrice')?.value;
    const precioVenta = formGroup.get('precio_venta')?.value;

    return precioVenta >= unitPrice
      ? null
      : { precioVentaMenorQueUnitPrice: true };
  }
}
