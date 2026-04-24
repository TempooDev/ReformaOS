import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth';
import { User, UserRole } from '@shared';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.html',
})
export class LoginComponent {
  authService = inject(AuthService);

  testUsers: User[] = [
    { id: 'USR-OWNER', email: 'dueno@reformaos.com', role: UserRole.OWNER },
    { id: 'USR-ARCH', email: 'arquitecto@reformaos.com', role: UserRole.ARCHITECT },
    { id: 'USR-MGR', email: 'gestor@reformaos.com', role: UserRole.MANAGER },
  ];

  selectUser(user: User) {
    this.authService.login(user);
  }
}
