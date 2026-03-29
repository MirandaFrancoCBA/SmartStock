import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../core/services/product';
import { Product } from '../../../core/models/product.model';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ProductFormComponent } from '../components/product-form/product-form';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule, 
    MatCardModule, 
    MatPaginatorModule, 
    MatIconModule, 
    MatButtonModule, 
    MatDialogModule
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Inventario de Productos</mat-card-title>
      </mat-card-header>
      
      <div class="header-actions" style="padding: 16px;">
          <button mat-raised-button color="primary" (click)="openCreateDialog()">
            + Nuevo Producto
          </button>
      </div>

      <mat-card-content>
        <table mat-table [dataSource]="products()" class="mat-elevation-z8">

          <ng-container matColumnDef="sku">
            <th mat-header-cell *matHeaderCellDef> SKU </th>
            <td mat-cell *matCellDef="let element"> {{element.sku}} </td>
          </ng-container>

          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef> Nombre </th>
            <td mat-cell *matCellDef="let element"> {{element.name}} </td>
          </ng-container>

          <ng-container matColumnDef="price">
            <th mat-header-cell *matHeaderCellDef> Precio </th>
            <td mat-cell *matCellDef="let element"> {{element.price | currency}} </td>
          </ng-container>

          <ng-container matColumnDef="stock">
            <th mat-header-cell *matHeaderCellDef> Stock </th>
            <td mat-cell *matCellDef="let element"> {{element.stock}} </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef> Acciones </th>
            <td mat-cell *matCellDef="let element">
               <button mat-icon-button color="accent" (click)="openEditDialog(element)">
                  <mat-icon>edit</mat-icon>
               </button>
               <button mat-icon-button color="warn" (click)="deleteProduct(element.id)">
                  <mat-icon>delete</mat-icon>
                </button>
            </td>
          </ng-container>
          
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <mat-paginator [length]="totalProducts()"
                       [pageSize]="10"
                       (page)="onPageChange($event)">
        </mat-paginator>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    table { width: 100%; margin-top: 20px; }
    mat-card { margin: 20px; }
    mat-paginator { margin-top: 10px; }
    .header-actions { display: flex; justify-content: flex-end; }
  `]
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private dialog = inject(MatDialog);
  
  products = signal<Product[]>([]);
  totalProducts = signal(0);
  displayedColumns: string[] = ['sku', 'name', 'price', 'stock', 'actions'];

  ngOnInit() {
    this.loadPage(1);
  }

  loadPage(page: number) {
    this.productService.getProducts(page).subscribe({
      next: (response: any) => {
        this.products.set(response.results);
        this.totalProducts.set(response.count);
      },
      error: (err) => console.error('Error al cargar productos', err)
    });
  }

  onPageChange(event: PageEvent) {
    const pageIndex = event.pageIndex + 1;
    this.loadPage(pageIndex);
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(ProductFormComponent, {
      width: '400px',
      data: null // Modo creación
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadPage(1);
    });
  }

  openEditDialog(product: Product) {
    const dialogRef = this.dialog.open(ProductFormComponent, {
      width: '400px',
      data: product // Modo edición
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadPage(1);
    });
  }

  deleteProduct(id: number) {
    if (confirm('¿Estás seguro de borrar este producto?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => this.loadPage(1),
        error: (err) => console.error(err)
      });
    }
  }
}