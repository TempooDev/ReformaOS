import { Component, inject } from '@angular/core';
import { ReformaService } from '../../core/services/reforma';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent {
  reformaService = inject(ReformaService);
  unidades = this.reformaService.unidades;
}
