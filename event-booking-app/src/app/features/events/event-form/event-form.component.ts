import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EventService } from '../../../core/services/event.service';  // adjust path if needed
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
import { HttpErrorResponse } from '@angular/common/http';
import { MatTimepickerModule } from '@angular/material/timepicker';

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
    MatCheckboxModule,
    MatTimepickerModule
  ],
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.scss']
})
export class EventFormComponent implements OnInit {
  eventForm!: FormGroup;
  loading = false;
  imageFile: File | null = null;
  categories: string[] = ['Conference', 'Workshop', 'Meetup', 'Webinar', 'Concert', 'Party', 'Other'];

  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;

  uploadResponse: any = null;
  errorMessage: string | null = null;
  isLoading: boolean = false;
  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      date: [null, Validators.required],
      time: [null, Validators.required],
      location: ['', Validators.required],
      capacity: [null],
      price: [0],
      category: ['Other'],
      isVirtual: [false],
      virtualLink: [''],
      status: ['Scheduled'],
      imageFile: [null]
    });

    // Optional: Reset virtualLink when isVirtual is false
    this.eventForm.get('isVirtual')?.valueChanges.subscribe(isVirtual => {
      if (!isVirtual) {
        this.eventForm.get('virtualLink')?.reset();
      }
    });
  }

  onFileSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;

    if (fileList && fileList.length > 0) {
      this.selectedFile = fileList[0];
      this.eventForm.patchValue({ imageFile: this.selectedFile }); // For form validation state
      this.eventForm.get('imageFile')?.updateValueAndValidity(); // Trigger validation update

      // Image Preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(this.selectedFile);
      this.errorMessage = null; // Clear previous error
    } else {
      this.selectedFile = null;
      this.imagePreview = null;
      this.eventForm.patchValue({ imageFile: null });
    }
  }

  onSubmit(): void {
    if (this.eventForm.invalid || !this.selectedFile) {
      this.errorMessage = 'Please fill all required fields.';
      console.error('Form is invalid or no file selected.');

      Object.values(this.eventForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }

    this.isLoading = true;
    this.uploadResponse = null;
    this.errorMessage = null;

    const eventDateTime = this.combineDateAndTime();

    const formData = new FormData();

    formData.append('imageFile', this.selectedFile, this.selectedFile.name);
    formData.append('title', this.eventForm.get('title')?.value);
    formData.append('description', this.eventForm.get('description')?.value);
    formData.append('date', eventDateTime!);
    formData.append('time', this.eventForm.get('time')?.value);
    formData.append('location', this.eventForm.get('location')?.value);
    formData.append('capacity', this.eventForm.get('capacity')?.value);
    formData.append('price', this.eventForm.get('price')?.value);
    formData.append('isVirtual', this.eventForm.get('isVirtual')?.value);
    formData.append('virtualLink', this.eventForm.get('virtualLink')?.value);
    formData.append('status', this.eventForm.get('status')?.value);

    this.eventService.createEvent(formData)
      .subscribe({
        next: (response) => {
          this.uploadResponse = response;

          this.eventForm.reset();
          this.selectedFile = null;
          this.imagePreview = null;
          this.isLoading = false;
          this.snackBar.open('Event created successfully!', 'Close', { duration: 3000 });
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = error.error?.message || error.message || 'An unknown error occurred.';
          if (error.status === 0) {
            this.errorMessage = 'Could not connect to the server. Is it running?';
          }
          this.isLoading = false;
        }
      });
  }

  combineDateAndTime() {
    const date: Date = this.eventForm.get('date')?.value;
    const time = this.eventForm.get('time')?.value;

    if (!date || !time) return null;

    const [hours, minutes] = time.split(':').map(Number);

    const combined = new Date(date);
    combined.setHours(hours);
    combined.setMinutes(minutes);
    combined.setSeconds(0);
    combined.setMilliseconds(0);

    return combined.toISOString();
  }

}
