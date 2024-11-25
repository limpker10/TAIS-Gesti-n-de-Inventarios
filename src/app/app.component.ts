import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterModule, RouterOutlet  } from '@angular/router';
import {MatListModule} from '@angular/material/list';
import {MatTabsModule} from '@angular/material/tabs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,RouterModule,MatListModule,MatTabsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Navegación Horizontal';

  tabs = [
    { path: '/products', label: 'Productos' },
    { path: '/inventory', label: 'Inventario' },
  ];
  selectedIndex = 0;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Detecta la ruta activa al iniciar
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Busca la pestaña activa basada en coincidencias parciales de rutas
        const index = this.tabs.findIndex((tab) => event.urlAfterRedirects.startsWith(tab.path));
        this.selectedIndex = index !== -1 ? index : 0;
      }
    });
  }

  onTabChange(index: number): void {
    // Navega a la ruta correspondiente cuando se selecciona una pestaña
    const tab = this.tabs[index];
    if (tab) {
      this.router.navigateByUrl(tab.path);
    }
  }
}
