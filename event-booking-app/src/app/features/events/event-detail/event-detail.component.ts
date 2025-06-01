import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { EventService } from '../../../core/services/event.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AppEvent } from '../../../core/models/event.model';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { BookTicketDialogComponent } from '../book-ticket-dialog/book-ticket-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { TokenStorageService } from '../../../core/services/token-storage.service';
import { BookingService } from '../../../core/services/booking.service';
import { CancelBookingDialogComponent } from '../../../shared/bookings/cancel-booking-dialog/cancel-booking-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    CommonModule,
    RouterModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.scss']
})
export class EventDetailsComponent implements OnInit {
  event: AppEvent | null = null;
  loading = true;
  currentUserId = '';
  id: string | null = '';

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService,
    private dialog: MatDialog,
    private tokenStorageService: TokenStorageService,
    private bookingService: BookingService,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    const user = this.tokenStorageService.getUser();

    if (user && user.id) {
      this.currentUserId = user.id;
    }

    this.getEvent()
  }

  getEvent() {
    if (this.id) {
      this.eventService.getEventById(this.id).subscribe({
        next: (res) => {
          this.event = res.data;
          this.loading = false;
        },
        error: () => this.loading = false
      });
    } else {
      this.loading = false;
    }
  }

  openBookingDialog(): void {
    if (!this.event) {
      return;
    }

    const dialogRef = this.dialog.open(BookTicketDialogComponent, {
      width: '400px',
      data: { event: this.event }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(`User booked ${result} tickets.`);
        this.getEvent()
      }
    });
  }

  isUserAttending(): boolean {
    if (!this.event?.attendees || !this.currentUserId) return false;
    return this.event?.attendees.includes(this.currentUserId);
  }

  openCancelDialog(): void {
    const dialogRef = this.dialog.open(CancelBookingDialogComponent, {
      width: '350px',
      data: { eventTitle: this.event?.title }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cancelBooking();
      }
    });
  }

  cancelBooking() {
    this.bookingService.cancelBooking(this.event?.booking?._id!).subscribe({
      next: () => {
        this.snackBar.open('Booking canceled successfully!', 'Close', { duration: 3000 });
        this.getEvent();
      },
      error: (err) => {
        console.error('Error canceling booking:', err);
        this.snackBar.open('Failed to cancel booking. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }
}
