import { Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Proposal {
  id: string;
  type: 'Mortgage' | 'Renovation';
  provider: string;
  amount: number;
  status: string;
  highlight?: string;
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
  proposals = input<Proposal[]>([
    { id: 'P-1', type: 'Renovation', provider: 'Arquitectura Studio', amount: 45000, status: 'In Review', highlight: 'Diseño integral' },
    { id: 'P-2', type: 'Mortgage', provider: 'Banco Central', amount: 150000, status: 'Approved', highlight: 'Interés fijo 2.5%' }
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

  selectedFolder = signal<PhotoFolder | null>(null);
  activePhotoIndex = signal<number | null>(null);

  openFolder(folder: PhotoFolder) {
    this.selectedFolder.set(folder);
  }

  closeFolder() {
    this.selectedFolder.set(null);
  }

  openPhoto(index: number) {
    this.activePhotoIndex.set(index);
  }

  closeCarousel() {
    this.activePhotoIndex.set(null);
  }

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
