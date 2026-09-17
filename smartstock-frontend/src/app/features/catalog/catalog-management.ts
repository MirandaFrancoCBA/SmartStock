import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ProductService } from '../../core/services/product';
import { AuthService } from '../../core/services/auth.service';
import { Category, Supplier } from '../../core/models/catalog.model';

@Component({
  selector: 'app-catalog-management',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule, MatInputModule],
  template: `
    <section class="catalog-page">
      <header class="page-header">
        <div>
          <span class="eyebrow">Configuración</span>
          <h1>Catálogo</h1>
          <p>Organizá las categorías y proveedores que estructuran tu inventario.</p>
        </div>
        <div class="catalog-summary" aria-label="Resumen de catálogo">
          <span><strong>{{ categories().length }}</strong> categorías</span>
          <span><strong>{{ suppliers().length }}</strong> proveedores</span>
        </div>
      </header>

      @if (error()) {
        <div class="feedback error" role="alert">
          <mat-icon>error_outline</mat-icon><span>{{ error() }}</span>
          <button mat-icon-button aria-label="Cerrar mensaje" (click)="error.set(null)"><mat-icon>close</mat-icon></button>
        </div>
      }

      <div class="catalog-grid">
        <mat-card class="catalog-card">
          <mat-card-header>
            <div mat-card-avatar class="section-icon"><mat-icon>category</mat-icon></div>
            <mat-card-title>Categorías</mat-card-title>
            <mat-card-subtitle>Agrupá productos para encontrarlos y administrarlos mejor.</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            @if (canEdit()) {
              <section class="editor" [class.editing]="editingCategoryId">
                <div class="editor-heading"><strong>{{ editingCategoryId ? 'Editar categoría' : 'Nueva categoría' }}</strong><span>{{ editingCategoryId ? 'Actualizá los datos seleccionados.' : 'Creá una clasificación para tus productos.' }}</span></div>
                <div class="form-grid">
                  <mat-form-field appearance="outline" subscriptSizing="dynamic"><mat-label>Nombre</mat-label><input matInput [(ngModel)]="categoryName" /><mat-icon matSuffix>label</mat-icon></mat-form-field>
                  <mat-form-field appearance="outline" subscriptSizing="dynamic"><mat-label>Descripción</mat-label><input matInput [(ngModel)]="categoryDescription" /></mat-form-field>
                </div>
                <div class="actions">
                  <button mat-flat-button class="primary-action" (click)="saveCategory()" [disabled]="!categoryName.trim()"><mat-icon>{{ editingCategoryId ? 'save' : 'add' }}</mat-icon>{{ editingCategoryId ? 'Guardar cambios' : 'Agregar categoría' }}</button>
                  @if (editingCategoryId) { <button mat-button (click)="resetCategoryForm()">Cancelar</button> }
                </div>
              </section>
            }

            <div class="list" aria-label="Categorías registradas">
              @for (category of categories(); track category.id) {
                <article class="catalog-row">
                  <div class="row-icon"><mat-icon>sell</mat-icon></div>
                  <div class="row-copy"><strong>{{ category.name }}</strong><span>{{ category.description || 'Sin descripción' }}</span></div>
                  @if (canEdit()) {
                    <div class="row-actions">
                      <button mat-icon-button (click)="editCategory(category)" aria-label="Editar categoría" title="Editar"><mat-icon>edit</mat-icon></button>
                      @if (canDelete()) { <button mat-icon-button class="danger-action" (click)="removeCategory(category)" aria-label="Eliminar categoría" title="Eliminar"><mat-icon>delete</mat-icon></button> }
                    </div>
                  }
                </article>
              } @empty {
                <div class="empty-state"><mat-icon>category</mat-icon><div><strong>Sin categorías</strong><span>Cuando registres una categoría aparecerá aquí.</span></div></div>
              }
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="catalog-card">
          <mat-card-header>
            <div mat-card-avatar class="section-icon"><mat-icon>local_shipping</mat-icon></div>
            <mat-card-title>Proveedores</mat-card-title>
            <mat-card-subtitle>Mantené a mano los datos de quienes abastecen el inventario.</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            @if (canEdit()) {
              <section class="editor" [class.editing]="editingSupplierId">
                <div class="editor-heading"><strong>{{ editingSupplierId ? 'Editar proveedor' : 'Nuevo proveedor' }}</strong><span>{{ editingSupplierId ? 'Actualizá la información de contacto.' : 'Registrá un proveedor para asociarlo a productos.' }}</span></div>
                <div class="form-grid supplier-form">
                  <mat-form-field appearance="outline" subscriptSizing="dynamic"><mat-label>Nombre</mat-label><input matInput [(ngModel)]="supplierName" /><mat-icon matSuffix>business</mat-icon></mat-form-field>
                  <mat-form-field appearance="outline" subscriptSizing="dynamic"><mat-label>Email</mat-label><input matInput type="email" [(ngModel)]="supplierEmail" /><mat-icon matSuffix>mail</mat-icon></mat-form-field>
                  <mat-form-field appearance="outline" subscriptSizing="dynamic"><mat-label>Teléfono</mat-label><input matInput [(ngModel)]="supplierPhone" /><mat-icon matSuffix>phone</mat-icon></mat-form-field>
                </div>
                <div class="actions">
                  <button mat-flat-button class="primary-action" (click)="saveSupplier()" [disabled]="!supplierName.trim()"><mat-icon>{{ editingSupplierId ? 'save' : 'add' }}</mat-icon>{{ editingSupplierId ? 'Guardar cambios' : 'Agregar proveedor' }}</button>
                  @if (editingSupplierId) { <button mat-button (click)="resetSupplierForm()">Cancelar</button> }
                </div>
              </section>
            }

            <div class="list" aria-label="Proveedores registrados">
              @for (supplier of suppliers(); track supplier.id) {
                <article class="catalog-row">
                  <div class="row-icon"><mat-icon>storefront</mat-icon></div>
                  <div class="row-copy"><strong>{{ supplier.name }}</strong><span>{{ supplier.email || 'Sin email' }} · {{ supplier.phone || 'Sin teléfono' }}</span></div>
                  @if (canEdit()) {
                    <div class="row-actions">
                      <button mat-icon-button (click)="editSupplier(supplier)" aria-label="Editar proveedor" title="Editar"><mat-icon>edit</mat-icon></button>
                      @if (canDelete()) { <button mat-icon-button class="danger-action" (click)="removeSupplier(supplier)" aria-label="Eliminar proveedor" title="Eliminar"><mat-icon>delete</mat-icon></button> }
                    </div>
                  }
                </article>
              } @empty {
                <div class="empty-state"><mat-icon>local_shipping</mat-icon><div><strong>Sin proveedores</strong><span>Cuando registres un proveedor aparecerá aquí.</span></div></div>
              }
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .catalog-page { display: flex; flex-direction: column; gap: 22px; }
    .page-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; }
    .eyebrow { display: block; margin-bottom: 8px; color: var(--smartstock-accent-strong); font-size: .76rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }
    h1 { margin: 0; font-size: clamp(1.8rem, 3vw, 2.35rem); line-height: 1.1; letter-spacing: -.035em; }
    .page-header p { margin: 10px 0 0; color: var(--smartstock-muted); font-size: .98rem; }
    .catalog-summary { display: flex; gap: 8px; flex-wrap: wrap; }
    .catalog-summary span { padding: 8px 11px; border: 1px solid var(--smartstock-border); border-radius: 999px; background: var(--smartstock-surface); color: var(--smartstock-muted); font-size: .76rem; }
    .catalog-summary strong { color: var(--smartstock-accent-strong); }
    .catalog-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; align-items: start; }
    mat-card { border: 1px solid var(--smartstock-border); border-radius: var(--smartstock-radius); box-shadow: none; background: var(--smartstock-surface); }
    .catalog-card mat-card-header { padding: 22px 22px 10px; }
    .catalog-card mat-card-content { padding: 10px 22px 20px; }
    .section-icon, .row-icon { display: grid; place-items: center; background: var(--smartstock-accent-soft); color: var(--smartstock-accent-strong); }
    .section-icon { width: 42px; height: 42px; border-radius: 12px; }
    mat-card-title { font-size: 1.05rem; font-weight: 750; }
    mat-card-subtitle { margin-top: 3px; color: var(--smartstock-muted); font-size: .8rem; line-height: 1.4; }
    .editor { margin: 10px 0 18px; padding: 16px; border: 1px solid var(--smartstock-border); border-radius: 14px; background: var(--smartstock-page); }
    .editor.editing { border-color: var(--smartstock-accent); background: color-mix(in srgb, var(--smartstock-accent-soft) 45%, white); }
    .editor-heading { display: flex; flex-direction: column; gap: 3px; margin-bottom: 13px; }
    .editor-heading strong { font-size: .88rem; }
    .editor-heading span { color: var(--smartstock-muted); font-size: .76rem; }
    .form-grid { display: grid; grid-template-columns: minmax(0, .8fr) minmax(0, 1.2fr); gap: 10px; }
    .supplier-form { grid-template-columns: 1fr 1fr; }
    .supplier-form mat-form-field:first-child { grid-column: 1 / -1; }
    .actions, .row-actions { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
    .primary-action { background: var(--smartstock-accent-strong); color: white; }
    .list { display: grid; }
    .catalog-row { display: flex; align-items: center; gap: 11px; min-height: 64px; border-top: 1px solid var(--smartstock-border); }
    .row-icon { width: 32px; height: 32px; flex: 0 0 32px; border-radius: 9px; }
    .row-icon mat-icon { width: 17px; height: 17px; font-size: 17px; }
    .row-copy { display: flex; min-width: 0; flex: 1; flex-direction: column; gap: 3px; }
    .row-copy strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: .86rem; }
    .row-copy span { overflow: hidden; color: var(--smartstock-muted); font-size: .74rem; text-overflow: ellipsis; white-space: nowrap; }
    .row-actions { flex: 0 0 auto; }
    .row-actions button { color: var(--smartstock-muted); }
    .row-actions button:hover { color: var(--smartstock-accent-strong); }
    .row-actions .danger-action:hover { color: #a33b32; }
    .empty-state { display: flex; align-items: center; gap: 12px; margin-top: 8px; padding: 18px; border: 1px dashed var(--smartstock-border); border-radius: 13px; background: var(--smartstock-page); color: var(--smartstock-muted); }
    .empty-state > mat-icon { color: var(--smartstock-accent); }
    .empty-state div { display: flex; flex-direction: column; gap: 2px; }
    .empty-state strong { color: var(--mat-sys-on-surface); font-size: .84rem; }
    .empty-state span { font-size: .75rem; }
    .feedback { display: flex; align-items: center; gap: 10px; padding: 14px 16px; border-radius: 13px; }
    .feedback.error { border: 1px solid #efc6c2; background: #fff5f4; color: #a33b32; }
    .feedback span { flex: 1; font-size: .84rem; }
    @media (max-width: 1050px) { .catalog-grid { grid-template-columns: 1fr; } }
    @media (max-width: 650px) { .page-header { align-items: stretch; flex-direction: column; } .catalog-summary { align-self: flex-start; } .catalog-card mat-card-header { padding: 18px 18px 8px; } .catalog-card mat-card-content { padding: 8px 18px 16px; } .form-grid, .supplier-form { grid-template-columns: 1fr; } .supplier-form mat-form-field:first-child { grid-column: auto; } .catalog-row { align-items: flex-start; padding: 12px 0; } .row-actions { margin-left: auto; } }
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
  editCategory(category: Category) { this.editingCategoryId = category.id; this.categoryName = category.name; this.categoryDescription = category.description ?? ''; }
  resetCategoryForm() { this.editingCategoryId = null; this.categoryName = ''; this.categoryDescription = ''; }
  saveCategory() {
    if (!this.canEdit() || !this.categoryName.trim()) return;
    const payload = { name: this.categoryName.trim(), description: this.categoryDescription.trim() };
    const request = this.editingCategoryId ? this.productService.updateCategory(this.editingCategoryId, payload) : this.productService.createCategory(payload);
    request.subscribe({ next: () => { this.resetCategoryForm(); this.reload(); }, error: () => this.error.set('No se pudo guardar la categoría.') });
  }
  removeCategory(category: Category) {
    if (!this.canDelete() || !confirm(`¿Eliminar la categoría "${category.name}"?`)) return;
    this.productService.deleteCategory(category.id).subscribe({ next: () => this.reload(), error: () => this.error.set('No se pudo eliminar la categoría. Puede estar siendo usada por productos.') });
  }
  editSupplier(supplier: Supplier) { this.editingSupplierId = supplier.id; this.supplierName = supplier.name; this.supplierEmail = supplier.email ?? ''; this.supplierPhone = supplier.phone ?? ''; }
  resetSupplierForm() { this.editingSupplierId = null; this.supplierName = ''; this.supplierEmail = ''; this.supplierPhone = ''; }
  saveSupplier() {
    if (!this.canEdit() || !this.supplierName.trim()) return;
    const payload = { name: this.supplierName.trim(), email: this.supplierEmail.trim(), phone: this.supplierPhone.trim() };
    const request = this.editingSupplierId ? this.productService.updateSupplier(this.editingSupplierId, payload) : this.productService.createSupplier(payload);
    request.subscribe({ next: () => { this.resetSupplierForm(); this.reload(); }, error: () => this.error.set('No se pudo guardar el proveedor.') });
  }
  removeSupplier(supplier: Supplier) {
    if (!this.canDelete() || !confirm(`¿Eliminar el proveedor "${supplier.name}"?`)) return;
    this.productService.deleteSupplier(supplier.id).subscribe({ next: () => this.reload(), error: () => this.error.set('No se pudo eliminar el proveedor.') });
  }
}
