import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppEvent } from '../models/event.model';

@Injectable({ providedIn: 'root' })
export class EventService {

  private apiUrl = 'http://localhost:5001/api/v1/events';

  constructor(private http: HttpClient) {}

  getEvents(): Observable<{ success: boolean, count: number, data: AppEvent[] }> {
    return this.http.get<{ success: boolean, count: number, data: AppEvent[] }>(this.apiUrl);
  }

  getEventById(id: string): Observable<{ success: boolean, data: AppEvent }> {
    return this.http.get<{ success: boolean, data: AppEvent }>(`${this.apiUrl}/${id}`);
  }

  createEvent(eventData: FormData): Observable<{ success: boolean, data: AppEvent }> {
    return this.http.post<{ success: boolean, data: AppEvent }>(this.apiUrl, eventData);
  }

  updateEvent(id: string, eventData: Partial<AppEvent>): Observable<{ success: boolean, data: AppEvent }> {
    return this.http.put<{ success: boolean, data: AppEvent }>(`${this.apiUrl}/${id}`, eventData);
  }

  deleteEvent(id: string): Observable<{ success: boolean, data: {} }> {
    return this.http.delete<{ success: boolean, data: {} }>(`${this.apiUrl}/${id}`);
  }
}
