import { Component, inject, computed, signal } from '@angular/core';
import { DecimalPipe, CommonModule } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { DailyRentalStats, Booking } from '@shared';
import { StatCardComponent } from '../../core/components/stat-card/stat-card';
import { ReformaService } from '../../core/services/reforma';

@Component({
  selector: 'app-daily-rental',
  standalone: true,
  imports: [DecimalPipe, CommonModule, StatCardComponent],
  templateUrl: './daily-rental.html',
  styleUrl: './daily-rental.css'
})
export class DailyRentalComponent {
  private reformaService = inject(ReformaService);

  // --- State ---
  currentMonth = signal(new Date());

  // --- Resources ---
  activeId = computed(() => this.reformaService.activePropertyId());

  statsResource = httpResource<DailyRentalStats>(() => 
    this.activeId() ? this.reformaService.getRentalStatsUrl(this.activeId()!) : undefined
  );

  bookingsResource = httpResource<Booking[]>(() => 
    this.activeId() ? this.reformaService.getBookingsUrl(this.activeId()!) : undefined
  );

  // --- Derived Signals ---
  stats = computed<DailyRentalStats>(() => this.statsResource.value() ?? {
    occupancy: 0,
    avgDailyRate: 0,
    revenueMonth: 0,
    upcomingCheckouts: 0
  });

  allBookings = computed(() => this.bookingsResource.value() ?? []);

  currentBooking = computed(() => {
    const booking = this.allBookings().find(b => b.status === 'Ocupado') ?? null;
    if (booking) {
      return {
        ...booking,
        checkIn: booking.check_in,
        checkOut: booking.check_out
      };
    }
    return null;
  });

  upcomingBookings = computed(() => 
    this.allBookings()
      .filter(b => b.status !== 'Ocupado')
      .map(b => {
        const start = b.check_in ? new Date(b.check_in) : new Date();
        const end = b.check_out ? new Date(b.check_out) : new Date();
        return {
          ...b,
          checkIn: b.check_in,
          checkOut: b.check_out,
          dates: `${start.toLocaleDateString('es-ES', { month: 'short', day: '2-digit' })} - ${end.toLocaleDateString('es-ES', { month: 'short', day: '2-digit' })}`
        };
      })
  );

  nextCleaning = computed(() => {
    const current = this.currentBooking();
    if (!current || !current.check_out) return null;

    const checkoutDate = new Date(current.check_out);
    const now = new Date();

    let label = checkoutDate.toLocaleDateString('es-ES', { month: 'short', day: '2-digit' });
    if (checkoutDate.toDateString() === new Date(now.getTime() + 86400000).toDateString()) {
      label = 'Tomorrow';
    }

    return {
      label,
      fullDate: checkoutDate,
      time: '11:00 AM'
    };
  });

  calendarDays = computed(() => {
    const date = this.currentMonth();
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: { day: number | null, isOccupied: boolean }[] = [];

    // Padding for first week
    const padding = firstDay === 0 ? 6 : firstDay - 1; // Adjust for Mon-Sun week
    for (let i = 0; i < padding; i++) {
      days.push({ day: null, isOccupied: false });
    }

    const bookings = this.allBookings();

    for (let d = 1; d <= daysInMonth; d++) {
      const currentDay = new Date(year, month, d);
      const isOccupied = bookings.some(b => {
        const start = new Date(b.check_in!);
        const end = new Date(b.check_out!);
        return currentDay >= start && currentDay <= end;
      });

      days.push({ day: d, isOccupied });
    }

    return days;
  });
}

