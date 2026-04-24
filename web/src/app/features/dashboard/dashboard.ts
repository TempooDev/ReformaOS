import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReformaService } from '../../core/services/reforma';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  reformaService = inject(ReformaService);
  authService = inject(AuthService);
  unidades = this.reformaService.unidades;

  ngOnInit() {
    this.reformaService.loadProperties();
  }
}
