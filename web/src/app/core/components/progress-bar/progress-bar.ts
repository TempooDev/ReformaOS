import { Component, input } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [],
  template: `
    <div [class]="containerClass()">
      <div class="h-full rounded-full transition-all duration-1000 ease-out relative" 
           [class]="barClass()" 
           [style.width.%]="progress()">
        @if (showOverlay()) {
          <div class="absolute inset-0 bg-white/10 mix-blend-overlay"></div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; }
  `]
})
export class ProgressBarComponent {
  progress = input.required<number>();
  containerClass = input<string>('relative h-4 w-full bg-surface-container-high rounded-full overflow-hidden p-0.5 shadow-inner');
  barClass = input<string>('bg-gradient-to-r from-primary to-on-primary-container');
  showOverlay = input<boolean>(false);
}
