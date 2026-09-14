import { Component, inject, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { forkJoin } from 'rxjs';
import { ProductService } from '../../../../core/services/product';
import { Product } from '../../../../core/models/product.model';
import { Category, Supplier } from '../../../../core/models/catalog.model';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data ? 'Editar Producto' : 'Nuevo Producto' }}</h2>
    <mat-dialog-content [formGroup]="productForm">
      <div class="form-container">
        <mat-form-field appearance="outline">
          <mat-label>SKU</mat-label>
          <input matInput formControlName="sku" placeholder="EJ: PROD-001" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Nombre</mat-label>
          <input matInput formControlName="name" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Categoría</mat-label>
          <mat-select formControlName="category">
            @for (category of categories(); track category.id) {
              <mat-option [value]="category.id">{{ category.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Proveedor</mat-label>
          <mat-select formControlName="supplier">
            @for (supplier of suppliers(); track supplier.id) {
              <mat-option [value]="supplier.id">{{ supplier.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Precio</mat-label>
          <input matInput type="number" formControlName="price" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Stock Inicial</mat-label>
          <input matInput type="number" formControlName="stock" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Stock Mínimo (Alerta)</mat-label>
          <input matInput type="number" formControlName="min_stock" />
          <mat-hint>Avisar cuando quede menos de esta cantidad</mat-hint>
        </mat-form-field>

        @if (catalogError()) {
          <p class="form-error">{{ catalogError() }}</p>
        }

        @if (!loadingCatalog() && (categories().length === 0 || suppliers().length === 0)) {
          <p class="form-warning">
            Necesitás al menos una categoría y un proveedor antes de guardar productos.
          </p>
        }

        @if (saveError()) {
          <p class="form-error">{{ saveError() }}</p>
        }
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button
        mat-raised-button
        color="primary"
        [disabled]="productForm.invalid || loadingCatalog() || categories().length === 0 || suppliers().length === 0"
        (click)="onSubmit()"
      >
        Guardar
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .form-container {
        display: flex;
        flex-direction: column;
        gap: 10px;
        min-width: 300px;
        padding-top: 10px;
      }
      .form-error {
        color: #b3261e;
        margin: 0;
      }
      .form-warning {
        color: #8a4b08;
        margin: 0;
      }
    `,
  ],
})
export class ProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private dialogRef = inject(MatDialogRef<ProductFormComponent>);

  constructor(@Inject(MAT_DIALOG_DATA) public data: Product | null) {}

  categories = signal<Category[]>([]);
  suppliers = signal<Supplier[]>([]);
  loadingCatalog = signal(true);
  catalogError = signal<string | null>(null);
  saveError = signal<string | null>(null);

  productForm = this.fb.group({
    sku: ['', [Validators.required]],
    name: ['', [Validators.required]],
    price: [0, [Validators.required, Validators.min(0.01)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    min_stock: [5, [Validators.required, Validators.min(0)]],
    category: [null as number | null, [Validators.required]],
    supplier: [null as number | null, [Validators.required]],
  });

  ngOnInit() {
    if (this.data) {
      this.productForm.patchValue(this.data);
    }

    forkJoin({
      categories: this.productService.getCategories(),
      suppliers: this.productService.getSuppliers(),
    }).subscribe({
      next: ({ categories, suppliers }) => {
        this.categories.set(categories);
        this.suppliers.set(suppliers);
        this.loadingCatalog.set(false);
      },
      error: () => {
        this.catalogError.set('No se pudieron cargar categorías y proveedores.');
        this.loadingCatalog.set(false);
      },
    });
  }

  onSubmit() {
    if (this.productForm.invalid || this.loadingCatalog()) {
      return;
    }

    this.saveError.set(null);
    const productData = this.productForm.getRawValue();

    const obs = this.data
      ? this.productService.updateProduct(this.data.id!, productData as Partial<Product>)
      : this.productService.createProduct(productData as Partial<Product>);

    obs.subscribe({
      next: () => this.dialogRef.close(true),
      error: () => this.saveError.set('No se pudo guardar el producto. Revisá los datos e intentá nuevamente.'),
    });
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}
