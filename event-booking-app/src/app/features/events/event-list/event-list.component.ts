// src/app/event-list/event-list.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AppEvent } from '../../../core/models/event.model';
import { EventService } from '../../../core/services/event.service';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule } from '@angular/material/sort';
import { CommonModule } from '@angular/common';
import { EventCardComponent } from '../../../shared/events/event-card/event-card.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BookingService } from '../../../core/services/booking.service';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSortModule,
    RouterModule,
    EventCardComponent
  ],
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss']
})
export class EventListComponent implements OnInit {
  events: AppEvent[] = [];
  loading = true;
  displayedColumns: string[] = ['title', 'date', 'location', 'description'];

  constructor(private eventService: EventService,
    private router: Router,
    private snackBar: MatSnackBar,
    private bookingService: BookingService) { }

  ngOnInit(): void {
    this.getAllEvents()
  }

  getAllEvents() {
    this.eventService.getEvents().subscribe({
      next: (res) => {
        this.events = res.data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  goToDetails(id: string) {
    this.router.navigate(['/events', id]);
  }

  // onBookEvent(eventId: string) {

  //   this.bookingService.createBooking(eventId).subscribe({
  //     next: (createdEvent) => {
  //       this.loading = false;
  //       this.snackBar.open('Event booked successfully!', 'Close', { duration: 3000 });
  //     },
  //     error: (err) => {
  //       this.loading = false;
  //       console.error('Error booking event:', err);
  //       this.snackBar.open('Failed to book event. Please try again.', 'Close', { duration: 3000 });
  //     }
  //   });
  // }
}
