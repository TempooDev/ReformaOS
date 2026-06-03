import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable, signal, computed, effect } from '@angular/core';
import { 
  Property, PropertyPhase, MortgageProposal, 
  RenovationProposal, PhotoFolder, DocumentOrInvoice, Photo, Unit, Expense
} from '@shared';

@Injectable({
  providedIn: 'root',
})
export class ReformaService {
  private http = inject(HttpClient);
  public apiUrl = 'http://localhost:8080/api';

  // Usamos httpResource para una carga reactiva y automática
  unitsResource = httpResource<Unit[]>(() => `${this.apiUrl}/units`);
  propertiesResource = httpResource<Property[]>(() => `${this.apiUrl}/properties`);

  // Signals derivadas para mantener compatibilidad con el resto de la app
  units = computed(() => this.unitsResource.value() ?? []);
  properties = computed(() => this.propertiesResource.value() ?? []);
  
  activePropertyId = signal<string | null>(null);

  constructor() {
    // Inicializamos el activePropertyId de forma limpia cuando carguen las propiedades
    effect(() => {
      const props = this.propertiesResource.value();
      if (props && props.length > 0 && !this.activePropertyId()) {
        this.activePropertyId.set(props[0].id);
      }
    });
  }

  // Los métodos de carga manual ya no son necesarios con httpResource,
  // pero los mantenemos o adaptamos si se usaban para forzar refresco
  refreshProperties() {
    this.propertiesResource.reload();
  }

  // --- REST Methods (serán consumidos mediante resource() en los componentes) ---
  
  // Mantenemos estos métodos que devuelven el URL o el Observable para ser usados por resource()
  getPhasesUrl(propertyId: string) {
    return `${this.apiUrl}/properties/${propertyId}/phases`;
  }

  getMortgagesUrl(propertyId: string) {
    return `${this.apiUrl}/properties/${propertyId}/mortgages`;
  }

  getRenovationsUrl(propertyId: string) {
    return `${this.apiUrl}/properties/${propertyId}/renovations`;
  }

  getGalleryUrl(propertyId: string) {
    return `${this.apiUrl}/properties/${propertyId}/gallery`;
  }

  getDocumentsUrl(propertyId: string) {
    return `${this.apiUrl}/properties/${propertyId}/documents`;
  }

  getBookingsUrl(propertyId: string) {
    return `${this.apiUrl}/properties/${propertyId}/bookings`;
  }

  getRentalStatsUrl(propertyId: string) {
    return `${this.apiUrl}/properties/${propertyId}/rental-stats`;
  }

  getTenantUrl(propertyId: string) {
    return `${this.apiUrl}/properties/${propertyId}/tenant`;
  }

  getTransactionsUrl(propertyId: string) {
    return `${this.apiUrl}/properties/${propertyId}/transactions`;
  }

  // Métodos de mutación (POST/PUT/DELETE) se mantienen con HttpClient
  updateProperty(id: string, prop: Partial<Property>) {
    return this.http.put<Property>(`${this.apiUrl}/properties/${id}`, prop);
  }

  updatePhasesBatch(propertyId: string, phases: PropertyPhase[]) {
    return this.http.put<PropertyPhase[]>(`${this.apiUrl}/properties/${propertyId}/phases/batch`, phases);
  }

  createPhase(propertyId: string, phase: Partial<PropertyPhase>) {
    return this.http.post<PropertyPhase>(`${this.apiUrl}/properties/${propertyId}/phases`, phase);
  }

  createMortgage(propertyId: string, formData: FormData) {
    return this.http.post<MortgageProposal>(`${this.apiUrl}/properties/${propertyId}/mortgages`, formData);
  }

  createRenovation(propertyId: string, formData: FormData) {
    return this.http.post<RenovationProposal>(`${this.apiUrl}/properties/${propertyId}/renovations`, formData);
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

  uploadDocument(propertyId: string, formData: FormData) {
    return this.http.post<DocumentOrInvoice>(`${this.apiUrl}/properties/${propertyId}/documents`, formData);
  }

  // --- Expenses ---
  getExpenses(propertyId: string) {
    return this.http.get<Expense[]>(`${this.apiUrl}/properties/${propertyId}/expenses`);
  }

  createExpense(propertyId: string, formData: FormData) {
    return this.http.post<Expense>(`${this.apiUrl}/properties/${propertyId}/expenses`, formData);
  }

  updateExpense(id: string, expense: Partial<Expense>) {
    return this.http.put<Expense>(`${this.apiUrl}/expenses/${id}`, expense);
  }

  deleteExpense(id: string) {
    return this.http.delete(`${this.apiUrl}/expenses/${id}`);
  }
}
