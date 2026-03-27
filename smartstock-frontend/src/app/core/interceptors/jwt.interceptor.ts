import { HttpInterceptorFn } from '@angular/common/http';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

  console.log('--- INTERCEPTOR LOG ---');
  console.log('Token encontrado:', token ? 'SI' : 'NO');

  if (token) {
    // Limpiamos el token por si acaso tenga comillas o espacios extra
    const cleanToken = token.replace(/"/g, '').trim();
    
    // Verificamos si el token ya trae el 'Bearer' incluido
    const authHeader = cleanToken.startsWith('Bearer ') 
      ? cleanToken 
      : `Bearer ${cleanToken}`;

    const authReq = req.clone({
      setHeaders: {
        Authorization: authHeader
      }
    });
    return next(authReq);
  }

  console.log('Petición enviada SIN token');
  return next(req);
};

