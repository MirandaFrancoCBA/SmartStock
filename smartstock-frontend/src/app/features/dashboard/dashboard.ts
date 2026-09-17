import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';
import { ProductService, StockReportItem } from '../../core/services/product';
import { InventoryMovement } from '../../core/models/inventory-movement.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <section class="dashboard">
      <header class="page-header">
        <div>
          <span class="eyebrow">Overview</span>
          <h1>Resumen de inventario</h1>
          <p>Una vista rápida del valor, las alertas y la actividad reciente.</p>
        </div>
        <button mat-stroked-button class="refresh-button" (click)="loadDashboard()" [disabled]="loading()">
          <mat-icon>refresh</mat-icon>
          Actualizar
        </button>
      </header>

      @if (loading()) {
        <div class="state-panel" role="status">
          <mat-spinner diameter="30"></mat-spinner>
          <div>
            <strong>Actualizando inventario</strong>
            <span>Estamos reuniendo las métricas más recientes.</span>
          </div>
        </div>
      } @else if (errorMessage()) {
        <div class="state-panel error-panel" role="alert">
          <mat-icon>error_outline</mat-icon>
          <div>
            <strong>No pudimos cargar el dashboard</strong>
            <span>{{ errorMessage() }}</span>
          </div>
          <button mat-button (click)="loadDashboard()">Reintentar</button>
        </div>
      } @else {
        <section class="stats-grid" aria-label="Métricas principales">
          <mat-card class="metric-card">
            <mat-card-content>
              <div class="metric-icon"><mat-icon>payments</mat-icon></div>
              <span class="metric-label">Valor de inventario</span>
              <strong>{{ inventoryValue() | currency }}</strong>
              <span class="metric-caption">Valor total del stock actual</span>
            </mat-card-content>
          </mat-card>

          <mat-card class="metric-card" [class.alert-card]="lowStockProducts().length > 0">
            <mat-card-content>
              <div class="metric-icon"><mat-icon>warning_amber</mat-icon></div>
              <span class="metric-label">Stock bajo</span>
              <strong>{{ lowStockProducts().length }}</strong>
              <span class="metric-caption">
                {{ lowStockProducts().length === 1 ? 'Producto requiere atención' : 'Productos requieren atención' }}
              </span>
            </mat-card-content>
          </mat-card>

          <mat-card class="metric-card">
            <mat-card-content>
              <div class="metric-icon"><mat-icon>swap_vert</mat-icon></div>
              <span class="metric-label">Actividad reciente</span>
              <strong>{{ recentMovements().length }}</strong>
              <span class="metric-caption">Movimientos disponibles en el resumen</span>
            </mat-card-content>
          </mat-card>
        </section>

        <section class="details-grid">
          <mat-card class="panel-card low-stock-panel">
            <mat-card-header>
              <div mat-card-avatar class="panel-icon alert-icon"><mat-icon>inventory</mat-icon></div>
              <mat-card-title>Alertas de stock</mat-card-title>
              <mat-card-subtitle>Productos en o debajo de su mínimo configurado</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              @if (lowStockProducts().length === 0) {
                <div class="empty-state compact">
                  <mat-icon>check_circle</mat-icon>
                  <div><strong>Todo en orden</strong><span>No hay productos con stock bajo.</span></div>
                </div>
              } @else {
                <ul class="data-list">
                  @for (product of lowStockProducts(); track product.id) {
                    <li>
                      <div class="item-copy">
                        <strong>{{ product.name }}</strong>
                        <span>Revisar disponibilidad</span>
                      </div>
                      <span class="stock-chip alert">{{ product.stock }} un.</span>
                    </li>
                  }
                </ul>
              }
            </mat-card-content>
          </mat-card>

          <mat-card class="panel-card">
            <mat-card-header>
              <div mat-card-avatar class="panel-icon"><mat-icon>leaderboard</mat-icon></div>
              <mat-card-title>Mayor stock</mat-card-title>
              <mat-card-subtitle>Productos con más unidades disponibles</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              @if (topProducts().length === 0) {
                <div class="empty-state compact">
                  <mat-icon>inventory_2</mat-icon>
                  <div><strong>Sin productos</strong><span>Todavía no hay stock para mostrar.</span></div>
                </div>
              } @else {
                <ul class="data-list ranked-list">
                  @for (product of topProducts(); track product.id; let index = $index) {
                    <li>
                      <span class="rank">{{ index + 1 }}</span>
                      <div class="item-copy"><strong>{{ product.name }}</strong><span>Disponible</span></div>
                      <span class="stock-chip">{{ product.stock }} un.</span>
                    </li>
                  }
                </ul>
              }
            </mat-card-content>
          </mat-card>
        </section>

        <mat-card class="panel-card movements-card">
          <mat-card-header>
            <div mat-card-avatar class="panel-icon"><mat-icon>history</mat-icon></div>
            <mat-card-title>Últimos movimientos</mat-card-title>
            <mat-card-subtitle>Actividad reciente registrada en el inventario</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            @if (recentMovements().length === 0) {
              <div class="empty-state">
                <mat-icon>history_toggle_off</mat-icon>
                <div><strong>Sin actividad reciente</strong><span>Los movimientos aparecerán aquí cuando se registren.</span></div>
              </div>
            } @else {
              <ul class="data-list movements-list">
                @for (movement of recentMovements(); track movement.id) {
                  <li>
                    <div class="movement-leading" [class.outgoing]="movement.movement_type === 'OUT'">
                      <mat-icon>{{ movement.movement_type === 'IN' ? 'south' : 'north' }}</mat-icon>
                    </div>
                    <div class="item-copy movement-copy">
                      <strong>{{ movement.product_name }}</strong>
                      <span>{{ movement.created_at | date:'short' }} · {{ movement.user_username || 'Sistema' }}</span>
                    </div>
                    <span class="movement-amount" [class.out]="movement.movement_type === 'OUT'">
                      {{ movement.movement_type === 'IN' ? '+' : '-' }}{{ movement.quantity }} un.
                    </span>
                  </li>
                }
              </ul>
            }
          </mat-card-content>
        </mat-card>
      }
    </section>
  `,
  styles: [`
    :host { display: block; }
    .dashboard { display: flex; flex-direction: column; gap: 24px; }
    .page-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; }
    .eyebrow { display: block; margin-bottom: 8px; color: var(--smartstock-accent-strong); font-size: .76rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }
    h1 { margin: 0; font-size: clamp(1.8rem, 3vw, 2.35rem); line-height: 1.1; letter-spacing: -.035em; }
    .page-header p { margin: 10px 0 0; color: var(--smartstock-muted); font-size: .98rem; }
    .refresh-button { min-height: 42px; border-color: var(--smartstock-border); }
    .stats-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
    mat-card { border: 1px solid var(--smartstock-border); border-radius: var(--smartstock-radius); box-shadow: none; background: var(--smartstock-surface); }
    .metric-card { position: relative; overflow: hidden; }
    .metric-card::after { position: absolute; inset: auto -35px -55px auto; width: 120px; height: 120px; border-radius: 50%; background: var(--smartstock-accent-soft); content: ''; opacity: .6; }
    .metric-card mat-card-content { position: relative; z-index: 1; display: grid; grid-template-columns: auto 1fr; align-items: center; gap: 5px 12px; padding: 22px; }
    .metric-icon, .panel-icon { display: grid; place-items: center; border-radius: 12px; background: var(--smartstock-accent-soft); color: var(--smartstock-accent-strong); }
    .metric-icon { grid-row: 1 / span 2; width: 44px; height: 44px; }
    .metric-label { color: var(--smartstock-muted); font-size: .82rem; font-weight: 700; }
    .metric-card strong { font-size: 1.75rem; line-height: 1.1; letter-spacing: -.03em; }
    .metric-caption { grid-column: 1 / -1; margin-top: 8px; color: var(--smartstock-muted); font-size: .78rem; }
    .metric-card.alert-card { border-color: color-mix(in srgb, #b26a00 35%, var(--smartstock-border)); }
    .alert-card .metric-icon { background: #fff1d6; color: #8a5100; }
    .details-grid { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, .95fr); gap: 16px; }
    .panel-card mat-card-header { padding: 22px 22px 10px; }
    .panel-card mat-card-content { padding: 8px 22px 18px; }
    .panel-icon { width: 40px; height: 40px; }
    .alert-icon { background: #fff1d6; color: #8a5100; }
    mat-card-title { font-size: 1rem; font-weight: 750; }
    mat-card-subtitle { margin-top: 3px; color: var(--smartstock-muted); font-size: .8rem; }
    .data-list { list-style: none; padding: 0; margin: 0; }
    .data-list li { display: flex; align-items: center; gap: 12px; min-height: 58px; border-bottom: 1px solid var(--smartstock-border); }
    .data-list li:last-child { border-bottom: 0; }
    .item-copy { display: flex; min-width: 0; flex: 1; flex-direction: column; gap: 3px; }
    .item-copy strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: .9rem; }
    .item-copy span { color: var(--smartstock-muted); font-size: .76rem; }
    .stock-chip { flex: 0 0 auto; padding: 6px 9px; border-radius: 999px; background: var(--smartstock-accent-soft); color: var(--smartstock-accent-strong); font-size: .76rem; font-weight: 800; }
    .stock-chip.alert { background: #fff1d6; color: #8a5100; }
    .rank { display: grid; width: 28px; height: 28px; flex: 0 0 28px; place-items: center; border-radius: 9px; background: var(--smartstock-page); color: var(--smartstock-muted); font-size: .75rem; font-weight: 800; }
    .movements-card { overflow: hidden; }
    .movement-leading { display: grid; width: 34px; height: 34px; flex: 0 0 34px; place-items: center; border-radius: 50%; background: var(--smartstock-accent-soft); color: var(--smartstock-accent-strong); }
    .movement-leading.outgoing { background: #fde9e7; color: #a33b32; }
    .movement-leading mat-icon { width: 18px; height: 18px; font-size: 18px; }
    .movement-amount { flex: 0 0 auto; color: var(--smartstock-accent-strong); font-size: .84rem; font-weight: 800; }
    .movement-amount.out { color: #a33b32; }
    .empty-state, .state-panel { display: flex; align-items: center; gap: 14px; padding: 24px; border: 1px dashed var(--smartstock-border); border-radius: 14px; background: var(--smartstock-page); color: var(--smartstock-muted); }
    .empty-state.compact { margin-top: 4px; padding: 18px; }
    .empty-state mat-icon { color: var(--smartstock-accent); }
    .empty-state div, .state-panel div { display: flex; flex: 1; flex-direction: column; gap: 3px; }
    .empty-state strong, .state-panel strong { color: var(--mat-sys-on-surface); font-size: .88rem; }
    .empty-state span, .state-panel span { font-size: .8rem; }
    .error-panel { border-style: solid; border-color: #efc6c2; background: #fff5f4; color: #a33b32; }
    .error-panel mat-icon { color: #a33b32; }
    @media (max-width: 900px) { .stats-grid { grid-template-columns: 1fr; } .details-grid { grid-template-columns: 1fr; } }
    @media (max-width: 600px) { .dashboard { gap: 18px; } .page-header { align-items: stretch; flex-direction: column; gap: 16px; } .refresh-button { align-self: flex-start; } .metric-card mat-card-content { padding: 18px; } .panel-card mat-card-header { padding: 18px 18px 8px; } .panel-card mat-card-content { padding: 6px 18px 14px; } .movement-copy span { white-space: normal; } }
  `],
})
export class DashboardComponent implements OnInit {
  private productService = inject(ProductService);

  loading = signal(true);
  errorMessage = signal<string | null>(null);
  inventoryValue = signal(0);
  lowStockProducts = signal<StockReportItem[]>([]);
  topProducts = signal<StockReportItem[]>([]);
  recentMovements = signal<InventoryMovement[]>([]);

  ngOnInit() { this.loadDashboard(); }

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
}
