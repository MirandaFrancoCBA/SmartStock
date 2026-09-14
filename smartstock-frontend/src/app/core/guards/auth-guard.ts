import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard = () => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if (!authService.hasUsableSession()) {
    authService.logout();
    return router.createUrlTree(['/login']);
  }

  if (authService.currentUser()) {
    return true;
  }

  return authService.loadCurrentUser().pipe(
    map(() => true),
    catchError(() => {
      authService.logout();
      return of(router.createUrlTree(['/login']));
    })
  );
};
