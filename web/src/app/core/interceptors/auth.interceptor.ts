import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const user = authService.currentUser();

  if (user) {
    const cloned = req.clone({
      setHeaders: {
        'X-User-Id': user.id,
        'X-User-Role': user.role
      }
    });
    return next(cloned);
  }

  return next(req);
};
