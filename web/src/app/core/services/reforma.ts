import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Unidad } from '@shared';

@Injectable({
  providedIn: 'root',
})
export class ReformaService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000';

  // Usamos WritableSignal para un estado reactivo moderno
  unidades = signal<Unidad[]>([]);

  getUnidades() {
    this.http.get<Unidad[]>(`${this.apiUrl}/unidades`).subscribe(data => {
      this.unidades.set(data);
    });
  }
}
