import { Component, inject, computed } from '@angular/core';
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
}
