import { Component, input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [],
  template: `
    <div class="bg-surface-container-lowest p-6 rounded-xl border border-slate-50 shadow-sm flex flex-col h-full">
      @if (icon()) {
        <span class="material-symbols-outlined mb-4 text-3xl" [class]="iconColorClass()">{{ icon() }}</span>
      }
      <h4 class="font-bold text-primary text-xs uppercase tracking-widest mb-1">{{ label() }}</h4>
      <p class="text-3xl font-headline font-black text-primary">{{ value() }}</p>
      @if (subtext()) {
        <p class="text-[10px] text-on-surface-variant font-medium mt-1">{{ subtext() }}</p>
      }
    </div>
  `,
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
