import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { httpResource } from '@angular/common/http';
import { Tenant, Transaction, UtilityReading } from '@shared';
import { ReformaService } from '../../core/services/reforma';
import { NotificationService } from '../../core/services/notification';

@Component({
  selector: 'app-monthly-rental',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './monthly-rental.html',
  styleUrl: './monthly-rental.css'
})
export class MonthlyRentalComponent {
  private reformaService = inject(ReformaService);
  private notificationService = inject(NotificationService);

  // --- State ---
  electricityInput = signal<number | null>(null);
  waterInput = signal<number | null>(null);

  // --- Resources ---
  activeId = computed(() => this.reformaService.activePropertyId());

  tenantResource = httpResource<Tenant>(() => 
    this.activeId() ? this.reformaService.getTenantUrl(this.activeId()!) : undefined
  );

  transactionsResource = httpResource<Transaction[]>(() => 
    this.activeId() ? this.reformaService.getTransactionsUrl(this.activeId()!) : undefined
  );

  readingsResource = httpResource<UtilityReading[]>(() => 
    this.activeId() ? this.reformaService.getUtilityReadingsUrl(this.activeId()!) : undefined
  );

  // --- Derived Signals ---
  tenant = computed(() => this.tenantResource.value() ?? null);
  transactions = computed(() => this.transactionsResource.value() ?? []);
  readings = computed(() => this.readingsResource.value() ?? []);

  prevElectricity = computed(() => 
    this.readings().find(r => r.type === 'Electricity')?.value ?? 0
  );

  prevWater = computed(() => 
    this.readings().find(r => r.type === 'Water')?.value ?? 0
  );

  async calculateUsage() {
    const pId = this.activeId();
    if (!pId) return;

    const eVal = this.electricityInput();
    const wVal = this.waterInput();

    if (eVal !== null) {
      this.reformaService.createUtilityReading(pId, {
        type: 'Electricity',
        meter_id: 'E-98234-A',
        value: eVal
      }).subscribe();
    }

    if (wVal !== null) {
      this.reformaService.createUtilityReading(pId, {
        type: 'Water',
        meter_id: 'W-11029-B',
        value: wVal
      }).subscribe();
    }

    this.notificationService.success('Readings saved', 'Utility usage has been recorded.');
    this.readingsResource.reload();
    this.electricityInput.set(null);
    this.waterInput.set(null);
  }
}
