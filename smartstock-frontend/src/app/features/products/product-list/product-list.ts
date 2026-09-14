import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../core/services/product';
import { AuthService } from '../../../core/services/auth.service';
import { Product } from '../../../core/models/product.model';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ProductFormComponent } from '../components/product-form/product-form';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/input';
import { MatInputModule } from '@angular/material/input';
import { StockAdjustComponent } from '../components/stock-adjust/stock-adjust';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatCardModule, MatPaginatorModule, MatIconModule, MatButtonModule, MatDialogModule, MatFormField, MatLabel, MatInputModule],
  template: `
    <mat-card>
      <mat-card-header><mat-card-title>Inventario de Productos</mat-card-title></mat-card-header>

      @if (canManageProducts()) {
        <div class="header-actions" style="padding: 16px;">
          <button mat-raised-button color="primary" (click)="openCreateDialog()">+ Nuevo Producto</button>
        </div>
      }

      <mat-card-content>
        @if (operationError()) { <p class="operation-error">{{ operationError() }}</p> }

        <mat-form-field appearance="outline" style="width: 100%; margin-bottom: 10px;">
          <mat-label>Buscar productos (Nombre o SKU)...</mat-label>
          <input matInput (keyup)="onSearch($event)" placeholder="Ej: Tornillo" />
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>

        <div class="dashboard-widgets" style="display: flex; gap: 20px; margin-bottom: 20px;">
          <mat-card style="flex: 1; background-color: #e3f2fd;"><mat-card-content><div>STOCK TOTAL</div><strong>{{ globalStats().total_stock }} un.</strong></mat-card-content></mat-card>
          <mat-card style="flex: 1; background-color: #f1f8e9;"><mat-card-content><div>VALOR INVENTARIO</div><strong>{{ globalStats().inventory_value | currency }}</strong></mat-card-content></mat-card>
          <mat-card (click)="toggleLowStockFilter()" [style.background-color]="onlyLowStock() ? '#ffcdd2' : '#fff3e0'" style="flex: 1; cursor: pointer;">
            <mat-card-content><div>{{ onlyLowStock() ? 'VIENDO SOLO ALERTAS' : 'ALERTAS ACTIVAS' }}</div><strong>{{ globalStats().active_alerts }}</strong></mat-card-content>
          </mat-card>
        </div>

        <table mat-table [dataSource]="products()" class="mat-elevation-z8">
          <ng-container matColumnDef="sku"><th mat-header-cell *matHeaderCellDef>SKU</th><td mat-cell *matCellDef="let element">{{ element.sku }}</td></ng-container>
          <ng-container matColumnDef="name"><th mat-header-cell *matHeaderCellDef>Nombre</th><td mat-cell *matCellDef="let element">{{ element.name }}</td></ng-container>
          <ng-container matColumnDef="price"><th mat-header-cell *matHeaderCellDef>Precio</th><td mat-cell *matCellDef="let element">{{ element.price | currency }}</td></ng-container>
          <ng-container matColumnDef="stock"><th mat-header-cell *matHeaderCellDef>Stock</th><td mat-cell *matCellDef="let element"><span [class.low-stock-text]="element.is_low_stock">{{ element.stock }} @if (element.is_low_stock) { <mat-icon style="font-size: 16px; vertical-align: middle;">warning</mat-icon> }</span></td></ng-container>

          @if (canManageProducts()) {
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Acciones</th>
              <td mat-cell *matCellDef="let element">
                <button mat-icon-button color="accent" (click)="openEditDialog(element)" title="Editar producto"><mat-icon>edit</mat-icon></button>
                @if (canDeleteProducts()) { <button mat-icon-button color="warn" (click)="deleteProduct(element.id)" title="Eliminar producto"><mat-icon>delete</mat-icon></button> }
                <button mat-icon-button color="primary" (click)="openAdjustStockDialog(element)" title="Registrar movimiento"><mat-icon>swap_vert</mat-icon></button>
              </td>
            </ng-container>
          }

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns" [style.background-color]="row.is_low_stock ? '#ffebee' : null" [style.color]="row.is_low_stock ? '#d32f2f' : null"></tr>
        </table>
        <mat-paginator [length]="totalProducts()" [pageSize]="10" (page)="onPageChange($event)"></mat-paginator>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`table { width: 100%; margin-top: 20px; } mat-card { margin: 20px; } mat-paginator { margin-top: 10px; } .header-actions { display: flex; justify-content: flex-end; } .operation-error { color: #b3261e; margin: 0 0 16px; }`],
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);

  currentSearch = signal('');
  products = signal<Product[]>([]);
  totalProducts = signal(0);
  onlyLowStock = signal(false);
  operationError = signal<string | null>(null);
  globalStats = signal({ inventory_value: 0, total_stock: 0, active_alerts: 0 });

  canManageProducts = () => this.authService.hasRole('Admin', 'Staff');
  canDeleteProducts = () => this.authService.hasRole('Admin');
  get displayedColumns(): string[] { return this.canManageProducts() ? ['sku', 'name', 'price', 'stock', 'actions'] : ['sku', 'name', 'price', 'stock']; }

  ngOnInit() { this.loadPage(1); this.loadStats(); }
  loadPage(page: number) { this.productService.getProducts(page, this.currentSearch(), this.onlyLowStock()).subscribe({ next: (response: any) => { this.products.set(response.results); this.totalProducts.set(response.count); } }); }
  loadStats() { this.productService.getStats().subscribe({ next: (data) => this.globalStats.set(data), error: () => this.operationError.set('No se pudieron cargar las estadísticas.') }); }
  toggleLowStockFilter() { this.onlyLowStock.update((value) => !value); this.loadPage(1); }
  onSearch(event: Event) { this.currentSearch.set((event.target as HTMLInputElement).value); this.loadPage(1); }
  onPageChange(event: PageEvent) { this.loadPage(event.pageIndex + 1); }

  openCreateDialog() { if (!this.canManageProducts()) return; const ref = this.dialog.open(ProductFormComponent, { width: '400px', data: null }); ref.afterClosed().subscribe((result) => { if (result) { this.loadPage(1); this.loadStats(); } }); }
  openEditDialog(product: Product) { if (!this.canManageProducts()) return; const ref = this.dialog.open(ProductFormComponent, { width: '400px', data: product }); ref.afterClosed().subscribe((result) => { if (result) { this.loadPage(1); this.loadStats(); } }); }
  deleteProduct(id: number) { if (!this.canDeleteProducts()) return; if (confirm('¿Estás seguro de borrar este producto?')) { this.productService.deleteProduct(id).subscribe({ next: () => { this.operationError.set(null); this.loadPage(1); this.loadStats(); }, error: () => this.operationError.set('No se pudo eliminar el producto.') }); } }
  openAdjustStockDialog(product: Product) { if (!this.canManageProducts()) return; const ref = this.dialog.open(StockAdjustComponent, { width: '350px', data: product }); ref.afterClosed().subscribe((result) => { if (!result) return; this.operationError.set(null); this.productService.createInventoryMovement({ product: product.id!, movement_type: result.movement_type, quantity: result.quantity, note: result.note }).subscribe({ next: () => { this.loadPage(1); this.loadStats(); }, error: (err) => this.operationError.set(err?.error?.non_field_errors?.[0] ?? err?.error?.detail ?? 'No se pudo registrar el movimiento de inventario.') }); }); }
}
