import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-update-inventory',
  standalone: true,
  imports: [],
  templateUrl: './update-inventory.component.html',
  styleUrl: './update-inventory.component.css'
})
export class UpdateInventoryComponent {
  inventoryForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.inventoryForm = this.fb.group({
      productCode: ['', [Validators.required]],
      quantity: [0, [Validators.required]],
      type: ['IN', [Validators.required]], // 'IN' para ingreso, 'OUT' para salida
      note: [''], // Nota interna
    });
  }

  onSubmit() {
    if (this.inventoryForm.valid) {
      const { productCode, quantity, type } = this.inventoryForm.value;
      if (type === 'IN') {
        console.log(`Ingreso de ${quantity} unidades del producto ${productCode}`);
      } else {
        console.log(`Salida de ${quantity} unidades del producto ${productCode}`);
      }
    } else {
      console.log('Formulario inválido');
    }
  }
}
