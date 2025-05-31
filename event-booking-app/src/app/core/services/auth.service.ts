


// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, map } from 'rxjs';
import { User } from '../models/user.model';
import { AuthResponse } from '../models/auth-response.model';
import { TokenStorageService } from './token-storage.service';
import { Router } from '@angular/router';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
   private apiUrl = 'http://localhost:5001/api/v1/auth';
  private currentUserSubject!: BehaviorSubject<User | null>;
  public currentUser$!: Observable<User | null>;

  private loggedIn!: BehaviorSubject<boolean>;
  public isLoggedIn$!: Observable<boolean>;

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService,
    private router: Router
  ) {
    this.currentUserSubject = new BehaviorSubject<User | null>(this.tokenStorage.getUser());
    this.currentUser$ = this.currentUserSubject.asObservable();

    this.loggedIn = new BehaviorSubject<boolean>(this.tokenStorage.getToken() !== null);
    this.isLoggedIn$ = this.loggedIn.asObservable();
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.tokenStorage.getToken();
  }

  getUserRole(): string | null {
    const user = this.currentUserValue;
    return user ? user.role : null;
  }

  login(credentials: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials, httpOptions).pipe(
      tap(response => {
        if (response.success && response.token && response.user) {
          this.tokenStorage.saveToken(response.token);
          this.tokenStorage.saveUser(response.user);
          this.currentUserSubject.next(response.user);
          this.loggedIn.next(true);
        }
      })
    );
  }

  register(userData: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData, httpOptions).pipe(
      tap(response => {
        if (response.success && response.token && response.user) {
          this.tokenStorage.saveToken(response.token);
          this.tokenStorage.saveUser(response.user);
          this.currentUserSubject.next(response.user);
          this.loggedIn.next(true);
        }
      })
    );
  }

  logout(): void {
    this.tokenStorage.signOut();
    this.currentUserSubject.next(null);
    this.loggedIn.next(false);
    this.router.navigate(['/auth/login']);
  }

  getMe(): Observable<User> {
    return this.http.get<{ success: boolean; data: User }>(`${this.apiUrl}/me`).pipe(
      map(response => {
        if (response.success && response.data) {
          this.tokenStorage.saveUser(response.data);
          this.currentUserSubject.next(response.data);
          return response.data;
        }
        throw new Error('Failed to fetch user data');
      })
    );
  }
}
