import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AdminAuthGuard {
  constructor(private router: Router, private authenticationService: AuthService) {}

  canActivate() {
    const currentUser = this.authenticationService.currentUserValue;

    if (currentUser) {
      // logged in so return true
      return true;
    }
    this.router.navigateByUrl('/login');
    return false;
  }
}
