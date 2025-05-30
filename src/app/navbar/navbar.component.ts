import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isLoggedIn = false;
  isAdmin = false;
  isCustomer = false;
  currentUserName = '';
  customerId?: number;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Subscribe to the current user observable to update navigation
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.isAdmin = user?.role === 'ROLE_ADMIN';
      this.isCustomer = user?.role === 'ROLE_CUSTOMER';
      this.currentUserName = user?.username || '';
      this.customerId = user?.customerId;
    });
  }
  
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

}
