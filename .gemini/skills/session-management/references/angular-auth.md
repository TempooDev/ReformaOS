# Angular Authentication Integration

This reference explains how to handle the session/OIDC flow in the Angular workspace.

## Best Practices
- **Storage**: Store tokens in `localStorage` or as an `HttpOnly` cookie if using a same-domain Gateway.
- **Interceptors**: Use an `HttpInterceptor` to attach the Bearer token to every outgoing request.

## Implementation Example

### 1. AuthService (Signals based with Auto-Refresh)
```typescript
import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { timer, Subscription } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private userSignal = signal<User | null>(null);
  private refreshSubscription?: Subscription;
  
  user = this.userSignal.asReadonly();

  setToken(token: string, expiresAt: number) {
    localStorage.setItem('access_token', token);
    localStorage.setItem('expires_at', expiresAt.toString());
    
    this.scheduleRefresh(expiresAt);
  }

  private scheduleRefresh(expiresAt: number) {
    this.refreshSubscription?.unsubscribe();
    
    const now = Date.now();
    const ttl = expiresAt - now;
    const refreshTime = ttl / 2; // Refresh at half of the remaining TTL

    if (refreshTime > 0) {
      this.refreshSubscription = timer(refreshTime).subscribe(() => {
        this.refreshToken();
      });
    }
  }

  refreshToken() {
    this.http.post<AuthResponse>('/api/auth/refresh', {}).subscribe({
      next: (res) => this.setToken(res.token, res.expiresAt),
      error: () => this.logout()
    });
  }

  // ... other methods (getToken, logout)
}
```

### 2. AuthInterceptor
```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
```

### 3. Route Guard
```typescript
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.user() ? true : router.createUrlTree(['/login']);
};
```
