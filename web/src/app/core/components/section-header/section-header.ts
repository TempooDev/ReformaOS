import { Component, input } from '@angular/core';

@Component({
  selector: 'app-section-header',
  standalone: true,
  imports: [],
  templateUrl: './section-header.html',
  styles: [`
    :host { display: block; }
  `]
})
export class SectionHeaderComponent {
  title = input.required<string>();
  overline = input.required<string>();
}
