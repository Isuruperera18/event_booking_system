import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AppEvent } from '../../../core/models/event.model';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BookingService } from '../../../core/services/booking.service';

@Component({
  selector: 'app-book-ticket-dialog',
  imports: [MatIconModule,FormsModule, MatDialogModule, MatFormFieldModule, CommonModule, MatInputModule, MatButtonModule],
  templateUrl: './book-ticket-dialog.component.html',
  styleUrl: './book-ticket-dialog.component.scss'
})
export class BookTicketDialogComponent {
  ticketCount: number = 1;
loading = true;
  constructor(private dialogRef: MatDialogRef<BookTicketDialogComponent>, 
    @Inject(MAT_DIALOG_DATA) public data: { event: AppEvent },
  private snackBar: MatSnackBar,
  private bookingService: BookingService) {

    console.log('Received event:', data.event);
  }
  book(): void {
    console.log(`Booked ${this.ticketCount} tickets.`);
    this.dialogRef.close(this.ticketCount);
  }

    onBookEvent() {

    this.bookingService.createBooking(this.data.event._id!).subscribe({
      next: (createdEvent) => {
        this.loading = false;
        this.snackBar.open('Event booked successfully!', 'Close', { duration: 3000 });
        this.dialogRef.close(this.ticketCount);
      },
      error: (err) => {
        this.loading = false;
        console.error('Error booking event:', err);
        this.snackBar.open('Failed to book event. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }
}
