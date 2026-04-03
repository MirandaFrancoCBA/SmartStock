import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8000/api/';
  private apiUrl = `${this.baseUrl}products/`;
  
  getProducts(page: number = 1, search: string = '', lowStock: boolean = false): Observable<any> {
    let url = `${this.apiUrl}?page=${page}`;
    
    if (search) {
      url += `&search=${search}`;
    }
    
    if (lowStock) {
      url += `&low_stock=true`;
    }
    
    return this.http.get<any>(url);
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
  
  adjustStock(id: number, amount: number, notes: string): Observable<any> {
    return this.http.post(`${this.apiUrl}${id}/adjust_stock/`, { amount, notes });
  }

  getMovements(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}stock-history/`); 
  }

  getStats(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}stock-history/stats/`); 
  }
}