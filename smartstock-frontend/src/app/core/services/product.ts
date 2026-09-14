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

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/`;
  private apiUrl = `${this.baseUrl}products/`;
  
  getProducts(page: number = 1, search: string = '', lowStock: boolean = false): Observable<any> {
    let url = `${this.apiUrl}?page=${page}`;
    
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    
    if (lowStock) {
      url += `&low_stock=true`;
    }
    
    return this.http.get<any>(url);
  }

  getCategories(): Observable<Category[]> {
    return this.getAllPages<Category>(`${this.baseUrl}categories/`);
  }

  getSuppliers(): Observable<Supplier[]> {
    return this.getAllPages<Supplier>(`${this.baseUrl}suppliers/`);
  }

  createProduct(product: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  updateProduct(id: number, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}${id}/`, product);
  }
  
  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}/`);
  }

  createInventoryMovement(movement: CreateInventoryMovement): Observable<InventoryMovement> {
    return this.http.post<InventoryMovement>(`${this.baseUrl}inventory-movements/`, movement);
  }

  getMovements(): Observable<InventoryMovement[]> {
    return this.getAllPages<InventoryMovement>(`${this.baseUrl}inventory-movements/`);
  }

  getStats(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}products/stats/`); 
  }

  private getAllPages<T>(url: string): Observable<T[]> {
    return this.http.get<PaginatedResponse<T>>(url).pipe(
      expand((response) =>
        response.next ? this.http.get<PaginatedResponse<T>>(response.next) : EMPTY
      ),
      map((response) => response.results),
      reduce((items, page) => [...items, ...page], [] as T[])
    );
  }
}