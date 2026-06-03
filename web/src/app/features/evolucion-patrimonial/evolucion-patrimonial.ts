import { Component, inject, computed, signal } from '@angular/core';
import { DecimalPipe, CommonModule } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { Property, MortgageProposal, AmortizationMilestone } from '@shared';
import { ReformaService } from '../../core/services/reforma';

@Component({
  selector: 'app-evolucion-patrimonial',
  standalone: true,
  imports: [DecimalPipe, CommonModule],
  templateUrl: './evolucion-patrimonial.html',
  styleUrl: './evolucion-patrimonial.css'
})
export class EvolucionPatrimonialComponent {
  private reformaService = inject(ReformaService);

  // --- Resources ---
  activeId = computed(() => this.reformaService.activePropertyId());
  
  propertiesResource = this.reformaService.propertiesResource;
  
  mortgagesResource = httpResource<MortgageProposal[]>(() => 
    this.activeId() ? this.reformaService.getMortgagesUrl(this.activeId()!) : undefined
  );

  // --- Derived Signals ---
  activeProperty = computed(() => 
    this.propertiesResource.value()?.find(p => p.id === this.activeId()) ?? null
  );

  activeMortgage = computed(() => 
    this.mortgagesResource.value()?.find(m => m.status === 'Approved') ?? null
  );

  stats = computed(() => {
    const mortgage = this.activeMortgage();
    if (!mortgage) return { monthlyPayment: 0, principalPart: 0, interestPart: 0, principalPercent: 0, interestPercent: 0 };
    
    // Simple estimation for UI based on seed data proportions
    const principalPart = mortgage.monthly_payment * 0.43;
    const interestPart = mortgage.monthly_payment * 0.57;

    return {
      monthlyPayment: mortgage.monthly_payment,
      principalPart,
      interestPart,
      principalPercent: 43,
      interestPercent: 57
    };
  });

  remainingTerm = computed(() => {
    const mortgage = this.activeMortgage();
    if (!mortgage) return { months: 0, years: 0, payoffDate: new Date() };
    
    const start = new Date(mortgage.start_date);
    const now = new Date();
    const elapsedMonths = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
    const remaining = Math.max(0, mortgage.term_months - elapsedMonths);
    
    const payoffDate = new Date();
    payoffDate.setMonth(payoffDate.getMonth() + remaining);

    return {
      months: remaining,
      years: Math.floor(remaining / 12),
      payoffDate
    };
  });

  amortizationMilestones = computed<AmortizationMilestone[]>(() => {
    const mortgage = this.activeMortgage();
    if (!mortgage) return [];

    const milestones: AmortizationMilestone[] = [];
    const currentYear = new Date().getFullYear();
    const startYear = new Date(mortgage.start_date).getFullYear();
    
    let balance = mortgage.amount;
    const monthlyRate = (mortgage.interest_rate / 100) / 12;

    for (let year = startYear; year <= startYear + (mortgage.term_months / 12); year++) {
      let annualPrincipal = 0;
      let annualInterest = 0;

      for (let month = 0; month < 12; month++) {
        const interest = balance * monthlyRate;
        const principal = mortgage.monthly_payment - interest;
        balance -= principal;
        annualPrincipal += principal;
        annualInterest += interest;
      }

      if (year >= currentYear && milestones.length < 5) {
        milestones.push({
          year,
          totalPaid: mortgage.monthly_payment * 12,
          principal: annualPrincipal,
          interest: annualInterest,
          balance: Math.max(0, balance),
          status: year === currentYear ? 'current' : 'upcoming'
        });
      }
      
      if (balance <= 0) break;
    }

    return milestones;
  });

  currentYear = signal(new Date().getFullYear());

  currentAmortization = computed(() => 
    this.amortizationMilestones().find(m => m.status === 'current') ?? null
  );

  ltvRatio = computed(() => {
    const property = this.activeProperty();
    const mortgage = this.activeMortgage();
    if (!property || !mortgage) return 0;

    // Estimate current balance for LTV
    const milestones = this.amortizationMilestones();
    const currentBalance = milestones.find(m => m.status === 'current')?.balance ?? mortgage.amount;
    
    return Math.round((currentBalance / property.projected_value) * 100);
  });
}
