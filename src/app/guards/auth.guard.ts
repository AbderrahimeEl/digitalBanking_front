import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const user = this.authService.currentUserValue;
    
    if (user) {
      // Check if route has required roles
      if (route.data['roles'] && route.data['roles'].length) {
        // User must have at least one of the required roles
        if (!route.data['roles'].includes(user.role)) {
          this.router.navigate(['/unauthorized']);
          return false;
        }
      }
      
      return true;
    }

    // Not logged in - redirect to login page
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}
