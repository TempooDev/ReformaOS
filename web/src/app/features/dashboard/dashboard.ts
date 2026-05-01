import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReformaService } from '../../core/services/reforma';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent {
  reformaService = inject(ReformaService);
  authService = inject(AuthService);
  
  // These are now computed signals from httpResource
  unidades = this.reformaService.unidades;
}
