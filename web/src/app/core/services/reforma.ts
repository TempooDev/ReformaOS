import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { 
  Property, PropertyPhase, MortgageProposal, 
  RenovationProposal, PhotoFolder, DocumentOrInvoice, Photo, Unidad 
} from '@shared';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReformaService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api';

  // Usamos WritableSignal para un estado reactivo moderno
  unidades = signal<Unidad[]>([]);
  properties = signal<Property[]>([]);
  activePropertyId = signal<string | null>(null);

  getUnidades() {
    this.http.get<Unidad[]>(`${this.apiUrl}/unidades`).subscribe(data => {
      this.unidades.set(data);
    });
  }

  loadProperties() {
    this.http.get<Property[]>(`${this.apiUrl}/properties`).subscribe(data => {
      this.properties.set(data);
      if (data.length > 0 && !this.activePropertyId()) {
        this.activePropertyId.set(data[0].id);
      }
    });
  }

  // --- Properties ---
  getProperties() {
    return this.http.get<Property[]>(`${this.apiUrl}/properties`);
  }

  getProperty(id: string) {
    return this.http.get<Property>(`${this.apiUrl}/properties/${id}`);
  }

  updateProperty(id: string, prop: Partial<Property>) {
    return this.http.put<Property>(`${this.apiUrl}/properties/${id}`, prop);
  }

  // --- Phases ---
  getPhases(propertyId: string) {
    return this.http.get<PropertyPhase[]>(`${this.apiUrl}/properties/${propertyId}/phases`);
  }

  updatePhasesBatch(propertyId: string, phases: PropertyPhase[]) {
    return this.http.put<PropertyPhase[]>(`${this.apiUrl}/properties/${propertyId}/phases/batch`, phases);
  }

  createPhase(propertyId: string, phase: Partial<PropertyPhase>) {
    return this.http.post<PropertyPhase>(`${this.apiUrl}/properties/${propertyId}/phases`, phase);
  }

  // --- Mortgages ---
  getMortgages(propertyId: string) {
    return this.http.get<MortgageProposal[]>(`${this.apiUrl}/properties/${propertyId}/mortgages`);
  }

  createMortgage(propertyId: string, formData: FormData) {
    return this.http.post<MortgageProposal>(`${this.apiUrl}/properties/${propertyId}/mortgages`, formData);
  }

  // --- Renovations ---
  getRenovations(propertyId: string) {
    return this.http.get<RenovationProposal[]>(`${this.apiUrl}/properties/${propertyId}/renovations`);
  }

  createRenovation(propertyId: string, formData: FormData) {
    return this.http.post<RenovationProposal>(`${this.apiUrl}/properties/${propertyId}/renovations`, formData);
  }

  // --- Gallery ---
  getGalleryFolders(propertyId: string) {
    return this.http.get<PhotoFolder[]>(`${this.apiUrl}/properties/${propertyId}/gallery`);
  }

  createFolder(propertyId: string, name: string) {
    return this.http.post<PhotoFolder>(`${this.apiUrl}/properties/${propertyId}/gallery`, { name });
  }

  uploadPhoto(propertyId: string, folderId: string, formData: FormData) {
    return this.http.post<Photo>(`${this.apiUrl}/properties/${propertyId}/gallery/${folderId}/photos`, formData);
  }

  updatePhoto(photoId: string, description: string) {
    return this.http.put<Photo>(`${this.apiUrl}/gallery/photos/${photoId}`, { description });
  }

  // --- Documents ---
  getDocuments(propertyId: string) {
    return this.http.get<DocumentOrInvoice[]>(`${this.apiUrl}/properties/${propertyId}/documents`);
  }

  uploadDocument(propertyId: string, formData: FormData) {
    return this.http.post<DocumentOrInvoice>(`${this.apiUrl}/properties/${propertyId}/documents`, formData);
  }
}
