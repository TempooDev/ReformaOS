import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { Camera, Light } from '@shared';
import { ReformaService } from '../../core/services/reforma';

@Component({
  selector: 'app-domotica',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './domotica.html',
  styleUrl: './domotica.css'
})
export class DomoticaComponent {
  private reformaService = inject(ReformaService);

  // --- Resources ---
  activeId = computed(() => this.reformaService.activePropertyId());

  camerasResource = httpResource<Camera[]>(() => 
    this.activeId() ? this.reformaService.getCamerasUrl(this.activeId()!) : undefined
  );

  lightsResource = httpResource<Light[]>(() => 
    this.activeId() ? this.reformaService.getLightsUrl(this.activeId()!) : undefined
  );

  // --- Derived Signals ---
  cameras = computed(() => this.camerasResource.value() ?? []);
  lights = computed(() => this.lightsResource.value() ?? []);

  toggleLight(light: Light) {
    const updatedStatus = !light.status;
    const updatedBrightness = updatedStatus ? (light.brightness || 80) : 0;
    
    this.reformaService.updateLight(light.id, { 
      status: updatedStatus,
      brightness: updatedBrightness 
    }).subscribe(() => {
      this.lightsResource.reload();
    });
  }
}
