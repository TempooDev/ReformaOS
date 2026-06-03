import { Component, inject, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { Property, PropertyPhase } from '@shared';
import { ReformaService } from '../../core/services/reforma';

@Component({
  selector: 'app-my-home',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './my-home.html',
  styleUrl: './my-home.css'
})
export class MyHomeComponent {
  private reformaService = inject(ReformaService);

  // --- Resources ---
  activeId = computed(() => this.reformaService.activePropertyId());

  propertiesResource = this.reformaService.propertiesResource;

  phasesResource = httpResource<PropertyPhase[]>(() => 
    this.activeId() ? this.reformaService.getPhasesUrl(this.activeId()!) : undefined
  );

  // --- Derived Signals ---
  activeProperty = computed(() => 
    this.propertiesResource.value()?.find(p => p.id === this.activeId()) ?? null
  );

  phases = computed(() => this.phasesResource.value() ?? []);

  totalProgress = computed(() => {
    const list = this.phases();
    if (list.length === 0) return 0;
    return Math.round(list.reduce((acc, p) => acc + p.progress, 0) / list.length);
  });
}
