import { Injectable, signal, computed } from '@angular/core';

export type NotificationType = 'error' | 'success' | 'warning' | 'info';

export interface Notification {
  type: NotificationType;
  title: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private currentNotification = signal<Notification | null>(null);
  
  notification = computed(() => this.currentNotification());
  isOpen = computed(() => this.currentNotification() !== null);

  notify(notification: Notification) {
    this.currentNotification.set(notification);
  }

  error(title: string, message: string) {
    this.notify({ type: 'error', title, message });
  }

  success(title: string, message: string) {
    this.notify({ type: 'success', title, message });
  }

  warning(title: string, message: string) {
    this.notify({ type: 'warning', title, message });
  }

  info(title: string, message: string) {
    this.notify({ type: 'info', title, message });
  }

  close() {
    this.currentNotification.set(null);
  }
}
