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
    { name: 'Demolition & Debris Removal', progress: 100, status: 'Completed', budget: 12000, spent: 11500 },
    { name: 'Plumbing & Heating', progress: 85, status: 'In Progress', budget: 25000, spent: 21000 },
    { name: 'Electrical Installation', progress: 40, status: 'In Progress', budget: 18000, spent: 7200 },
    { name: 'Partitioning & Plasterboard', progress: 20, status: 'Started', budget: 30000, spent: 6000 },
    { name: 'Finishes & Painting', progress: 0, status: 'Pending', budget: 25000, spent: 0 }
  ]);

  recentInvoices = input<Invoice[]>([
    { provider: 'Materiales Pro S.A.', amount: 4200.50, date: '25 Oct, 2023', status: 'Paid' },
    { provider: 'Fontanería López', amount: 1500.00, date: '28 Oct, 2023', status: 'Pending' },
    { provider: 'Electricidad Voltio', amount: 2800.00, date: '30 Oct, 2023', status: 'In Review' }
  ]);
}
