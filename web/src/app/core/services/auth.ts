import { Injectable, signal, effect } from '@angular/core';
import { User, UserRole } from '@shared';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  currentUser = signal<User | null>(null);
  readonly Role = UserRole;

  constructor(private router: Router) {
    if (typeof window !== 'undefined') {
      // Restore from localStorage
      const saved = localStorage.getItem('reformaos_user');
      if (saved) {
        this.currentUser.set(JSON.parse(saved));
      }

      // Persist to localStorage
      effect(() => {
        const user = this.currentUser();
        if (user) {
          localStorage.setItem('reformaos_user', JSON.stringify(user));
        } else {
          localStorage.removeItem('reformaos_user');
        }
      });
    }
  }

  login(user: User) {
    this.currentUser.set(user);
    this.router.navigate(['/']);
  }

  logout() {
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn() {
    return this.currentUser() !== null;
  }

  getRole() {
    return this.currentUser()?.role;
  }

  getUserId() {
    return this.currentUser()?.id;
  }
}
