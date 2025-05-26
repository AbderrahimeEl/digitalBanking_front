import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, tap } from "rxjs";
import { environment } from "../../environments/environment";
import { AuthResponse, LoginRequest, RefreshTokenRequest, RegisterRequest, User } from "../model/auth.model";
import { Router } from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.backendHost + '/api/auth';
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;
  private readonly USER_STORAGE_KEY = 'currentUser';

  constructor(private http: HttpClient, private router: Router) {
    const storedUser = localStorage.getItem(this.USER_STORAGE_KEY);
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public get isLoggedIn(): boolean {
    return !!this.currentUserValue?.token;
  }

  public get isAdmin(): boolean {
    return this.currentUserValue?.role === 'ROLE_ADMIN';
  }

  public get isCustomer(): boolean {
    return this.currentUserValue?.role === 'ROLE_CUSTOMER';
  }

  public get token(): string | undefined {
    return this.currentUserValue?.token;
  }

  public login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/authenticate`, request)
      .pipe(
        tap(response => this.handleAuthResponse(response))
      );
  }

  public register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, request)
      .pipe(
        tap(response => this.handleAuthResponse(response))
      );
  }

  public refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.currentUserValue?.refreshToken;
    
    if (!refreshToken) {
      this.logout();
      throw new Error('No refresh token available');
    }
    
    const request: RefreshTokenRequest = { refreshToken };
    
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh-token`, request)
      .pipe(
        tap(response => this.handleAuthResponse(response))
      );
  }

  public logout(): void {
    localStorage.removeItem(this.USER_STORAGE_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  private handleAuthResponse(response: AuthResponse): void {
    if (response && response.token) {
      const user: User = {
        id: response.userId,
        username: '', // The API doesn't return username, so we leave it empty
        role: response.role,
        customerId: response.customerId,
        token: response.token,
        refreshToken: response.refreshToken
      };
      
      localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(user));
      this.currentUserSubject.next(user);
    }
  }
}
