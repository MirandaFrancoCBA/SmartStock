import { Component, inject, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { forkJoin } from 'rxjs';
import { ProductService } from '../../../../core/services/product';
import { Product } from '../../../../core/models/product.model';
import { Category, Supplier } from '../../../../core/models/catalog.model';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSelectModule],
  template: `
    <div class="dialog-heading" mat-dialog-title>
      <div class="dialog-icon"><mat-icon>{{ data ? 'edit_note' : 'add_box' }}</mat-icon></div>
      <div><h2>{{ data ? 'Editar producto' : 'Nuevo producto' }}</h2><p>{{ data ? 'Actualizá la información del producto.' : 'Completá los datos para incorporarlo al inventario.' }}</p></div>
    </div>
    <mat-dialog-content [formGroup]="productForm">
      <div class="form-grid">
        <mat-form-field appearance="outline" subscriptSizing="dynamic"><mat-label>SKU</mat-label><input matInput formControlName="sku" placeholder="PROD-001" /><mat-icon matSuffix>tag</mat-icon></mat-form-field>
        <mat-form-field appearance="outline" subscriptSizing="dynamic"><mat-label>Nombre</mat-label><input matInput formControlName="name" /><mat-icon matSuffix>inventory_2</mat-icon></mat-form-field>
        <mat-form-field appearance="outline" subscriptSizing="dynamic"><mat-label>Categoría</mat-label><mat-select formControlName="category">@for (category of categories(); track category.id) { <mat-option [value]="category.id">{{ category.name }}</mat-option> }</mat-select></mat-form-field>
        <mat-form-field appearance="outline" subscriptSizing="dynamic"><mat-label>Proveedor</mat-label><mat-select formControlName="supplier">@for (supplier of suppliers(); track supplier.id) { <mat-option [value]="supplier.id">{{ supplier.name }}</mat-option> }</mat-select></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Precio</mat-label><input matInput type="number" formControlName="price" min="0.01" /><span matTextPrefix>$&nbsp;</span></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>{{ data ? 'Stock actual' : 'Stock inicial' }}</mat-label><input matInput type="number" formControlName="stock" [readonly]="!!data" min="0" />@if (data) { <mat-hint>Modificalo desde Registrar movimiento.</mat-hint> }</mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Stock mínimo para alerta</mat-label><input matInput type="number" formControlName="min_stock" min="0" /><mat-hint>Se marcará como stock bajo al alcanzar este valor.</mat-hint></mat-form-field>
      </div>
      @if (loadingCatalog()) { <div class="feedback neutral"><mat-icon>sync</mat-icon><span>Cargando categorías y proveedores…</span></div> }
      @if (catalogError()) { <div class="feedback error" role="alert"><mat-icon>error_outline</mat-icon><span>{{ catalogError() }}</span></div> }
      @if (!loadingCatalog() && (categories().length === 0 || suppliers().length === 0)) { <div class="feedback warning"><mat-icon>warning_amber</mat-icon><span>Necesitás al menos una categoría y un proveedor antes de guardar productos.</span></div> }
      @if (saveError()) { <div class="feedback error" role="alert"><mat-icon>error_outline</mat-icon><span>{{ saveError() }}</span></div> }
    </mat-dialog-content>
    <mat-dialog-actions align="end"><button mat-button (click)="onCancel()">Cancelar</button><button mat-flat-button class="primary-action" [disabled]="productForm.invalid || loadingCatalog() || categories().length === 0 || suppliers().length === 0" (click)="onSubmit()"><mat-icon>save</mat-icon>{{ data ? 'Guardar cambios' : 'Crear producto' }}</button></mat-dialog-actions>
  `,
  styles: [`
    .dialog-heading { display: flex; align-items: center; gap: 13px; padding-bottom: 10px; }
    .dialog-heading h2 { margin: 0; font-size: 1.2rem; }
    .dialog-heading p { margin: 3px 0 0; color: var(--smartstock-muted); font-size: .78rem; font-weight: 400; }
    .dialog-icon { display: grid; width: 42px; height: 42px; flex: 0 0 42px; place-items: center; border-radius: 12px; background: var(--smartstock-accent-soft); color: var(--smartstock-accent-strong); }
    mat-dialog-content { padding-top: 8px !important; overflow-x: hidden; }
    .form-grid { display: grid; grid-template-columns: 1fr; gap: 12px; min-width: 0; padding-top: 4px; }
    .form-grid mat-form-field { width: 100%; min-width: 0; }
    .feedback { display: flex; align-items: center; gap: 9px; margin-top: 10px; padding: 11px 13px; border-radius: 11px; font-size: .78rem; }
    .feedback mat-icon { flex: 0 0 auto; }
    .feedback.neutral { background: var(--smartstock-page); color: var(--smartstock-muted); }
    .feedback.warning { background: #fff7e8; color: #8a5100; }
    .feedback.error { background: #fff5f4; color: #a33b32; }
    mat-dialog-actions { gap: 6px; padding: 14px 24px 20px; }
    .primary-action { background: var(--smartstock-accent-strong); color: white; }
    @media (max-width: 650px) { .dialog-heading p { display: none; } mat-dialog-actions { padding-inline: 16px; } }
  `],
})
export class ProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private dialogRef = inject(MatDialogRef<ProductFormComponent>);
  constructor(@Inject(MAT_DIALOG_DATA) public data: Product | null) {}
  categories = signal<Category[]>([]); suppliers = signal<Supplier[]>([]); loadingCatalog = signal(true); catalogError = signal<string | null>(null); saveError = signal<string | null>(null);
  productForm = this.fb.group({ sku: ['', [Validators.required]], name: ['', [Validators.required]], price: [0, [Validators.required, Validators.min(0.01)]], stock: [0, [Validators.required, Validators.min(0)]], min_stock: [5, [Validators.required, Validators.min(0)]], category: [null as number | null, [Validators.required]], supplier: [null as number | null, [Validators.required]] });
  ngOnInit() {
    if (this.data) this.productForm.patchValue(this.data);
    forkJoin({ categories: this.productService.getCategories(), suppliers: this.productService.getSuppliers() }).subscribe({ next: ({ categories, suppliers }) => { this.categories.set(categories); this.suppliers.set(suppliers); this.loadingCatalog.set(false); }, error: () => { this.catalogError.set('No se pudieron cargar categorías y proveedores.'); this.loadingCatalog.set(false); } });
  }
  onSubmit() {
    if (this.productForm.invalid || this.loadingCatalog()) return;
    this.saveError.set(null); const productData = this.productForm.getRawValue();
    const obs = this.data ? this.productService.updateProduct(this.data.id!, productData as Partial<Product>) : this.productService.createProduct(productData as Partial<Product>);
    obs.subscribe({ next: () => this.dialogRef.close(true), error: () => this.saveError.set('No se pudo guardar el producto. Revisá los datos e intentá nuevamente.') });
  }
  onCancel() { this.dialogRef.close(false); }
}