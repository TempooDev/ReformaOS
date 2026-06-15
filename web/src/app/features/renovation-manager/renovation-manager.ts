import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { httpResource } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { 
  form, FormField, submit, required, applyEach, min, max, disabled
} from '@angular/forms/signals';
import { 
  PropertyPhase, MortgageProposal, RenovationProposal, 
  PhotoFolder, DocumentOrInvoice, Photo 
} from '@shared';
import { ReformaService } from '../../core/services/reforma';
import { AuthService } from '../../core/services/auth';
import { NotificationService } from '../../core/services/notification';
import { ModalComponent } from '../../core/components/modal/modal';

@Component({
  selector: 'app-renovation-manager',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, FormField, ModalComponent, FormsModule],
  templateUrl: './renovation-manager.html',
  styleUrl: './renovation-manager.css'
})
export class RenovationManagerComponent {
  public reformaService = inject(ReformaService);
  public authService = inject(AuthService);
  private sanitizer = inject(DomSanitizer);
  private notificationService = inject(NotificationService);

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
  selectedDocumentFile: File | null = null;
  documentCategory = signal<string>('General');
  photoDescription = signal<string>('');
  newFolderName = signal<string>('');

  // --- Form: New Mortgage ---
  newMortgageModel = signal({
    provider: '',
    amount: 0,
    interest_rate: 0,
    type: 'Fija' as 'Fija' | 'Variable' | 'Mixta',
    term_months: 360,
    monthly_payment: 0,
    details: ''
  });
  newMortgageForm = form(this.newMortgageModel, (s) => {
    required(s.provider);
    min(s.amount, 1);
    min(s.interest_rate, 0);
  });
  mortgageFile: File | null = null;

  // --- Form: New Renovation ---
  newRenovationModel = signal({
    provider: '',
    amount: 0,
    duration_months: 12,
    details: '',
    concepts: [] as { name: string, cost: number }[]
  });
  newRenovationForm = form(this.newRenovationModel, (s) => {
    required(s.provider);
    min(s.amount, 1);
  });
  renovationFile: File | null = null;

  // --- Upload State ---

  isUploadingPhotos = signal<boolean>(false);
  uploadProgress = signal<{ total: number; current: number; failed: number }>({ total: 0, current: 0, failed: 0 });
  failedFiles = signal<string[]>([]);

  // --- Signal Form for Phases ---
  phasesModel = signal<{ phases: PropertyPhase[] }>({ phases: [] });
  phasesForm = form(this.phasesModel, (s) => {
    applyEach(s.phases, (phase) => {
      required(phase.name, { message: 'Name is required' });
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
        { id: newPhaseId, property_id: pId, name: `New Phase`, progress: 0, status: 'Pending', budget: 0, spent: 0 }
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
  openAddMortgage() { 
    this.mortgageFile = null;
    this.newMortgageModel.set({
      provider: '', amount: 0, interest_rate: 0, 
      type: 'Fija', term_months: 360, monthly_payment: 0, details: ''
    });
    this.isAddMortgageModalOpen.set(true); 
  }
  closeAddMortgage() { this.isAddMortgageModalOpen.set(false); }

  onMortgageFileSelected(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) this.mortgageFile = files[0];
  }

  async saveMortgage() {
    const pId = this.activeId();
    if (!pId) return;

    await submit(this.newMortgageForm, async () => {
      const formData = new FormData();
      const model = this.newMortgageModel();
      formData.append('provider', model.provider);
      formData.append('amount', model.amount.toString());
      formData.append('interest_rate', model.interest_rate.toString());
      formData.append('type', model.type);
      formData.append('term_months', model.term_months.toString());
      formData.append('monthly_payment', model.monthly_payment.toString());
      formData.append('details', model.details);
      if (this.mortgageFile) formData.append('document', this.mortgageFile);

      this.reformaService.createMortgage(pId, formData).subscribe({
        next: () => {
          this.mortgagesResource.reload();
          this.closeAddMortgage();
          this.notificationService.success('Success', 'Mortgage proposal saved.');
        },
        error: () => this.notificationService.error('Error', 'Could not save mortgage proposal.')
      });
    });
  }

  openAddRenovation() { 
    this.renovationFile = null;
    this.newRenovationModel.set({
      provider: '', amount: 0, duration_months: 12, details: '', concepts: []
    });
    this.isAddRenovationModalOpen.set(true); 
  }
  closeAddRenovation() { this.isAddRenovationModalOpen.set(false); }

  onRenovationFileSelected(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) this.renovationFile = files[0];
  }

  addRenovationConcept() {
    this.newRenovationModel.update(m => ({
      ...m,
      concepts: [...m.concepts, { name: '', cost: 0 }]
    }));
  }

  removeRenovationConcept(index: number) {
    this.newRenovationModel.update(m => ({
      ...m,
      concepts: m.concepts.filter((_, i) => i !== index)
    }));
  }

  async saveRenovation() {
    const pId = this.activeId();
    if (!pId) return;

    await submit(this.newRenovationForm, async () => {
      const formData = new FormData();
      const model = this.newRenovationModel();
      formData.append('provider', model.provider);
      formData.append('amount', model.amount.toString());
      formData.append('duration_months', model.duration_months.toString());
      formData.append('details', model.details);
      formData.append('concepts', JSON.stringify(model.concepts));
      if (this.renovationFile) formData.append('document', this.renovationFile);

      this.reformaService.createRenovation(pId, formData).subscribe({
        next: () => {
          this.renovationsResource.reload();
          this.closeAddRenovation();
          this.notificationService.success('Success', 'Renovation budget saved.');
        },
        error: () => this.notificationService.error('Error', 'Could not save renovation budget.')
      });
    });
  }

  openAddDocument() { 
    this.selectedDocumentFile = null;
    this.documentCategory.set('General');
    this.isAddDocumentModalOpen.set(true); 
  }
  closeAddDocument() { this.isAddDocumentModalOpen.set(false); }

  onDocumentFileSelected(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.selectedDocumentFile = files[0];
    }
  }

  uploadDocument() {
    const pId = this.reformaService.activePropertyId();
    if (!pId || !this.selectedDocumentFile) return;

    const formData = new FormData();
    formData.append('file', this.selectedDocumentFile);
    formData.append('type', 'Document');
    formData.append('category', this.documentCategory());

    this.reformaService.uploadDocument(pId, formData).subscribe({
      next: () => {
        this.documentsResource.reload();
        this.closeAddDocument();
        this.notificationService.success('Success', 'Document uploaded successfully.');
      },
      error: (err) => {
        const errorMsg = err.error?.error || 'Could not upload document.';
        this.notificationService.error('Error Uploading Document', errorMsg);
      }
    });
  }

  openAddPhoto() { 
    this.resetUploadState();
    this.isAddPhotoModalOpen.set(true); 
  }
  closeAddPhoto() { 
    if (this.isUploadingPhotos()) return;
    this.isAddPhotoModalOpen.set(false); 
    this.resetUploadState();
  }

  resetUploadState() {
    this.isUploadingPhotos.set(false);
    this.uploadProgress.set({ total: 0, current: 0, failed: 0 });
    this.failedFiles.set([]);
    this.selectedFiles = [];
    this.photoDescription.set('');
  }

  openAddFolder() { this.isAddFolderModalOpen.set(true); }
  closeAddFolder() { 
    this.isAddFolderModalOpen.set(false);
    this.newFolderName.set('');
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files) {
      this.selectedFiles = Array.from(files);
    }
  }

