import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BookingService } from '../../../core/services/booking.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-my-bookings-list',
  imports: [CommonModule, MatTableModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    MatIconModule,],
  templateUrl: './my-bookings-list.component.html',
  styleUrl: './my-bookings-list.component.scss'
})
export class MyBookingsListComponent implements OnInit {
  bookings: any[] = [];
  loading = false;
  error = '';

displayedColumns: string[] = ['title', 'date', 'tickets', 'bookedAt'];

  constructor(private bookingService: BookingService, private router: Router) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings() {
    this.loading = true;
    this.bookingService.getMyBookings().subscribe({
      next: (res) => {
        this.bookings = res.data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load bookings';
        this.loading = false;
      }
    });
  }

  viewDetails(bookingId: string) {
    this.router.navigate([`bookings/${bookingId}`]);
  }
}
