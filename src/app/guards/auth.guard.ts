import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private authenticationService: AuthService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const currentUser = this.authenticationService.currentUserValue;
    if (currentUser) {
      // logged in so return true
      return true;
    }

    // not logged in so redirect to login page with the return url

    // if dashboard is in the returnURL, clear the returnURL to make for a clean login URL
    if (state.url.includes('dashboard')) {
      this.router.navigateByUrl('/login');
    } else {
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    }
    return false;
  }
}
