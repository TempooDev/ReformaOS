import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { Property, PropertyPhase, Expense } from '@shared';
import { StatCardComponent } from '../../core/components/stat-card/stat-card';
import { ReformaService } from '../../core/services/reforma';

@Component({
  selector: 'app-finance-construction',
  standalone: true,
  imports: [CommonModule, StatCardComponent],
  templateUrl: './finance-construction.html',
  styleUrl: './finance-construction.css'
})
export class FinanceConstructionComponent {
  private reformaService = inject(ReformaService);

  // --- Resources ---
  activeId = computed(() => this.reformaService.activePropertyId());

  // Resource to fetch all properties to find the active one
  // (Alternatively, we could have a getPropertyById endpoint that we use here)
  propertiesResource = this.reformaService.propertiesResource;

  activeProperty = computed(() => {
    const id = this.activeId();
    if (!id) return null;
    return this.propertiesResource.value()?.find(p => p.id === id) ?? null;
  });

  phasesResource = httpResource<PropertyPhase[]>(() => 
    this.activeId() ? this.reformaService.getPhasesUrl(this.activeId()!) : undefined
  );

  expensesResource = httpResource<Expense[]>(() => {
    const pId = this.activeId();
    if (!pId) return undefined;
    return `${this.reformaService.apiUrl}/properties/${pId}/expenses`;
  });

  // --- Derived Signals ---
  phases = computed(() => this.phasesResource.value() ?? []);
  recentExpenses = computed(() => (this.expensesResource.value() ?? []).slice(0, 5));

  propertyStats = computed(() => {
    const prop = this.activeProperty();
    const phases = this.phases();
    
    if (!prop) return {
      totalBudget: 0,
      totalSpent: 0,
      remaining: 0,
      progress: 0
    };

    const totalBudget = prop.budget || 0;
    const totalSpent = phases.reduce((acc, p) => acc + (p.spent || 0), 0);
    const remaining = totalBudget - totalSpent;
    
    // Weighted progress based on phase budgets
    let weightedProgress = 0;
    if (totalBudget > 0) {
      weightedProgress = phases.reduce((acc, p) => acc + (p.progress * (p.budget || 0)), 0) / totalBudget;
    } else if (phases.length > 0) {
      // Fallback to simple average if no budgets
      weightedProgress = phases.reduce((acc, p) => acc + p.progress, 0) / phases.length;
    }

    return {
      totalBudget,
      totalSpent,
      remaining,
      progress: Math.round(weightedProgress)
    };
  });
}
