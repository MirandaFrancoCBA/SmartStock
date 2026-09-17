import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductService } from '../../../core/services/product';
import { InventoryMovement } from '../../../core/models/inventory-movement.model';

@Component({
  selector: 'app-stock-history',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatCardModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './stock-history.html',
  styleUrl: './stock-history.scss'
})
export class StockHistoryComponent implements OnInit {
  private productService = inject(ProductService);
  movements = signal<InventoryMovement[]>([]);
  loading = signal(true);
  errorMessage = signal<string | null>(null);
  displayedColumns: string[] = ['fecha', 'producto', 'usuario', 'tipo', 'cantidad', 'notas'];

  ngOnInit() { this.loadMovements(); }

  loadMovements() {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.productService.getMovements().subscribe({
      next: (movements) => { this.movements.set(movements); this.loading.set(false); },
      error: () => { this.errorMessage.set('No se pudo cargar el historial de inventario.'); this.movements.set([]); this.loading.set(false); }
    });
  }
}
