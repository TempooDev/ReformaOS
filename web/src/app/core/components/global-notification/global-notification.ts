import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification';
import { ModalComponent } from '../modal/modal';

@Component({
  selector: 'app-global-notification',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  templateUrl: './global-notification.html',
  styleUrl: './global-notification.css'
})
export class GlobalNotificationComponent {
  notificationService = inject(NotificationService);

  getIcon(type: string): string {
    switch (type) {
      case 'error': return 'error';
      case 'success': return 'check_circle';
      case 'warning': return 'warning';
      default: return 'info';
    }
  }

  getColorClass(type: string): string {
    switch (type) {
      case 'error': return 'text-error bg-error/10';
      case 'success': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-[#f77d00] bg-[#f77d00]/10';
      default: return 'text-primary bg-primary/10';
    }
  }

  getButtonClass(type: string): string {
    switch (type) {
      case 'error': return 'bg-error text-white';
      case 'success': return 'bg-green-600 text-white';
      case 'warning': return 'bg-[#f77d00] text-white';
      default: return 'bg-primary text-white';
    }
  }
}
