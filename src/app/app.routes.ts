import { Routes } from '@angular/router';

import { ListProductsComponent } from './components/products/list-products/list-products.component';
import { AddProductComponent } from './components/products/add-product/add-product.component';
import { ProductsComponent } from './components/products/products.component';
import { ListInventoryComponent } from './components/inventory/list-inventory/list-inventory.component';
import { InventoryComponent } from './components/inventory/inventory.component';
import { OutputInventoryComponent } from './components/inventory/output-inventory/output-inventory.component';
import { InputInventoryComponent } from './components/inventory/input-inventory/input-inventory.component';
import { ReportsComponent } from './components/reports/reports.component';

export const routes: Routes = [
  {
    path: 'products',
    component: ProductsComponent, // Lista de productos
    children: [
      {
        path: '',
        component: ListProductsComponent, // Formulario para agregar producto
      },
      {
        path: 'add',
        component: AddProductComponent, // Formulario para agregar producto
      },
     
    ],
  },
  {
    path: 'inventory',
    component: InventoryComponent, // Lista de productos
    children: [
      {
        path: '',
        component: ListInventoryComponent, // Formulario para agregar producto
      },
      // {
      //   path: '',
      //   component: OutputInventoryComponent, // Formulario para agregar producto
      // },
      {
        path: 'input',
        component: InputInventoryComponent, // Formulario para agregar producto
      },
      {
        path: 'output',
        component: OutputInventoryComponent, // Formulario para editar producto (si tienes un componente de edición)
      },
      {
        path: 'reportes',
        component: ReportsComponent, // Lista de productos
      }
     
    ],
  },
 
 
  {
    path: '',
    redirectTo: 'products',
    pathMatch: 'full', // Redirección inicial
  },
];
