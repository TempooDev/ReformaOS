import { Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { PropertyStats, Phase, Invoice } from '@shared';
import { StatCardComponent } from '../../core/components/stat-card/stat-card';

@Component({
  selector: 'app-finance-construction',
  standalone: true,
  imports: [DecimalPipe, StatCardComponent],
  templateUrl: './finance-construction.html',
  styleUrl: './finance-construction.css'
})
export class FinanceConstructionComponent {
  propertyStats = input<PropertyStats>({
    totalBudget: 150000,
    totalSpent: 85400,
    remaining: 64600,
    progress: 57
  });

  phases = input<Phase[]>([
    { name: 'Demolición y Desescombro', progress: 100, status: 'Completado', budget: 12000, spent: 11500 },
    { name: 'Fontanería y Calefacción', progress: 85, status: 'En curso', budget: 25000, spent: 21000 },
    { name: 'Instalación Eléctrica', progress: 40, status: 'En curso', budget: 18000, spent: 7200 },
    { name: 'Tabiquería y Pladur', progress: 20, status: 'Iniciado', budget: 30000, spent: 6000 },
    { name: 'Acabados y Pintura', progress: 0, status: 'Pendiente', budget: 25000, spent: 0 }
  ]);

  recentInvoices = input<Invoice[]>([
    { provider: 'Materiales Pro S.A.', amount: 4200.50, date: '25 Oct, 2023', status: 'Pagado' },
    { provider: 'Fontanería López', amount: 1500.00, date: '28 Oct, 2023', status: 'Pendiente' },
    { provider: 'Electricidad Voltio', amount: 2800.00, date: '30 Oct, 2023', status: 'En Revisión' }
  ]);
}
