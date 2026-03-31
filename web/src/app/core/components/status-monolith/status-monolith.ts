import { Component, input } from '@angular/core';

@Component({
  selector: 'app-status-monolith',
  standalone: true,
  imports: [],
  templateUrl: './status-monolith.html',
  styles: [`
    :host { display: block; }
  `]
})
export class StatusMonolithComponent {
  colorClass = input<string>('bg-primary');
  customColor = input<string>();
}
