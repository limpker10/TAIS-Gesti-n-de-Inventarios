import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
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
  ],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.css',
})
export class AddProductComponent {
  
  productForm: FormGroup;

  categories: string[] = ['Electrónica', 'Ropa', 'Hogar', 'Deportes'];

  constructor(
    private fb: FormBuilder,
    private productsService: ProductsService,
    private snackBarService: SnackbarService
  ) {
    this.productForm = this.fb.group({
      // code: ['', [Validators.required]],
      name: ['', [Validators.required]],
      description: [''],
      quantity: [1, [Validators.required, Validators.min(0)]],
      unitPrice: [1, [Validators.required, Validators.min(0.10)]],
      category: ['', [Validators.required]],
    });
  }

  onSubmit() {
    if (this.productForm.valid) {
      // const newProduct = this.productForm.value;
      const newProduct: CreateProduct = {
        nombre: this.productForm.value.name,
        cantidad: this.productForm.value.quantity,
        categorias: this.productForm.value.category,
        descripcion: this.productForm.value.description || '',
        precio_unitario: this.productForm.value.unitPrice,
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
            "Error al crear producto'",
            3000,
            'error'
          );
          // console.error('Error al crear producto:', error);
        },
      });
      this.onClear();
      // console.log('Producto registrado:', newProduct);
    } else {
      console.log('Formulario inválido');
    }
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
}
