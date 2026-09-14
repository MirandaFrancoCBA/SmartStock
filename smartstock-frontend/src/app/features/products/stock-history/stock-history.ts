import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ProductService } from '../../../core/services/product';
import { InventoryMovement } from '../../../core/models/inventory-movement.model';

@Component({
  selector: 'app-stock-history',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatCardModule, MatIconModule],
  templateUrl: './stock-history.html',
  styleUrl: './stock-history.scss'
})
export class StockHistoryComponent implements OnInit {
  private productService = inject(ProductService);
  
  movements = signal<InventoryMovement[]>([]);
  errorMessage = signal<string | null>(null);
  displayedColumns: string[] = ['fecha', 'producto', 'usuario', 'tipo', 'cantidad', 'notas'];

  ngOnInit() {
    this.loadMovements();
  }

  loadMovements() {
    this.errorMessage.set(null);
    this.productService.getMovements().subscribe({
      next: (movements) => this.movements.set(movements),
      error: () => {
        this.errorMessage.set('No se pudo cargar el historial de inventario.');
        this.movements.set([]);
      }
    });
  }
}
