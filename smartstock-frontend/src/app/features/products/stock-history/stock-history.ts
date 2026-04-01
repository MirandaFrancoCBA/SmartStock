import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ProductService } from '../../../core/services/product';

@Component({
  selector: 'app-stock-history',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatCardModule, MatIconModule],
  templateUrl: './stock-history.html',
  styleUrl: './stock-history.scss'
})
export class StockHistoryComponent implements OnInit {
  private productService = inject(ProductService);
  
  movements = signal<any[]>([]);
  displayedColumns: string[] = ['fecha', 'producto', 'usuario', 'tipo', 'cantidad', 'notas'];

  ngOnInit() {
    this.loadMovements();
  }

  loadMovements() {
    this.productService.getMovements().subscribe({
      next: (data: any) => {
        const results = Array.isArray(data) ? data : data.results;
        this.movements.set(results || []);
      },
      error: (err) => {
        console.error('Error al cargar historial:', err);
        this.movements.set([]); 
      }
    });
  }
}