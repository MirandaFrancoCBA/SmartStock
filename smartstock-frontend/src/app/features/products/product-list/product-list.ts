import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h2>Listado de Productos</h2>
      <p>Próximamente: Tabla de inventario conectada a Django.</p>
    </div>
  `,
  styles: [`
    .container { padding: 20px; }
  `]
})
export class ProductListComponent {}