import { Routes } from '@angular/router';

import { ListProductsComponent } from './components/products/list-products/list-products.component';
import { AddProductComponent } from './components/products/add-product/add-product.component';
import { UpdateInventoryComponent } from './components/inventory/update-inventory/update-inventory.component';
import { EditProductComponent } from './components/products/edit-product/edit-product.component';
import { ProductsComponent } from './components/products/products.component';
import { EntryInventoryComponent } from './components/inventory/entry -inventory/entry-inventory.component';


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
      {
        path: 'edit/:id',
        component: EditProductComponent, // Formulario para editar producto (si tienes un componente de edición)
      },
      // {
      //   path: 'details/:id',
      //   component: ProductDetailsComponent, // Detalles del producto (si tienes un componente de detalles)
      // },
    ],
  },
  {
    path: 'inventory',
    component: UpdateInventoryComponent, // Lista de productos
    
  },
  {
    path: 'entry',
    component: EntryInventoryComponent, // Formulario para editar producto (si tienes un componente de edición)
  },
  {
    path: '',
    redirectTo: 'products',
    pathMatch: 'full', // Redirección inicial
  },
];
