import { Component, input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [],
  templateUrl: './stat-card.html',
  styles: [`
    :host { display: block; }
  `]
})
export class StatCardComponent {
  icon = input<string>();
  iconColorClass = input<string>('text-primary');
  label = input.required<string>();
  value = input.required<string | number>();
  subtext = input<string>();
}
