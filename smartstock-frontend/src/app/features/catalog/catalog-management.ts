import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ProductService } from '../../core/services/product';
import { AuthService } from '../../core/services/auth.service';
import { Category, Supplier } from '../../core/models/catalog.model';

@Component({
  selector: 'app-catalog-management',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule],
  template: `
    <div class="page">
      <h1>Catálogo</h1>
      <p class="subtitle">Administrá categorías y proveedores usados por los productos.</p>

      @if (error()) { <p class="error">{{ error() }}</p> }

      <div class="grid">
        <mat-card>
          <mat-card-header><mat-card-title>Categorías</mat-card-title></mat-card-header>
          <mat-card-content>
            @if (canEdit()) {
              <div class="form-grid">
                <mat-form-field appearance="outline"><mat-label>Nombre</mat-label><input matInput [(ngModel)]="categoryName" /></mat-form-field>
                <mat-form-field appearance="outline"><mat-label>Descripción</mat-label><input matInput [(ngModel)]="categoryDescription" /></mat-form-field>
                <div class="actions">
                  <button mat-raised-button color="primary" (click)="saveCategory()" [disabled]="!categoryName.trim()">{{ editingCategoryId ? 'Actualizar' : 'Agregar' }}</button>
                  @if (editingCategoryId) { <button mat-button (click)="resetCategoryForm()">Cancelar</button> }
                </div>
              </div>
            }

            <div class="list">
              @for (category of categories(); track category.id) {
                <div class="row">
                  <div><strong>{{ category.name }}</strong><small>{{ category.description || 'Sin descripción' }}</small></div>
                  @if (canEdit()) {
                    <div class="row-actions">
                      <button mat-button (click)="editCategory(category)">Editar</button>
                      @if (canDelete()) { <button mat-button color="warn" (click)="removeCategory(category)">Eliminar</button> }
                    </div>
                  }
                </div>
              } @empty { <p>No hay categorías cargadas.</p> }
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header><mat-card-title>Proveedores</mat-card-title></mat-card-header>
          <mat-card-content>
            @if (canEdit()) {
              <div class="form-grid">
                <mat-form-field appearance="outline"><mat-label>Nombre</mat-label><input matInput [(ngModel)]="supplierName" /></mat-form-field>
                <mat-form-field appearance="outline"><mat-label>Email</mat-label><input matInput type="email" [(ngModel)]="supplierEmail" /></mat-form-field>
                <mat-form-field appearance="outline"><mat-label>Teléfono</mat-label><input matInput [(ngModel)]="supplierPhone" /></mat-form-field>
                <div class="actions">
                  <button mat-raised-button color="primary" (click)="saveSupplier()" [disabled]="!supplierName.trim()">{{ editingSupplierId ? 'Actualizar' : 'Agregar' }}</button>
                  @if (editingSupplierId) { <button mat-button (click)="resetSupplierForm()">Cancelar</button> }
                </div>
              </div>
            }

            <div class="list">
              @for (supplier of suppliers(); track supplier.id) {
                <div class="row">
                  <div><strong>{{ supplier.name }}</strong><small>{{ supplier.email || 'Sin email' }} · {{ supplier.phone || 'Sin teléfono' }}</small></div>
                  @if (canEdit()) {
                    <div class="row-actions">
                      <button mat-button (click)="editSupplier(supplier)">Editar</button>
                      @if (canDelete()) { <button mat-button color="warn" (click)="removeSupplier(supplier)">Eliminar</button> }
                    </div>
                  }
                </div>
              } @empty { <p>No hay proveedores cargados.</p> }
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 8px; }
    .subtitle { color: #666; margin-top: -8px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; }
    .form-grid { display: grid; gap: 8px; margin: 16px 0; }
    .actions, .row-actions { display: flex; gap: 8px; flex-wrap: wrap; }
    .list { display: grid; gap: 10px; }
    .row { display: flex; justify-content: space-between; align-items: center; gap: 12px; border-top: 1px solid #eee; padding: 10px 0; }
    .row div:first-child { display: grid; gap: 4px; }
    small { color: #666; }
    .error { color: #b3261e; }
  `]
})
export class CatalogManagementComponent implements OnInit {
  private productService = inject(ProductService);
  private authService = inject(AuthService);

  categories = signal<Category[]>([]);
  suppliers = signal<Supplier[]>([]);
  error = signal<string | null>(null);

  editingCategoryId: number | null = null;
  categoryName = '';
  categoryDescription = '';
  editingSupplierId: number | null = null;
  supplierName = '';
  supplierEmail = '';
  supplierPhone = '';

  canEdit = () => this.authService.hasRole('Admin', 'Staff');
  canDelete = () => this.authService.hasRole('Admin');

  ngOnInit() { this.reload(); }

  reload() {
    this.error.set(null);
    this.productService.getCategories().subscribe({ next: (items) => this.categories.set(items), error: () => this.error.set('No se pudieron cargar las categorías.') });
    this.productService.getSuppliers().subscribe({ next: (items) => this.suppliers.set(items), error: () => this.error.set('No se pudieron cargar los proveedores.') });
  }

  editCategory(category: Category) {
    this.editingCategoryId = category.id;
    this.categoryName = category.name;
    this.categoryDescription = category.description ?? '';
  }

  resetCategoryForm() { this.editingCategoryId = null; this.categoryName = ''; this.categoryDescription = ''; }

  saveCategory() {
    if (!this.canEdit() || !this.categoryName.trim()) return;
    const payload = { name: this.categoryName.trim(), description: this.categoryDescription.trim() };
    const request = this.editingCategoryId
      ? this.productService.updateCategory(this.editingCategoryId, payload)
      : this.productService.createCategory(payload);
    request.subscribe({ next: () => { this.resetCategoryForm(); this.reload(); }, error: () => this.error.set('No se pudo guardar la categoría.') });
  }

  removeCategory(category: Category) {
    if (!this.canDelete() || !confirm(`¿Eliminar la categoría "${category.name}"?`)) return;
    this.productService.deleteCategory(category.id).subscribe({ next: () => this.reload(), error: () => this.error.set('No se pudo eliminar la categoría. Puede estar siendo usada por productos.') });
  }

  editSupplier(supplier: Supplier) {
    this.editingSupplierId = supplier.id;
    this.supplierName = supplier.name;
    this.supplierEmail = supplier.email ?? '';
    this.supplierPhone = supplier.phone ?? '';
  }

  resetSupplierForm() { this.editingSupplierId = null; this.supplierName = ''; this.supplierEmail = ''; this.supplierPhone = ''; }

  saveSupplier() {
    if (!this.canEdit() || !this.supplierName.trim()) return;
    const payload = { name: this.supplierName.trim(), email: this.supplierEmail.trim(), phone: this.supplierPhone.trim() };
    const request = this.editingSupplierId
      ? this.productService.updateSupplier(this.editingSupplierId, payload)
      : this.productService.createSupplier(payload);
    request.subscribe({ next: () => { this.resetSupplierForm(); this.reload(); }, error: () => this.error.set('No se pudo guardar el proveedor.') });
  }

  removeSupplier(supplier: Supplier) {
    if (!this.canDelete() || !confirm(`¿Eliminar el proveedor "${supplier.name}"?`)) return;
    this.productService.deleteSupplier(supplier.id).subscribe({ next: () => this.reload(), error: () => this.error.set('No se pudo eliminar el proveedor.') });
  }
}
