import { Component, input } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [],
  templateUrl: './progress-bar.html',
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
