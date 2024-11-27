import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
@Component({
  selector: 'app-update-inventory',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './entry-inventory.component.html',
})


export class EntryInventoryComponent{
    formulario: FormGroup;
    tipo_documento:String[]=["Factura","Boleta"];
    opciones_categoria: String[]=['Verduras','Carnes','Cereales'];
    proveedor: String[]=['Montalvez','SantaCruz','Monaco'];
    
    tabla_datos: any[]=[{codigo:"xxx"},{codigo:"yyy"}];
   
    constructor(private fb: FormBuilder){
        this.formulario = this.fb.group({
            
            fecha: ['', Validators.required],
            proveedores: [[], Validators.required],
            tipodocumento:[[],Validators.required],
            
            datos: this.fb.array([]),


        });

    }
    get datos(): FormArray {
        return this.formulario.get('datos') as FormArray;
    }
    agregarRegistro() {
        this.datos.push(
          this.fb.group({
            codigo: [''],
            unidad: [''],
            cantidad: [''],
            costo:[''],
            total:['']
          })
        );
    }
    onSubmit(): void {
        if (this.formulario.valid) {
          console.log('Formulario enviado:', this.formulario.value);
        } else {
          console.log('El formulario no es válido.');
        }
    }
}