import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MovementType } from '../../../../core/models/inventory-movement.model';

@Component({
  selector: 'app-stock-adjust',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSelectModule],
  template: `
    <div class="dialog-heading" mat-dialog-title>
      <div class="dialog-icon"><mat-icon>swap_vert</mat-icon></div>
      <div><h2>Registrar movimiento</h2><p>{{ data.name }}</p></div>
    </div>
    <mat-dialog-content>
      <div class="stock-summary"><span>Stock actual</span><strong>{{ data.stock }} un.</strong></div>
      <div class="form-container">
        <mat-form-field appearance="outline" subscriptSizing="dynamic"><mat-label>Tipo de movimiento</mat-label><mat-select [(ngModel)]="type"><mat-option value="IN">Entrada (+)</mat-option><mat-option value="OUT">Salida (-)</mat-option></mat-select></mat-form-field>
        <mat-form-field appearance="outline" subscriptSizing="dynamic"><mat-label>Cantidad</mat-label><input matInput type="number" [(ngModel)]="quantity" min="1"><mat-icon matSuffix>pin</mat-icon></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Notas / Motivo</mat-label><textarea matInput rows="3" [(ngModel)]="note" placeholder="Ej. Venta minorista, compra a proveedor…"></textarea><mat-hint>Opcional</mat-hint></mat-form-field>
      </div>
      <div class="movement-preview" [class.outgoing]="type === 'OUT'"><mat-icon>{{ type === 'IN' ? 'south' : 'north' }}</mat-icon><div><strong>{{ type === 'IN' ? 'Entrada de stock' : 'Salida de stock' }}</strong><span>{{ quantity > 0 ? quantity : 0 }} unidades {{ type === 'IN' ? 'se agregarán al' : 'se descontarán del' }} inventario.</span></div></div>
    </mat-dialog-content>
    <mat-dialog-actions align="end"><button mat-button (click)="onNoClick()">Cancelar</button><button mat-flat-button class="primary-action" [class.outgoing]="type === 'OUT'" [disabled]="!quantity || quantity <= 0" (click)="confirm()"><mat-icon>{{ type === 'IN' ? 'add' : 'remove' }}</mat-icon>Confirmar {{ type === 'IN' ? 'entrada' : 'salida' }}</button></mat-dialog-actions>
  `,
  styles: [`
    .dialog-heading { display: flex; align-items: center; gap: 13px; padding-bottom: 10px; }
    .dialog-heading h2 { margin: 0; font-size: 1.2rem; }
    .dialog-heading p { margin: 3px 0 0; color: var(--smartstock-muted); font-size: .78rem; font-weight: 400; }
    .dialog-icon { display: grid; width: 42px; height: 42px; flex: 0 0 42px; place-items: center; border-radius: 12px; background: var(--smartstock-accent-soft); color: var(--smartstock-accent-strong); }
    mat-dialog-content { padding-top: 8px !important; }
    .stock-summary { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; padding: 11px 13px; border: 1px solid var(--smartstock-border); border-radius: 11px; background: var(--smartstock-page); }
    .stock-summary span { color: var(--smartstock-muted); font-size: .78rem; }
    .stock-summary strong { color: var(--smartstock-accent-strong); font-size: .92rem; }
    .form-container { display: flex; min-width: min(390px, 70vw); flex-direction: column; gap: 10px; }
    .movement-preview { display: flex; align-items: center; gap: 10px; margin-top: 4px; padding: 12px; border-radius: 11px; background: var(--smartstock-accent-soft); color: var(--smartstock-accent-strong); }
    .movement-preview.outgoing { background: #fde9e7; color: #a33b32; }
    .movement-preview div { display: flex; flex-direction: column; gap: 2px; }
    .movement-preview strong { font-size: .8rem; }
    .movement-preview span { font-size: .73rem; }
    mat-dialog-actions { gap: 6px; padding: 14px 24px 20px; }
    .primary-action { background: var(--smartstock-accent-strong); color: white; }
    .primary-action.outgoing { background: #a33b32; }
    @media (max-width: 520px) { .form-container { min-width: 0; } .dialog-heading p { max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } }
  `]
})
export class StockAdjustComponent {
  readonly dialogRef = inject(MatDialogRef<StockAdjustComponent>);
  readonly data = inject(MAT_DIALOG_DATA);
  type: MovementType = 'IN'; quantity = 1; note = '';
  onNoClick(): void { this.dialogRef.close(); }
  confirm(): void { this.dialogRef.close({ movement_type: this.type, quantity: this.quantity, note: this.note }); }
}
