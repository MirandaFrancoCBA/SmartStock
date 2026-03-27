import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../core/services/product';
import { Product } from '../../../core/models/product.model';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatCardModule, MatPaginatorModule],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Inventario de Productos</mat-card-title>
      </mat-card-header>
      
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
  `]
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  
  products = signal<Product[]>([]);
  totalProducts = signal(0);
  displayedColumns: string[] = ['sku', 'name', 'price', 'stock'];

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
    // Angular empieza en 0, Django en 1
    const pageIndex = event.pageIndex + 1;
    this.loadPage(pageIndex);
  }
}