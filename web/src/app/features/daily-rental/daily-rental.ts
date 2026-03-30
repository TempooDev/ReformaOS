import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-daily-rental',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './daily-rental.html',
  styleUrl: './daily-rental.css'
})
export class DailyRentalComponent {
  stats = {
    occupancy: 85,
    avgDailyRate: 145,
    revenueMonth: 3820,
    upcomingCheckouts: 2
  };

  currentBooking = {
    guest: 'Sarah Jenkins',
    checkIn: 'Oct 28',
    checkOut: 'Nov 02',
    status: 'Ocupado',
    platform: 'Airbnb',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAAa1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z'
  };

  upcomingBookings = [
    { guest: 'Marco Polo', dates: 'Nov 04 - Nov 08', status: 'Confirmado', platform: 'Booking.com' },
    { guest: 'Elena Rossi', dates: 'Nov 10 - Nov 15', status: 'Pendiente', platform: 'Direct' }
  ];
}
