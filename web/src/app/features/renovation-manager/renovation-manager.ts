import { Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface MortgageProposal {
  id: string;
  provider: string;
  amount: number;
  interestRate: number;
  type: 'Fija' | 'Variable' | 'Mixta';
  bonuses: string[];
  monthlyPayment: number;
  status: 'In Review' | 'Approved' | 'Rejected';
  details: string;
}

export interface RenovationConcept {
  name: string;
  cost: number;
}

export interface RenovationProposal {
  id: string;
  provider: string;
  amount: number;
  durationMonths: number;
  concepts: RenovationConcept[];
  status: 'In Review' | 'Approved' | 'Rejected';
  details: string;
}

export interface ProjectPhase {
  id: string;
  name: string;
  progress: number;
  status: 'Completado' | 'En curso' | 'Pendiente';
}

export interface DocumentOrInvoice {
  id: string;
  fileName: string;
  type: 'Invoice' | 'Document';
  updatedAt: string;
  status: 'Pending' | 'Approved' | 'Paid' | 'In Review';
  previewUrl: string;
}

export interface Photo {
  id: string;
  url: string;
  description: string;
}

export interface PhotoFolder {
  id: string;
  name: string;
  photoCount: number;
  coverUrl: string;
  updatedAt: string;
  photos: Photo[];
}

@Component({
  selector: 'app-renovation-manager',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './renovation-manager.html',
  styleUrl: './renovation-manager.css'
})
export class RenovationManagerComponent {
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
  projectPhases = signal<ProjectPhase[]>([
    { id: 'PHS-1', name: 'Fase 1: Demolición', progress: 100, status: 'Completado' },
    { id: 'PHS-2', name: 'Fase 2: Estructura', progress: 35, status: 'En curso' },
    { id: 'PHS-3', name: 'Fase 3: Instalaciones', progress: 0, status: 'Pendiente' },
    { id: 'PHS-4', name: 'Fase 4: Acabados', progress: 0, status: 'Pendiente' }
  ]);

  editablePhases = signal<ProjectPhase[]>([]);

  mortgages = input<MortgageProposal[]>([
    { 
      id: 'M-1', provider: 'Banco Santander', amount: 150000, interestRate: 2.8, type: 'Fija', 
      bonuses: ['Nómina', 'Seguro Hogar'], monthlyPayment: 616.40, status: 'Approved',
      details: 'Hipoteca a 30 años con vinculaciones mínimas obligatorias. No incluye seguro de vida, solo seguro de hogar básico y nómina domiciliada.'
    },
    { 
      id: 'M-2', provider: 'BBVA', amount: 150000, interestRate: 2.5, type: 'Mixta', 
      bonuses: ['Nómina', 'Seguro Vida', 'Seguro Hogar'], monthlyPayment: 590.20, status: 'In Review',
      details: 'Tipo fijo al 2.5% los primeros 10 años, luego Euribor + 0.70%. Requiere alta vinculación.'
    }
  ]);

  renovations = input<RenovationProposal[]>([
    {
      id: 'R-1', provider: 'Arquitectura Studio', amount: 45000, durationMonths: 4,
      concepts: [
        { name: 'Proyecto Básico y de Ejecución', cost: 4500 },
        { name: 'Dirección Facultativa', cost: 2500 },
        { name: 'Demoliciones y Desescombro', cost: 8000 },
        { name: 'Albañilería y Tabiquería', cost: 12000 },
        { name: 'Instalaciones (Fontanería/Elec)', cost: 10000 },
        { name: 'Acabados y Pintura', cost: 8000 }
      ],
      status: 'In Review',
      details: 'Presupuesto cerrado llave en mano. Incluye gestión de licencias de obra mayor y dirección facultativa. Materiales calidad media-alta.'
    },
    {
      id: 'R-2', provider: 'Constructora Local', amount: 38000, durationMonths: 5,
      concepts: [
        { name: 'Ejecución de Obra', cost: 30000 },
        { name: 'Materiales básicos', cost: 8000 }
      ],
      status: 'In Review',
      details: 'No incluye honorarios técnicos ni licencias. Materiales a elegir por la propiedad en almacenes asociados. Plazo estimado no vinculante.'
    }
  ]);

  documentsAndInvoices = input<DocumentOrInvoice[]>([
    { id: 'DOC-1', fileName: 'Planos_Estructurales_v2.pdf', type: 'Document', updatedAt: '2023-10-15', status: 'Approved', previewUrl: '#' },
    { id: 'INV-1', fileName: 'Factura_Materiales_Oct.pdf', type: 'Invoice', updatedAt: '2023-10-18', status: 'Pending', previewUrl: '#' },
    { id: 'DOC-2', fileName: 'Licencia_Obra_Mayor.pdf', type: 'Document', updatedAt: '2023-09-01', status: 'Approved', previewUrl: '#' },
    { id: 'INV-2', fileName: 'Factura_Arquitecto_Adelanto.pdf', type: 'Invoice', updatedAt: '2023-09-15', status: 'Paid', previewUrl: '#' },
  ]);

  photoFolders = input<PhotoFolder[]>([
    { 
      id: 'F-1', 
      name: 'Estado Original', 
      photoCount: 3, 
      coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGYM46gj179-uWmN6Dm5rNEgXtkhuhOTIa0ow9rPyb0rlOklD9aHfTIqFfeZzPLcYTgfzc5QJBltEvm6tDcRtsHf3rnJWEunJY0seoLaEhV8QJ6vA2QoJLmp_FmIERvhVyjB1t5KcjlPUYS64ZTi52aUJjWRIVlQ3L4pOXZqzHr6HwHAb9JAk1wE1Mbv8khL-Pru2NoO2Tl05WAq4tD5MYn6TNywn89annsg13r_iJ6Vl97JvokzUyy-3t6ruJ_mI2Y0OCqUvDfno',
      updatedAt: '2023-09-01',
      photos: [
        { id: 'PH-1-1', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGYM46gj179-uWmN6Dm5rNEgXtkhuhOTIa0ow9rPyb0rlOklD9aHfTIqFfeZzPLcYTgfzc5QJBltEvm6tDcRtsHf3rnJWEunJY0seoLaEhV8QJ6vA2QoJLmp_FmIERvhVyjB1t5KcjlPUYS64ZTi52aUJjWRIVlQ3L4pOXZqzHr6HwHAb9JAk1wE1Mbv8khL-Pru2NoO2Tl05WAq4tD5MYn6TNywn89annsg13r_iJ6Vl97JvokzUyy-3t6ruJ_mI2Y0OCqUvDfno', description: 'Plano base estructural' },
        { id: 'PH-1-2', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMfWJj2J8yenVfPDUZuN5A4sohihfUP9sQuZtazwdCsnVR7YC0qFV5ALRNGfG6jeZnD7YtJEbZqiE94FEm9h3pVAxVg6pmB_JHhwpEf4FGoJtV-vMbx5_dLV8mWvyexNlqRFAnr70P3ojtZbTM9jE-fKcql6IXhLWH3mboiq5fEde2oJVyGk6VlTZgCtNeb-ldpB_ho2kDIA4dZCPvd4goVSk3Jr0CsJZ2EfvCBoN42xVTTeOmLRlYrte-gwfQnUgOBx9BeKleIi4', description: 'Vista general salón original' },
        { id: 'PH-1-3', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDv9YOup5cT1yYxAi8AIglKm81l6wMYwQJXqNZbUZ2zc5j0mfLzq6y_eTio03w_OXJCZALYeS1HHaNo9uYwM9OLpTTnC3tI37DQL5RIpmxV8azTuQAcL7V4XSE734s-MGUqcMQSkoOaY4DZ-kT2Bv_7IkmAMaUHu1QKDPIjSuB9oAH-ngQjC4fEIGsjlN9RgHl-ZOAwMcpPebuGxu0WlgO1icbB7UmbPtVG-l8nzapIKiIQs7dL9L0sNr0eYFOOmoVUa26csh1huy8', description: 'Detalle instalaciones tuberías' }
      ]
    },
    { 
      id: 'F-2', 
      name: 'Demolición', 
      photoCount: 1, 
      coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMfWJj2J8yenVfPDUZuN5A4sohihfUP9sQuZtazwdCsnVR7YC0qFV5ALRNGfG6jeZnD7YtJEbZqiE94FEm9h3pVAxVg6pmB_JHhwpEf4FGoJtV-vMbx5_dLV8mWvyexNlqRFAnr70P3ojtZbTM9jE-fKcql6IXhLWH3mboiq5fEde2oJVyGk6VlTZgCtNeb-ldpB_ho2kDIA4dZCPvd4goVSk3Jr0CsJZ2EfvCBoN42xVTTeOmLRlYrte-gwfQnUgOBx9BeKleIi4',
      updatedAt: '2023-09-20',
      photos: [
        { id: 'PH-2-1', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMfWJj2J8yenVfPDUZuN5A4sohihfUP9sQuZtazwdCsnVR7YC0qFV5ALRNGfG6jeZnD7YtJEbZqiE94FEm9h3pVAxVg6pmB_JHhwpEf4FGoJtV-vMbx5_dLV8mWvyexNlqRFAnr70P3ojtZbTM9jE-fKcql6IXhLWH3mboiq5fEde2oJVyGk6VlTZgCtNeb-ldpB_ho2kDIA4dZCPvd4goVSk3Jr0CsJZ2EfvCBoN42xVTTeOmLRlYrte-gwfQnUgOBx9BeKleIi4', description: 'Retirada de tabiquería' }
      ]
    },
    { 
      id: 'F-3', 
      name: 'Instalaciones', 
      photoCount: 1, 
      coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDv9YOup5cT1yYxAi8AIglKm81l6wMYwQJXqNZbUZ2zc5j0mfLzq6y_eTio03w_OXJCZALYeS1HHaNo9uYwM9OLpTTnC3tI37DQL5RIpmxV8azTuQAcL7V4XSE734s-MGUqcMQSkoOaY4DZ-kT2Bv_7IkmAMaUHu1QKDPIjSuB9oAH-ngQjC4fEIGsjlN9RgHl-ZOAwMcpPebuGxu0WlgO1icbB7UmbPtVG-l8nzapIKiIQs7dL9L0sNr0eYFOOmoVUa26csh1huy8',
      updatedAt: '2023-10-10',
      photos: [
        { id: 'PH-3-1', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDv9YOup5cT1yYxAi8AIglKm81l6wMYwQJXqNZbUZ2zc5j0mfLzq6y_eTio03w_OXJCZALYeS1HHaNo9uYwM9OLpTTnC3tI37DQL5RIpmxV8azTuQAcL7V4XSE734s-MGUqcMQSkoOaY4DZ-kT2Bv_7IkmAMaUHu1QKDPIjSuB9oAH-ngQjC4fEIGsjlN9RgHl-ZOAwMcpPebuGxu0WlgO1icbB7UmbPtVG-l8nzapIKiIQs7dL9L0sNr0eYFOOmoVUa26csh1huy8', description: 'Nuevos puntos de luz' }
      ]
    }
  ]);

  // --- Modal Methods ---
  openPhasesModal() { 
    // Clone the phases so we don't mutate original state until save
    this.editablePhases.set(this.projectPhases().map(p => ({ ...p })));
    this.isPhasesModalOpen.set(true); 
  }
  closePhasesModal() { 
    this.isPhasesModalOpen.set(false); 
  }

  addNewPhase() {
    const currentPhases = this.editablePhases();
    const newPhaseId = `PHS-${currentPhases.length + 1}`;
    this.editablePhases.update(phases => [
      ...phases,
      { id: newPhaseId, name: `Fase ${currentPhases.length + 1}: Nueva Fase`, progress: 0, status: 'Pendiente' }
    ]);
  }

  savePhases() {
    this.projectPhases.set(this.editablePhases());
    this.closePhasesModal();
  }

  updatePhaseName(id: string, newName: string) {
    this.editablePhases.update(phases => 
      phases.map(p => p.id === id ? { ...p, name: newName } : p)
    );
  }

  updatePhaseStatus(id: string, newStatus: string) {
    this.editablePhases.update(phases => 
      phases.map(p => p.id === id ? { ...p, status: newStatus as ProjectPhase['status'] } : p)
    );
  }

  updatePhaseProgress(id: string, newProgress: string) {
    this.editablePhases.update(phases => 
      phases.map(p => p.id === id ? { ...p, progress: parseInt(newProgress, 10) } : p)
    );
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

  // --- Gallery Carousel Methods ---
  openFolder(folder: PhotoFolder) { this.selectedFolder.set(folder); }
  closeFolder() { this.selectedFolder.set(null); }
  openPhoto(index: number) { this.activePhotoIndex.set(index); }
  closeCarousel() { this.activePhotoIndex.set(null); }
  nextPhoto() {
    const folder = this.selectedFolder();
    const index = this.activePhotoIndex();
    if (folder && index !== null) {
      this.activePhotoIndex.set((index + 1) % folder.photos.length);
    }
  }
  prevPhoto() {
    const folder = this.selectedFolder();
    const index = this.activePhotoIndex();
    if (folder && index !== null) {
      this.activePhotoIndex.set((index - 1 + folder.photos.length) % folder.photos.length);
    }
  }
}
