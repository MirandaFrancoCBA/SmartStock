import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EMPTY, Observable, expand, map, reduce } from 'rxjs';
import { Product } from '../models/product.model';
import { Category, Supplier } from '../models/catalog.model';
import {
  CreateInventoryMovement,
  InventoryMovement,
} from '../models/inventory-movement.model';
import { environment } from '../../../environments/environment';

interface PaginatedResponse<T> {
  results: T[];
  next: string | null;
}

export interface InventoryValueReport {
  total_inventory_value: number | null;
}

export interface StockReportItem {
  id: number;
  name: string;
  stock: number;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/`;
  private apiUrl = `${this.baseUrl}products/`;

  getProducts(page: number = 1, search: string = '', lowStock: boolean = false): Observable<any> {
    let url = `${this.apiUrl}?page=${page}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (lowStock) url += `&low_stock=true`;
    return this.http.get<any>(url);
  }

  getCategories(): Observable<Category[]> { return this.getAllPages<Category>(`${this.baseUrl}categories/`); }
  createCategory(data: Omit<Category, 'id'>): Observable<Category> { return this.http.post<Category>(`${this.baseUrl}categories/`, data); }
  updateCategory(id: number, data: Omit<Category, 'id'>): Observable<Category> { return this.http.put<Category>(`${this.baseUrl}categories/${id}/`, data); }
  deleteCategory(id: number): Observable<void> { return this.http.delete<void>(`${this.baseUrl}categories/${id}/`); }

  getSuppliers(): Observable<Supplier[]> { return this.getAllPages<Supplier>(`${this.baseUrl}suppliers/`); }
  createSupplier(data: Omit<Supplier, 'id'>): Observable<Supplier> { return this.http.post<Supplier>(`${this.baseUrl}suppliers/`, data); }
  updateSupplier(id: number, data: Omit<Supplier, 'id'>): Observable<Supplier> { return this.http.put<Supplier>(`${this.baseUrl}suppliers/${id}/`, data); }
  deleteSupplier(id: number): Observable<void> { return this.http.delete<void>(`${this.baseUrl}suppliers/${id}/`); }

  createProduct(product: Partial<Product>): Observable<Product> { return this.http.post<Product>(this.apiUrl, product); }
  updateProduct(id: number, product: Partial<Product>): Observable<Product> { return this.http.put<Product>(`${this.apiUrl}${id}/`, product); }
  deleteProduct(id: number): Observable<any> { return this.http.delete(`${this.apiUrl}${id}/`); }

  createInventoryMovement(movement: CreateInventoryMovement): Observable<InventoryMovement> { return this.http.post<InventoryMovement>(`${this.baseUrl}inventory-movements/`, movement); }
  getMovements(): Observable<InventoryMovement[]> { return this.getAllPages<InventoryMovement>(`${this.baseUrl}inventory-movements/`); }
  getRecentMovements(limit: number = 5): Observable<InventoryMovement[]> { return this.http.get<PaginatedResponse<InventoryMovement>>(`${this.baseUrl}inventory-movements/`).pipe(map((response) => response.results.slice(0, limit))); }
  getInventoryValueReport(): Observable<InventoryValueReport> { return this.http.get<InventoryValueReport>(`${this.baseUrl}reports/inventory-value/`); }
  getLowStockReport(): Observable<StockReportItem[]> { return this.http.get<StockReportItem[]>(`${this.baseUrl}reports/low-stock/`); }
  getTopProductsReport(): Observable<StockReportItem[]> { return this.http.get<StockReportItem[]>(`${this.baseUrl}reports/top-products/`); }
  getStats(): Observable<any> { return this.http.get<any>(`${this.baseUrl}products/stats/`); }

  private getAllPages<T>(url: string): Observable<T[]> {
    return this.http.get<PaginatedResponse<T>>(url).pipe(
      expand((response) => response.next ? this.http.get<PaginatedResponse<T>>(response.next) : EMPTY),
      map((response) => response.results),
      reduce((items, page) => [...items, ...page], [] as T[])
    );
  }
}
