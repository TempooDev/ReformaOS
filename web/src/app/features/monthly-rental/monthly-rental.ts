import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-monthly-rental',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './monthly-rental.html',
  styleUrl: './monthly-rental.css'
})
export class MonthlyRentalComponent {
  tenant = {
    name: 'Julian M. Rodriguez',
    location: 'Calle de Velázquez 45, Apt 4B',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCX0pqTqqB0g7LRGcBnaAofBJGPEIigyndCeS6mrMGZCGNr_eCZjDyUERIWQLm-M5i2hs6E7EPeuvQmyYLx768RvH6A7YTohBx_D5k2oabjT-dqQ9rT--QPk-hMQHKvRn-zDEandLwXDXCUH9nJgpprbSbzGetdduuu3h_Wyp_RPjb1TurF9nTgUyt3blz3u_LXxazeLP8fQr6ldwCrUtwuArqaOBXu5dTV7SFtQ2Y_LTxBLcvKezxHsGSst-0UP4yqGfbd2emAA2g',
    rent: 2450,
    nextPayment: 'Oct 01',
    deposit: 4900
  };

  transactions = [
    { title: 'September 2024 Rent', date: 'Sep 02, 2024', amount: 2450, status: 'Success' },
    { title: 'August 2024 Rent', date: 'Aug 01, 2024', amount: 2450, status: 'Success' }
  ];
}
