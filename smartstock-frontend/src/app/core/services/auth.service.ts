import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, User } from '../../shared/models/auth.model';
import {
  Observable,
  catchError,
  finalize,
  map,
  shareReplay,
  switchMap,
  tap,
  throwError,
} from 'rxjs';

interface RefreshResponse {
  access: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private refreshRequest$: Observable<string> | null = null;

  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(this.hasUsableSession());

  login(credentials: LoginRequest) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/token/`, credentials).pipe(
      tap((res) => {
        localStorage.setItem('token', res.access);
        localStorage.setItem('refresh', res.refresh);
        this.isAuthenticated.set(true);
      }),
      switchMap((tokens) => this.loadCurrentUser().pipe(map(() => tokens)))
    );
  }

  loadCurrentUser(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/me/`).pipe(
      tap((user) => this.currentUser.set(user))
    );
  }

  hasRole(...roles: string[]): boolean {
    return this.currentUser()?.groups.some((group) => roles.includes(group)) ?? false;
  }

  getAccessToken(): string | null {
    return localStorage.getItem('token');
  }

  hasUsableSession(): boolean {
    const refreshToken = localStorage.getItem('refresh');

    if (!refreshToken || this.isTokenExpired(refreshToken)) {
      return false;
    }

    return true;
  }

  refreshAccessToken(): Observable<string> {
    if (this.refreshRequest$) {
      return this.refreshRequest$;
    }

    const refresh = localStorage.getItem('refresh');
    if (!refresh || this.isTokenExpired(refresh)) {
      this.logout();
      return throwError(() => new Error('Refresh token is missing or expired'));
    }

    this.refreshRequest$ = this.http
      .post<RefreshResponse>(`${environment.apiUrl}/token/refresh/`, { refresh })
      .pipe(
        tap((response) => {
          localStorage.setItem('token', response.access);
          this.isAuthenticated.set(true);
        }),
        map((response) => response.access),
        catchError((error) => {
          this.logout();
          return throwError(() => error);
        }),
        finalize(() => {
          this.refreshRequest$ = null;
        }),
        shareReplay(1)
      );

    return this.refreshRequest$;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payloadPart = token.split('.')[1];
      if (!payloadPart) {
        return true;
      }

      const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
      const payload = JSON.parse(atob(padded)) as { exp?: number };

      if (!payload.exp) {
        return true;
      }

      return payload.exp * 1000 <= Date.now();
    } catch {
      return true;
    }
  }
}
