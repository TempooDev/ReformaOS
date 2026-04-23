import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SectionHeaderComponent } from '../../core/components/section-header/section-header';
import { StatusMonolithComponent } from '../../core/components/status-monolith/status-monolith';
import { ProgressBarComponent } from '../../core/components/progress-bar/progress-bar';

@Component({
  selector: 'app-my-home',
  standalone: true,
  imports: [RouterModule, StatusMonolithComponent],
  templateUrl: './my-home.html',
  styleUrl: './my-home.css'
})
export class MyHomeComponent {}
