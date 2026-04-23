import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReformaService } from '../../core/services/reforma';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent {
  reformaService = inject(ReformaService);
  unidades = this.reformaService.unidades;
}
