import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import {
  ProductService,
  StockReportItem,
} from '../../core/services/product';
import { InventoryMovement } from '../../core/models/inventory-movement.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatToolbarModule, MatCardModule],
  template: `
    <mat-toolbar color="primary">
      <span>SmartStock - Panel de Control</span>
      <span class="spacer"></span>
      <button mat-button (click)="logout()">Cerrar Sesión</button>
    </mat-toolbar>

    <main class="content">
      <div class="header-row">
        <div>
          <h1>Resumen de inventario</h1>
          <p>Estado actual de stock y actividad reciente.</p>
        </div>
        <button mat-stroked-button (click)="loadDashboard()">Actualizar</button>
      </div>

      @if (loading()) {
        <p>Cargando métricas...</p>
      }

      @if (errorMessage()) {
        <p class="error">{{ errorMessage() }}</p>
      }

      <section class="stats-grid">
        <mat-card>
          <mat-card-content>
            <span class="label">Valor de inventario</span>
            <strong>{{ inventoryValue() | currency }}</strong>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-content>
            <span class="label">Productos con stock bajo</span>
            <strong>{{ lowStockProducts().length }}</strong>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-content>
            <span class="label">Movimientos recientes</span>
            <strong>{{ recentMovements().length }}</strong>
          </mat-card-content>
        </mat-card>
      </section>

      <section class="details-grid">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Stock bajo</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            @if (lowStockProducts().length === 0) {
              <p class="muted">No hay productos en alerta.</p>
            } @else {
              <ul class="data-list">
                @for (product of lowStockProducts(); track product.id) {
                  <li>
                    <span>{{ product.name }}</span>
                    <strong>{{ product.stock }} un.</strong>
                  </li>
                }
              </ul>
            }
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-card-title>Mayor stock</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            @if (topProducts().length === 0) {
              <p class="muted">No hay productos para mostrar.</p>
            } @else {
              <ul class="data-list">
                @for (product of topProducts(); track product.id) {
                  <li>
                    <span>{{ product.name }}</span>
                    <strong>{{ product.stock }} un.</strong>
                  </li>
                }
              </ul>
            }
          </mat-card-content>
        </mat-card>
      </section>

      <mat-card class="movements-card">
        <mat-card-header>
          <mat-card-title>Últimos movimientos</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          @if (recentMovements().length === 0) {
            <p class="muted">No hay movimientos registrados.</p>
          } @else {
            <ul class="data-list movements-list">
              @for (movement of recentMovements(); track movement.id) {
                <li>
                  <div>
                    <strong>{{ movement.product_name }}</strong>
                    <span class="movement-meta">
                      {{ movement.created_at | date:'short' }} · {{ movement.user_username || 'Sistema' }}
                    </span>
                  </div>
                  <strong [class.out]="movement.movement_type === 'OUT'">
                    {{ movement.movement_type === 'IN' ? '+' : '-' }}{{ movement.quantity }}
                  </strong>
                </li>
              }
            </ul>
          }
        </mat-card-content>
      </mat-card>
    </main>
  `,
  styles: [`
    .spacer { flex: 1 1 auto; }
    .content { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .header-row { display: flex; justify-content: space-between; gap: 16px; align-items: center; }
    .header-row h1 { margin-bottom: 4px; }
    .header-row p { margin-top: 0; color: #666; }
    .stats-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; margin: 24px 0; }
    .stats-grid mat-card-content { display: flex; flex-direction: column; gap: 8px; }
    .stats-grid strong { font-size: 1.7rem; }
    .label { color: #666; font-size: 0.9rem; }
    .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .movements-card { margin-top: 16px; }
    .data-list { list-style: none; padding: 0; margin: 0; }
    .data-list li { display: flex; justify-content: space-between; gap: 16px; padding: 10px 0; border-bottom: 1px solid #eee; }
    .data-list li:last-child { border-bottom: 0; }
    .movements-list li > div { display: flex; flex-direction: column; gap: 4px; }
    .movement-meta { color: #666; font-size: 0.85rem; }
    .out { color: #b3261e; }
    .muted { color: #777; }
    .error { color: #b3261e; }
    @media (max-width: 800px) {
      .stats-grid, .details-grid { grid-template-columns: 1fr; }
      .header-row { align-items: flex-start; flex-direction: column; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private productService = inject(ProductService);
  private router = inject(Router);

  loading = signal(true);
  errorMessage = signal<string | null>(null);
  inventoryValue = signal(0);
  lowStockProducts = signal<StockReportItem[]>([]);
  topProducts = signal<StockReportItem[]>([]);
  recentMovements = signal<InventoryMovement[]>([]);

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.loading.set(true);
    this.errorMessage.set(null);

    forkJoin({
      inventoryValue: this.productService.getInventoryValueReport(),
      lowStock: this.productService.getLowStockReport(),
      topProducts: this.productService.getTopProductsReport(),
      recentMovements: this.productService.getRecentMovements(),
    }).subscribe({
      next: ({ inventoryValue, lowStock, topProducts, recentMovements }) => {
        this.inventoryValue.set(inventoryValue.total_inventory_value ?? 0);
        this.lowStockProducts.set(lowStock);
        this.topProducts.set(topProducts);
        this.recentMovements.set(recentMovements);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudo cargar el resumen del inventario.');
        this.loading.set(false);
      },
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}