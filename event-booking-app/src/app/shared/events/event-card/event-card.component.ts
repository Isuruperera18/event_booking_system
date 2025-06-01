import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { AppEvent } from '../../../core/models/event.model';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { BookTicketDialogComponent } from '../../../features/events/book-ticket-dialog/book-ticket-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { TokenStorageService } from '../../../core/services/token-storage.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BookingService } from '../../../core/services/booking.service';
import { EventService } from '../../../core/services/event.service';
import { Booking } from '../../../core/models/booking.model';
import { CancelBookingDialogComponent } from '../../bookings/cancel-booking-dialog/cancel-booking-dialog.component';

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule
  ],
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.scss'],
})
export class EventCardComponent implements OnInit {
  @Input() event!: AppEvent;
  @Output() book = new EventEmitter<void>();
  @Output() cardClick = new EventEmitter<void>();
  loading = true;
  safeImageURL!: SafeUrl;
  currentUserId = '';

  constructor(
    private sanitizer: DomSanitizer,
    private dialog: MatDialog,
    private tokenStorageService: TokenStorageService,
    private snackBar: MatSnackBar,
    private bookingService: BookingService,
  ) { }

  ngOnInit(): void {
    const user = this.tokenStorageService.getUser();

    if (user && user.id) {
      this.currentUserId = user.id;
    }

    if (this.event?.imageURL) {
      this.safeImageURL = this.sanitizer.bypassSecurityTrustUrl(this.event.imageURL);
    } else {
      this.safeImageURL = this.sanitizer.bypassSecurityTrustUrl('assets/default.jpg');
    }
  }

  onCardClick() {
    this.cardClick.emit();
  }

  openBookingDialog(event: AppEvent): void {  // replace EventType with your actual event type
    const dialogRef = this.dialog.open(BookTicketDialogComponent, {
      width: '400px',
      data: { event }  // passing the event inside data
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(`User booked ${result} tickets.`);
        this.onBookEvent(result)
      }
    });
  }

  isUserAttending(event: AppEvent): boolean {
    if (!event.attendees || !this.currentUserId) return false;
    return event.attendees.includes(this.currentUserId);
  }

  openCancelDialog(): void {
    const dialogRef = this.dialog.open(CancelBookingDialogComponent, {
      width: '350px',
      data: { eventTitle: this.event.title }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cancelBooking(this.event);
      }
    });
  }

  cancelBooking(event: AppEvent) {
    this.bookingService.cancelBooking(event.booking?._id!).subscribe({
      next: () => {
        this.snackBar.open('Booking canceled successfully!', 'Close', { duration: 3000 });
        this.book.emit();
      },
      error: (err) => {
        console.error('Error canceling booking:', err);
        this.snackBar.open('Failed to cancel booking. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }

  onBookEvent(tickets: number) {
    const booking: Booking = {
      eventId: this.event._id!,
      tickets,
    }

    this.bookingService.createBooking(booking).subscribe({
      next: (createdEvent) => {
        this.loading = false;
        this.snackBar.open('Event booked successfully!', 'Close', { duration: 3000 });
        this.book.emit();
      },
      error: (err) => {
        this.loading = false;
        console.error('Error booking event:', err);
        this.snackBar.open('Failed to book event. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }
}
