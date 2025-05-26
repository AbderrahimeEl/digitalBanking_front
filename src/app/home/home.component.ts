import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  isLoggedIn = false;
  isAdmin = false;
  isCustomer = false;
  username = '';
  customerId?: number;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.isAdmin = user?.role === 'ROLE_ADMIN';
      this.isCustomer = user?.role === 'ROLE_CUSTOMER';
      this.username = user?.username || '';
      this.customerId = user?.customerId;

      // If not logged in, redirect to login
      if (!this.isLoggedIn) {
        this.router.navigate(['/login']);
      }
    });
  }
}
