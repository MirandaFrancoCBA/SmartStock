import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, User } from '../../shared/models/auth.model';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  

  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(!!localStorage.getItem('token'));

  login(credentials: LoginRequest) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/token/`, credentials).pipe(
      tap(res => {
        localStorage.setItem('token', res.access);
        localStorage.setItem('refresh', res.refresh);
        this.isAuthenticated.set(true);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
  }
}