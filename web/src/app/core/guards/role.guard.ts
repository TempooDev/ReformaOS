import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = route.data['roles'] as Array<string>;
  const userRole = authService.getRole();

  if (userRole && allowedRoles.includes(userRole)) {
    return true;
  }

  // Si no tiene permiso, redirigir al dashboard
  router.navigate(['/dashboard']);
  return false;
};
