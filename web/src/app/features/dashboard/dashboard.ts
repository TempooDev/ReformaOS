import { Component, inject, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { Expense, MortgageProposal, PropertyPhase } from '@shared';
import { ReformaService } from '../../core/services/reforma';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent {
  reformaService = inject(ReformaService);
  authService = inject(AuthService);
  
  // --- Resources ---
  activeId = computed(() => this.reformaService.activePropertyId());

  expensesResource = httpResource<Expense[]>(() => 
    this.activeId() ? `${this.reformaService.apiUrl}/properties/${this.activeId()}/expenses` : undefined
  );

  mortgagesResource = httpResource<MortgageProposal[]>(() => 
    this.activeId() ? this.reformaService.getMortgagesUrl(this.activeId()!) : undefined
  );

  phasesResource = httpResource<PropertyPhase[]>(() => 
    this.activeId() ? this.reformaService.getPhasesUrl(this.activeId()!) : undefined
  );

  // --- Summary Computations ---
  pendingExpenses = computed(() => {
    const list = this.expensesResource.value() ?? [];
    const pending = list.filter(e => e.status === 'PENDING');
    return {
      count: pending.length,
      total: pending.reduce((acc, e) => acc + e.amount, 0)
    };
  });

  activeMortgage = computed(() => 
    this.mortgagesResource.value()?.find(m => m.status === 'Approved') ?? null
  );

  renovationProgress = computed(() => {
    const phases = this.phasesResource.value() ?? [];
    if (phases.length === 0) return 0;
    
    // Average progress weighted by budget if available, otherwise simple average
    const hasBudgets = phases.some(p => p.budget > 0);
    if (hasBudgets) {
      const totalBudget = phases.reduce((acc, p) => acc + p.budget, 0);
      if (totalBudget === 0) return 0;
      return Math.round(phases.reduce((acc, p) => acc + (p.progress * p.budget), 0) / totalBudget);
    }
    
    return Math.round(phases.reduce((acc, p) => acc + p.progress, 0) / phases.length);
  });

  recentActivity = computed(() => {
    const expenses = this.expensesResource.value() ?? [];
    return expenses.slice(0, 3);
  });
}
