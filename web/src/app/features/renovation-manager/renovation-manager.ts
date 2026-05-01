import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { httpResource } from '@angular/common/http';
import { 
  form, FormField, submit, required, applyEach, min, max, disabled
} from '@angular/forms/signals';
import { 
  PropertyPhase, MortgageProposal, RenovationProposal, 
  PhotoFolder, DocumentOrInvoice, Photo 
} from '@shared';
import { ReformaService } from '../../core/services/reforma';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-renovation-manager',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, FormField],
  templateUrl: './renovation-manager.html',
  styleUrl: './renovation-manager.css'
})
export class RenovationManagerComponent {
  public reformaService = inject(ReformaService);
  public authService = inject(AuthService);
  private sanitizer = inject(DomSanitizer);

  // --- Resources (Auto-fetch based on activePropertyId) ---
  activeId = computed(() => this.reformaService.activePropertyId());

  phasesResource = httpResource<PropertyPhase[]>(() => 
    this.activeId() ? this.reformaService.getPhasesUrl(this.activeId()!) : undefined
  );
  
  mortgagesResource = httpResource<MortgageProposal[]>(() => 
    this.activeId() ? this.reformaService.getMortgagesUrl(this.activeId()!) : undefined
  );

  renovationsResource = httpResource<RenovationProposal[]>(() => 
    this.activeId() ? this.reformaService.getRenovationsUrl(this.activeId()!) : undefined
  );

  documentsResource = httpResource<DocumentOrInvoice[]>(() => 
    this.activeId() ? this.reformaService.getDocumentsUrl(this.activeId()!) : undefined
  );

  galleryResource = httpResource<PhotoFolder[]>(() => 
    this.activeId() ? this.reformaService.getGalleryUrl(this.activeId()!) : undefined
  );

  // Derived signals for the template
  propertyPhases = computed(() => this.phasesResource.value() ?? []);
  mortgages = computed(() => this.mortgagesResource.value() ?? []);
  renovations = computed(() => this.renovationsResource.value() ?? []);
  documentsAndInvoices = computed(() => this.documentsResource.value() ?? []);
  photoFolders = computed(() => this.galleryResource.value() ?? []);

  // --- Modals State ---
  isPhasesModalOpen = signal<boolean>(false);
  selectedMortgage = signal<MortgageProposal | null>(null);
  selectedRenovation = signal<RenovationProposal | null>(null);
  selectedFolder = signal<PhotoFolder | null>(null);
  activePhotoIndex = signal<number | null>(null);

  // --- Creation Modals State ---
  isAddMortgageModalOpen = signal<boolean>(false);
  isAddRenovationModalOpen = signal<boolean>(false);
  isAddDocumentModalOpen = signal<boolean>(false);
  isAddPhotoModalOpen = signal<boolean>(false);
  isAddFolderModalOpen = signal<boolean>(false);

  selectedFiles: File[] = [];

  // --- Signal Form for Phases ---
  phasesModel = signal<{ phases: PropertyPhase[] }>({ phases: [] });
  phasesForm = form(this.phasesModel, (s) => {
    applyEach(s.phases, (phase) => {
      required(phase.name, { message: 'El nombre es obligatorio' });
      min(phase.progress, 0);
      max(phase.progress, 100);
      required(phase.status);

      disabled(phase.name, () => this.authService.getRole() === this.authService.Role.MANAGER);
      disabled(phase.progress, () => this.authService.getRole() === this.authService.Role.MANAGER);
      disabled(phase.status, () => this.authService.getRole() === this.authService.Role.MANAGER);
    });
  });

