import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EventService } from '../../../core/services/event.service';  // adjust path if needed
import { AppEvent } from '../../../core/models/event.model';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatSelectModule,
    MatCheckboxModule 
  ],
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.scss']
})
export class EventFormComponent implements OnInit {
  eventForm!: FormGroup;
  loading = false;
    imageFile: File | null = null;
  imagePreview: string | null = null;
  categories: string[] = ['Conference', 'Workshop', 'Meetup', 'Webinar', 'Concert', 'Party', 'Other'];

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      date: [null, Validators.required],
      time: ['', Validators.required],
      location: ['', Validators.required],
      imageURL: [''],
      capacity: [null],
      price: [0],
      category: ['Other'],
      isVirtual: [false],
      virtualLink: [''],
      status: ['Scheduled']
    });

    // Optional: Reset virtualLink when isVirtual is false
    this.eventForm.get('isVirtual')?.valueChanges.subscribe(isVirtual => {
      if (!isVirtual) {
        this.eventForm.get('virtualLink')?.reset();
      }
    });
  }

  onSubmit(): void {
    if (this.eventForm.invalid) {
      return;
    }

    this.loading = true;
    const formValue = this.eventForm.value;

    // Prepare the AppEvent object
    // const newEvent: AppEvent = {
    //   title: formValue.title,
    //   description: formValue.description,
    //   date: formValue.date.toISOString(), // convert Date to ISO string
    //   time: formValue.time,
    //   location: formValue.location,
    // };

    console.log(this.eventForm.value);

    this.eventService.createEvent(this.eventForm.value).subscribe({
      next: (createdEvent) => {
        this.loading = false;
        this.snackBar.open('Event created successfully!', 'Close', { duration: 3000 });
        this.eventForm.reset();
      },
      error: (err) => {
        this.loading = false;
        console.error('Error creating event:', err);
        this.snackBar.open('Failed to create event. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }
}
