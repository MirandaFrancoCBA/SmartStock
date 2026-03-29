import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ProductService } from '../../../../core/services/product';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, 
    MatFormFieldModule, MatInputModule, MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>Nuevo Producto</h2>
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
export class ProductFormComponent {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private dialogRef = inject(MatDialogRef<ProductFormComponent>);

  productForm = this.fb.group({
    sku: ['', [Validators.required]],
    name: ['', [Validators.required]],
    price: [0, [Validators.required, Validators.min(0.01)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    category: [1], 
    supplier: [1]
  });

  onSubmit() {
    if (this.productForm.valid) {
      this.productService.createProduct(this.productForm.value as any).subscribe({
        next: (newProd) => {
          this.dialogRef.close(true); 
        },
        error: (err) => console.error('Error al crear:', err)
      });
    }
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}