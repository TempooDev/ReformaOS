import { Component, input } from '@angular/core';

@Component({
  selector: 'app-section-header',
  standalone: true,
  imports: [],
  template: `
    <div class="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <span class="text-on-surface-variant font-bold text-xs uppercase tracking-[0.2em] mb-2 block">{{ overline() }}</span>
        <h2 class="font-headline text-4xl md:text-5xl font-extrabold text-primary tracking-tighter leading-tight">{{ title() }}</h2>
      </div>
      <div class="text-left md:text-right">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class SectionHeaderComponent {
  title = input.required<string>();
  overline = input.required<string>();
}
