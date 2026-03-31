import { Component } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { AmortizationMilestone } from '@shared';

@Component({
  selector: 'app-evolucion-patrimonial',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './evolucion-patrimonial.html',
  styleUrl: './evolucion-patrimonial.css'
})
export class EvolucionPatrimonialComponent {
  amortizationMilestones = input<AmortizationMilestone[]>([
    { year: 2024, totalPaid: 51420, principal: 22080, interest: 29340, balance: 780240, status: 'current' },
    { year: 2025, totalPaid: 51420, principal: 23450, interest: 27970, balance: 756790, status: 'upcoming' },
    { year: 2026, totalPaid: 51420, principal: 24900, interest: 26520, balance: 731890, status: 'upcoming' }
  ];
}
