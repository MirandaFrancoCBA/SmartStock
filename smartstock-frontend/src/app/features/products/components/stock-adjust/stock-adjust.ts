import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MovementType } from '../../../../core/models/inventory-movement.model';

@Component({
  selector: 'app-stock-adjust',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule],
  template: `
    <h2 mat-dialog-title>Registrar movimiento: {{ data.name }}</h2>
    <mat-dialog-content>
      <div style="display: flex; flex-direction: column; gap: 15px; padding-top: 10px;">
        <mat-form-field appearance="outline">
          <mat-label>Tipo de movimiento</mat-label>
          <mat-select [(ngModel)]="type">
            <mat-option value="IN">Entrada (+)</mat-option>
            <mat-option value="OUT">Salida (-)</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Cantidad</mat-label>
          <input matInput type="number" [(ngModel)]="quantity" min="1">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Notas / Motivo</mat-label>
          <textarea matInput [(ngModel)]="note" placeholder="Ej: Venta minorista, compra a proveedor..."></textarea>
        </mat-form-field>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onNoClick()">Cancelar</button>
      <button mat-raised-button color="primary" [disabled]="!quantity || quantity <= 0" (click)="confirm()">Confirmar</button>
    </mat-dialog-actions>
  `
})
export class StockAdjustComponent {
  readonly dialogRef = inject(MatDialogRef<StockAdjustComponent>);
  readonly data = inject(MAT_DIALOG_DATA);

  type: MovementType = 'IN';
  quantity = 1;
  note = '';

  onNoClick(): void {
    this.dialogRef.close();
  }

  confirm(): void {
    this.dialogRef.close({
      movement_type: this.type,
      quantity: this.quantity,
      note: this.note,
    });
  }
}
