import { Component, input } from '@angular/core';

@Component({
  selector: 'app-status-monolith',
  standalone: true,
  imports: [],
  template: `
    <div class="absolute left-0 top-0 bottom-0 w-1" [class]="colorClass()" [style.backgroundColor]="customColor()"></div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class StatusMonolithComponent {
  colorClass = input<string>('bg-primary');
  customColor = input<string>();
}
