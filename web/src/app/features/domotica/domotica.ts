import { Component, input } from '@angular/core';
import { Camera, Light } from '@shared';

@Component({
  selector: 'app-domotica',
  standalone: true,
  imports: [],
  templateUrl: './domotica.html',
  styleUrl: './domotica.css'
})
export class DomoticaComponent {
  // Usamos inputs con valores por defecto para mantener el dinamismo
  cameras = input<Camera[]>([
    { name: 'Entrada Principal', status: 'En vivo', icon: 'nest_cam_outdoor', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAAa1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z' },
    { name: 'Salón', status: 'En vivo', icon: 'videocam', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBb1c2d3e4f5g6h7i8j9k0l1m2n3o4p5q6r7s8t9u0v1w2x3y4z5a' },
  ]);

  lights = input<Light[]>([
    { name: 'Salón', status: true, brightness: 80 },
    { name: 'Cocina', status: false, brightness: 0 },
    { name: 'Dormitorio', status: true, brightness: 40 },
  ]);
}
