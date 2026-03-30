import { Component, inject } from '@angular/core';
import { ReformaService } from '../../core/services/reforma';
import { SectionHeaderComponent } from '../../core/components/section-header/section-header';
import { StatusMonolithComponent } from '../../core/components/status-monolith/status-monolith';
import { ProgressBarComponent } from '../../core/components/progress-bar/progress-bar';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SectionHeaderComponent, StatusMonolithComponent, ProgressBarComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent {
  reformaService = inject(ReformaService);
  unidades = this.reformaService.unidades;
}
