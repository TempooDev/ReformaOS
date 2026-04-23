import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { 
  Project, ProjectPhase, MortgageProposal, 
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

  getUnidades() {
    this.http.get<Unidad[]>(`${this.apiUrl}/unidades`).subscribe(data => {
      this.unidades.set(data);
    });
  }

  // --- Projects ---
  getProjects() {
    return this.http.get<Project[]>(`${this.apiUrl}/projects`);
  }

  getProject(id: string) {
    return this.http.get<Project>(`${this.apiUrl}/projects/${id}`);
  }

  // --- Phases ---
  getPhases(projectId: string) {
    return this.http.get<ProjectPhase[]>(`${this.apiUrl}/projects/${projectId}/phases`);
  }

  updatePhasesBatch(projectId: string, phases: ProjectPhase[]) {
    return this.http.put<ProjectPhase[]>(`${this.apiUrl}/projects/${projectId}/phases/batch`, phases);
  }

  createPhase(projectId: string, phase: Partial<ProjectPhase>) {
    return this.http.post<ProjectPhase>(`${this.apiUrl}/projects/${projectId}/phases`, phase);
  }

  // --- Mortgages ---
  getMortgages(projectId: string) {
    return this.http.get<MortgageProposal[]>(`${this.apiUrl}/projects/${projectId}/mortgages`);
  }

  createMortgage(projectId: string, formData: FormData) {
    return this.http.post<MortgageProposal>(`${this.apiUrl}/projects/${projectId}/mortgages`, formData);
  }

  // --- Renovations ---
  getRenovations(projectId: string) {
    return this.http.get<RenovationProposal[]>(`${this.apiUrl}/projects/${projectId}/renovations`);
  }

  createRenovation(projectId: string, formData: FormData) {
    return this.http.post<RenovationProposal>(`${this.apiUrl}/projects/${projectId}/renovations`, formData);
  }

  // --- Gallery ---
  getGalleryFolders(projectId: string) {
    return this.http.get<PhotoFolder[]>(`${this.apiUrl}/projects/${projectId}/gallery`);
  }

  createFolder(projectId: string, name: string) {
    return this.http.post<PhotoFolder>(`${this.apiUrl}/projects/${projectId}/gallery`, { name });
  }

  uploadPhoto(projectId: string, folderId: string, formData: FormData) {
    return this.http.post<Photo>(`${this.apiUrl}/projects/${projectId}/gallery/${folderId}/photos`, formData);
  }

  // --- Documents ---
  getDocuments(projectId: string) {
    return this.http.get<DocumentOrInvoice[]>(`${this.apiUrl}/projects/${projectId}/documents`);
  }

  uploadDocument(projectId: string, formData: FormData) {
    return this.http.post<DocumentOrInvoice>(`${this.apiUrl}/projects/${projectId}/documents`, formData);
  }
}
