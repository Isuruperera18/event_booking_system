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
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class EventCardComponent implements OnInit, OnChanges {
  @Input() event!: AppEvent;
  @Output() book = new EventEmitter<void>();
  @Output() cardClick = new EventEmitter<void>();

  safeImageURL!: SafeUrl;
  currentUserId = '';

  constructor(private sanitizer: DomSanitizer,
    private dialog: MatDialog,
    private tokenStorageService: TokenStorageService
  ) { }

ngOnChanges(changes: SimpleChanges): void {
  this.currentUserId = this.tokenStorageService.getUser()?._id || '';
  console.log('CurrentUserId:', this.currentUserId);

  if (changes['event'] && this.event?.imageURL) {
    this.safeImageURL = this.sanitizer.bypassSecurityTrustUrl(this.event.imageURL);
  } else {
    this.safeImageURL = this.sanitizer.bypassSecurityTrustUrl('assets/default.jpg');
  }
}
ngOnInit(): void {
  this.currentUserId = this.tokenStorageService.getUser()?._id || '';
}


  onBook() {
    this.book.emit();
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
        // Optional: Update available ticket count, show confirmation, etc.
        this.cardClick.emit();
      }
    });
  }

  // In your component.ts
isUserAttending(event: AppEvent): boolean {
  if (!event.attendees) return false;
  return event.attendees.includes(this.currentUserId);
}


  cancelBooking(event: AppEvent) {

  }
}
