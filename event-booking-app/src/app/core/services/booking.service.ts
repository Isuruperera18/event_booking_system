import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Booking } from '../models/booking.model';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private apiUrl = 'http://localhost:5001/api/v1/bookings'; // adjust if different

  constructor(private http: HttpClient) {}

  // Create a booking
  createBooking(eventId: string): Observable<{ success: boolean; data: Booking }> {
    return this.http.post<{ success: boolean; data: Booking }>(`${this.apiUrl}`, { eventId });
  }

  // Get current user's bookings
  getMyBookings(): Observable<{ success: boolean; data: Booking[] }> {
    return this.http.get<{ success: boolean; data: Booking[] }>(`${this.apiUrl}/my`);
  }

  // Get all bookings (admin only)
  getAllBookings(): Observable<{ success: boolean; data: Booking[] }> {
    return this.http.get<{ success: boolean; data: Booking[] }>(`${this.apiUrl}`);
  }

  // Get single booking by ID
  getBooking(id: string): Observable<{ success: boolean; data: Booking }> {
    return this.http.get<{ success: boolean; data: Booking }>(`${this.apiUrl}/${id}`);
  }

  // Cancel booking by ID
  cancelBooking(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }
}
