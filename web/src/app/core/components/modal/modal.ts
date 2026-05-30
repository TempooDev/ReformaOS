import { Component, input, output, effect, ElementRef, viewChild, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.html',
  styleUrl: './modal.css'
})
export class ModalComponent implements OnDestroy {
  isOpen = input.required<boolean>();
  title = input<string>('');
  maxWidth = input<string>('max-w-2xl');
  showCloseButton = input<boolean>(true);
  
  close = output<void>();

  private modalContainer = viewChild<ElementRef>('modalContainer');

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });
  }

  @HostListener('document:keydown.escape')
  onEscapeKeydown() {
    if (this.isOpen()) {
      this.close.emit();
    }
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }

  onClose() {
    this.close.emit();
  }

  ngOnDestroy() {
    document.body.style.overflow = '';
  }
}
