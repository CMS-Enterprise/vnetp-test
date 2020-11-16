import { AuthService } from 'src/app/services/auth.service';
import { Component, OnInit } from '@angular/core';
import { User } from 'oidc-client';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tenant',
  templateUrl: './tenant.component.html',
})
export class TenantComponent implements OnInit {
  public user: User;
  private currentUserSubscription: Subscription;

  // This should be automated to pull tenants from ldap query
  public currentTenants = [
    { name: 'CDS', dbName: 'dcs_cds' },
    { name: 'Leidos', dbName: 'dcs_leidos' },
  ];

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.currentUserSubscription = this.authService.currentUser.subscribe(user => {
      this.user = user;
    });

    this.authService.completeAuthentication();
  }

  selectTenant(tenant: string) {
    this.router.navigate(['/dashboard'], {
      queryParams: { tenant: tenant },
      queryParamsHandling: 'merge',
    });
  }
}
