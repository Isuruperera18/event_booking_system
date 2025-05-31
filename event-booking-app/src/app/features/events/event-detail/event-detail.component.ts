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

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.eventService.getEventById(id).subscribe({
        next: (res) => {
          this.event = res.data; // ✅ Extract AppEvent from response
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
      return; // Safeguard if event is not loaded
    }

    const dialogRef = this.dialog.open(BookTicketDialogComponent, {
      width: '400px',
      data: { event: this.event }  // pass event as data
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(`User booked ${result} tickets.`);
        // Optional: Update available ticket count, show confirmation, etc.
      }
    });
  }
}
