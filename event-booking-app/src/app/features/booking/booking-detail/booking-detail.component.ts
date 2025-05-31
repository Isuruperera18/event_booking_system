import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BookingService } from '../../../core/services/booking.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-booking-detail',
  imports: [CommonModule, MatProgressSpinnerModule, MatButtonModule, RouterModule],
  templateUrl: './booking-detail.component.html',
  styleUrl: './booking-detail.component.scss'
})
export class BookingDetailComponent implements OnInit {
  bookingId!: string;
  booking: any;
  loading = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private bookingService: BookingService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.bookingId = this.route.snapshot.paramMap.get('id')!;
    this.loadBooking();
  }

  loadBooking() {
    this.loading = true;
    this.bookingService.getBooking(this.bookingId).subscribe({
      next: (res: { data: any; }) => {
        this.booking = res.data;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Failed to load booking details.';
        this.loading = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/bookings/my']);
  }
}