  uploadPhotos() {
    const pId = this.reformaService.activePropertyId();
    const folder = this.selectedFolder();
    if (!pId || !folder || this.selectedFiles.length === 0) return;

    if (!folder.id) {
      this.notificationService.error(
        'Invalid Folder',
        `The folder "${folder.name}" does not have a valid ID. Please try creating a new folder to upload photos.`
      );
      return;
    }

    this.isUploadingPhotos.set(true);
    const total = this.selectedFiles.length;
    this.uploadProgress.set({ total, current: 0, failed: 0 });
    this.failedFiles.set([]);

    const description = this.photoDescription();
    let completed = 0;
    let failedCount = 0;

    this.selectedFiles.forEach(file => {
      const formData = new FormData();
      formData.append('photo', file);
      const finalDesc = description || file.name.split('.').slice(0, -1).join('.');
      formData.append('description', finalDesc);

      this.reformaService.uploadPhoto(pId, folder.id, formData).subscribe({
        next: () => {
          completed++;
          this.uploadProgress.update(p => ({ ...p, current: completed }));
          this.checkUploadComplete(completed, failedCount, total);
        },
        error: (err) => {
          completed++;
          failedCount++;
          const errorMsg = err.error?.error || 'Unknown error';
          this.failedFiles.update(f => [...f, `${file.name}: ${errorMsg}`]);
          this.uploadProgress.update(p => ({ ...p, current: completed, failed: failedCount }));
          this.checkUploadComplete(completed, failedCount, total);
        }
      });
    });
  }

  private checkUploadComplete(completed: number, failed: number, total: number) {
    if (completed === total) {
      this.galleryResource.reload();
      if (failed === 0) {
        this.closeAddPhoto();
      } else {
        this.isUploadingPhotos.set(false);
      }
    }
  }

  updatePhotoDescription(photoId: string, newDescription: string) {
    this.reformaService.updatePhoto(photoId, newDescription).subscribe(() => {
      this.galleryResource.reload();
    });
  }

  createFolder() {
    const name = this.newFolderName();
    if (!name.trim()) {
      this.notificationService.warning('Field Required', 'Please enter a name for the folder.');
      return;
    }

    const pId = this.reformaService.activePropertyId();
    if (!pId) return;

    this.reformaService.createFolder(pId, name).subscribe({
      next: () => {
        this.galleryResource.reload();
        this.closeAddFolder();
        this.newFolderName.set('');
      },
      error: (err) => {
        const errorMsg = err.error?.error || 'Could not create folder.';
        this.notificationService.error('Error Creating Folder', errorMsg);
      }
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
