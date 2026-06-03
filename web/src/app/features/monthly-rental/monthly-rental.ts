import { Component, inject, computed } from '@angular/core';
import { DecimalPipe, CommonModule } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { Tenant, Transaction } from '@shared';
import { ReformaService } from '../../core/services/reforma';

@Component({
  selector: 'app-monthly-rental',
  standalone: true,
  imports: [DecimalPipe, CommonModule],
  templateUrl: './monthly-rental.html',
  styleUrl: './monthly-rental.css'
})
export class MonthlyRentalComponent {
  private reformaService = inject(ReformaService);

  // --- Resources ---
  activeId = computed(() => this.reformaService.activePropertyId());

  tenantResource = httpResource<Tenant>(() => 
    this.activeId() ? this.reformaService.getTenantUrl(this.activeId()!) : undefined
  );

  transactionsResource = httpResource<Transaction[]>(() => 
    this.activeId() ? this.reformaService.getTransactionsUrl(this.activeId()!) : undefined
  );

  // --- Derived Signals ---
  tenant = computed(() => this.tenantResource.value() ?? null);
  transactions = computed(() => this.transactionsResource.value() ?? []);
}
