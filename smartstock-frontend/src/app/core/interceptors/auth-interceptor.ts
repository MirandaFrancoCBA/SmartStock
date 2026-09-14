import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const isAuthRequest = req.url.includes('/token/');
  const accessToken = authService.getAccessToken();

  const request = !isAuthRequest && accessToken
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
    : req;

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (isAuthRequest || error.status !== 401 || !authService.hasUsableSession()) {
        if (!isAuthRequest && error.status === 401) {
          authService.logout();
          void router.navigate(['/login']);
        }
        return throwError(() => error);
      }

      return authService.refreshAccessToken().pipe(
        switchMap((newAccessToken) =>
          next(
            req.clone({
              setHeaders: {
                Authorization: `Bearer ${newAccessToken}`,
              },
            })
          )
        ),
        catchError((refreshError) => {
          void router.navigate(['/login']);
          return throwError(() => refreshError);
        })
      );
    })
  );
};
