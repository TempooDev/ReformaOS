import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ReformaService } from './core/services/reforma';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  standalone: true,
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
 reformaService = inject(ReformaService);

  ngOnInit() {
    this.reformaService.getUnidades();
  }
}