  // Mantenemos sanitizeUrl solo para enlaces externos de documentos (a href)
  sanitizeUrl(url: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  // --- Modal Methods ---
  openPhasesModal() { 
    this.phasesModel.set({ phases: this.propertyPhases().map(p => ({ ...p })) });
    this.isPhasesModalOpen.set(true); 
  }
  closePhasesModal() { this.isPhasesModalOpen.set(false); }

  addNewPhase() {
    const pId = this.reformaService.activePropertyId();
    if (!pId) return;
    const newPhaseId = `TEMP-${Date.now()}`;
    this.phasesModel.update(m => ({
      ...m,
      phases: [
        ...m.phases,
        { id: newPhaseId, property_id: pId, name: `Nueva Fase`, progress: 0, status: 'Pendiente' }
      ]
    }));
  }

  async savePhases() {
    const pId = this.reformaService.activePropertyId();
    if (!pId) return;

    await submit(this.phasesForm, async () => {
      this.reformaService.updatePhasesBatch(pId, this.phasesModel().phases).subscribe(() => {
        this.phasesResource.reload();
        this.closePhasesModal();
      });
    });
  }

  openMortgage(mortgage: MortgageProposal) { this.selectedMortgage.set(mortgage); }
  closeMortgage() { this.selectedMortgage.set(null); }

  openRenovation(renovation: RenovationProposal) { this.selectedRenovation.set(renovation); }
  closeRenovation() { this.selectedRenovation.set(null); }

  // --- Creation Methods ---
  openAddMortgage() { this.isAddMortgageModalOpen.set(true); }
  closeAddMortgage() { this.isAddMortgageModalOpen.set(false); }

  openAddRenovation() { this.isAddRenovationModalOpen.set(true); }
  closeAddRenovation() { this.isAddRenovationModalOpen.set(false); }

  openAddDocument() { this.isAddDocumentModalOpen.set(true); }
  closeAddDocument() { this.isAddDocumentModalOpen.set(false); }

  openAddPhoto() { this.isAddPhotoModalOpen.set(true); }
  closeAddPhoto() { this.isAddPhotoModalOpen.set(false); }

  openAddFolder() { this.isAddFolderModalOpen.set(true); }
  closeAddFolder() { this.isAddFolderModalOpen.set(false); }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files) {
      this.selectedFiles = Array.from(files);
    }
  }

  uploadPhotos(description: string) {
    const pId = this.reformaService.activePropertyId();
    const folder = this.selectedFolder();
    if (!pId || !folder || this.selectedFiles.length === 0) return;

    const uploads = this.selectedFiles.map(file => {
      const formData = new FormData();
      formData.append('photo', file);
      const finalDesc = description || file.name.split('.').slice(0, -1).join('.');
      formData.append('description', finalDesc);
      return this.reformaService.uploadPhoto(pId, folder.id, formData);
    });

    let completed = 0;
    uploads.forEach(u => {
      u.subscribe(() => {
        completed++;
        if (completed === uploads.length) {
          this.galleryResource.reload();
          this.closeAddPhoto();
          this.selectedFiles = [];
        }
      });
    });
  }

  updatePhotoDescription(photoId: string, newDescription: string) {
    this.reformaService.updatePhoto(photoId, newDescription).subscribe(() => {
      this.galleryResource.reload();
    });
  }

  createFolder(name: string) {
    const pId = this.reformaService.activePropertyId();
    if (!pId) return;
    this.reformaService.createFolder(pId, name).subscribe(() => {
      this.galleryResource.reload();
      this.closeAddFolder();
    });
  }

  // --- Gallery Carousel Methods ---
  openFolder(folder: PhotoFolder) { this.selectedFolder.set(folder); }
  closeFolder() { this.selectedFolder.set(null); }
  openPhoto(index: number) { this.activePhotoIndex.set(index); }
  closeCarousel() { this.activePhotoIndex.set(null); }
  nextPhoto() {
    const folder = this.selectedFolder();
    const index = this.activePhotoIndex();
    if (folder && index !== null && folder.photos) {
      this.activePhotoIndex.set((index + 1) % folder.photos.length);
    }
  }
  prevPhoto() {
    const folder = this.selectedFolder();
    const index = this.activePhotoIndex();
    if (folder && index !== null && folder.photos) {
      this.activePhotoIndex.set((index - 1 + folder.photos.length) % folder.photos.length);
    }
  }
}
