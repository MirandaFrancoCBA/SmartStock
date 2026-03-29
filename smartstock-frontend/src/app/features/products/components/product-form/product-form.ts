import { Component, inject, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ProductService } from '../../../../core/services/product';
import { Product } from '../../../../core/models/product.model';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatDialogModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data ? 'Editar Producto' : 'Nuevo Producto' }}</h2>
    <mat-dialog-content [formGroup]="productForm">
      <div class="form-container">
        <mat-form-field appearance="outline">
          <mat-label>SKU</mat-label>
          <input matInput formControlName="sku" placeholder="EJ: PROD-001">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Nombre</mat-label>
          <input matInput formControlName="name">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Precio</mat-label>
          <input matInput type="number" formControlName="price">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Stock Inicial</mat-label>
          <input matInput type="number" formControlName="stock">
        </mat-form-field>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-raised-button color="primary" 
              [disabled]="productForm.invalid" 
              (click)="onSubmit()">Guardar</button>
    </mat-dialog-actions>
  `,
  styles: [`.form-container { display: flex; flex-direction: column; gap: 10px; min-width: 300px; padding-top: 10px; }`]
})
export class ProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private dialogRef = inject(MatDialogRef<ProductFormComponent>);

  constructor(@Inject(MAT_DIALOG_DATA) public data: Product | null) {}

  productForm = this.fb.group({
    sku: ['', [Validators.required]],
    name: ['', [Validators.required]],
    price: [0, [Validators.required, Validators.min(0.01)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    category: [1], 
    supplier: [1]
  });

  ngOnInit() {
    if (this.data) {
      this.productForm.patchValue(this.data);
    }
  }

  onSubmit() {
    if (this.productForm.valid) {
      const productData = this.productForm.value;
      
      const obs = this.data 
        ? this.productService.updateProduct(this.data.id!, productData as any)
        : this.productService.createProduct(productData as any);

      obs.subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => console.error('Error en la operación:', err)
      });
    }
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}