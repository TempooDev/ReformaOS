import { Component, inject, input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  ProjectPhase, MortgageProposal, RenovationProposal, 
  PhotoFolder, DocumentOrInvoice, Photo 
} from '@shared';
import { ReformaService } from '../../core/services/reforma';

@Component({
  selector: 'app-renovation-manager',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './renovation-manager.html',
  styleUrl: './renovation-manager.css'
})
export class RenovationManagerComponent implements OnInit {
  private reformaService = inject(ReformaService);
  private projectId = 'reforma-arroyo'; // Default project from seeder

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

  // --- Data Signals ---
  projectPhases = signal<ProjectPhase[]>([]);
  editablePhases = signal<ProjectPhase[]>([]);
  mortgages = signal<MortgageProposal[]>([]);
  renovations = signal<RenovationProposal[]>([]);
  documentsAndInvoices = signal<DocumentOrInvoice[]>([]);
  photoFolders = signal<PhotoFolder[]>([]);

  ngOnInit() {
    this.loadAllData();
  }

  loadAllData() {
    this.reformaService.getPhases(this.projectId).subscribe(data => this.projectPhases.set(data));
    this.reformaService.getMortgages(this.projectId).subscribe(data => this.mortgages.set(data));
    this.reformaService.getRenovations(this.projectId).subscribe(data => this.renovations.set(data));
    this.reformaService.getDocuments(this.projectId).subscribe(data => this.documentsAndInvoices.set(data));
    this.reformaService.getGalleryFolders(this.projectId).subscribe(data => {
      console.log('Gallery Folders Loaded:', data);
      this.photoFolders.set(data);
    });
  }

  // --- Modal Methods ---
  openPhasesModal() { 
    this.editablePhases.set(this.projectPhases().map(p => ({ ...p })));
    this.isPhasesModalOpen.set(true); 
  }
  closePhasesModal() { this.isPhasesModalOpen.set(false); }

  addNewPhase() {
    const currentPhases = this.editablePhases();
    const newPhaseId = `TEMP-${Date.now()}`;
    this.editablePhases.update(phases => [
      ...phases,
      { id: newPhaseId, project_id: this.projectId, name: `Nueva Fase`, progress: 0, status: 'Pendiente' }
    ]);
  }

  savePhases() {
    this.reformaService.updatePhasesBatch(this.projectId, this.editablePhases()).subscribe(() => {
      this.loadAllData();
      this.closePhasesModal();
    });
  }

  updatePhaseName(id: string, newName: string) {
    this.editablePhases.update(phases => phases.map(p => p.id === id ? { ...p, name: newName } : p));
  }

  updatePhaseStatus(id: string, newStatus: string) {
    this.editablePhases.update(phases => phases.map(p => p.id === id ? { ...p, status: newStatus as ProjectPhase['status'] } : p));
  }

  updatePhaseProgress(id: string, newProgress: string) {
    this.editablePhases.update(phases => phases.map(p => p.id === id ? { ...p, progress: parseInt(newProgress, 10) } : p));
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

  selectedFiles: File[] = [];

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files) {
      this.selectedFiles = Array.from(files);
    }
  }

  uploadPhotos(description: string) {
    const folder = this.selectedFolder();
    if (!folder || this.selectedFiles.length === 0) return;

    // Upload each file (could be optimized with Promise.all)
    const uploads = this.selectedFiles.map(file => {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('description', description);
      return this.reformaService.uploadPhoto(this.projectId, folder.id, formData);
    });

    // Simple way to handle multiple uploads
    let completed = 0;
    uploads.forEach(u => {
      u.subscribe(() => {
        completed++;
        if (completed === uploads.length) {
          this.loadAllData();
          // Also update selected folder to show new photos immediately
          this.reformaService.getGalleryFolders(this.projectId).subscribe(folders => {
            const updated = folders.find(f => f.id === folder.id);
            if (updated) this.selectedFolder.set(updated);
          });
          this.closeAddPhoto();
          this.selectedFiles = [];
        }
      });
    });
  }

  createFolder(name: string) {
    this.reformaService.createFolder(this.projectId, name).subscribe(() => {
      this.loadAllData();
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
