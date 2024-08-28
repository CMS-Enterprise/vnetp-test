import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserDto } from 'client/model/userDto';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs/internal/Subscription';
import { AuthService } from 'src/app/services/auth.service';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

@Component({
  selector: 'app-admin-portal-navbar',
  templateUrl: './admin-portal-navbar.component.html',
  styleUrls: ['./admin-portal-navbar.component.scss'],
})
export class AdminPortalNavbarComponent implements OnInit, OnDestroy {
  public user: UserDto;
  public userRoles: string[];
  public tenant: string;
  public tenantAccountNumber: string;
  private currentUserSubscription: Subscription;
  private currentTenantSubscription: Subscription;

  constructor(private ngx: NgxSmartModalService, private auth: AuthService) {}

  ngOnInit(): void {
    this.currentTenantSubscription = this.auth.currentTenant.subscribe(tenant => {
      this.tenant = tenant;
      this.currentUserSubscription = this.auth.currentUser.subscribe(user => {
        this.user = user;
        if (this.user && this.tenant) {
          this.userRoles = this.user.dcsPermissions.find(d => d.tenant === this.tenant || d.tenant === '*').roles;
        }
      });
    });
  }

  public openLogoutModal(): void {
    this.ngx.getModal('logoutModal').open();
  }

  public logout(): void {
    this.ngx.close('logoutModal');
    this.auth.logout();
  }

  ngOnDestroy(): void {
    SubscriptionUtil.unsubscribe([this.currentUserSubscription, this.currentTenantSubscription]);
  }
}
