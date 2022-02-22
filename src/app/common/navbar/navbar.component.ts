import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { UserDto } from '../../../../client';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  public user: UserDto;
  public userRoles: string[];
  public tenant: string;
  private currentUserSubscription: Subscription;
  private currentTenantSubscription: Subscription;

  constructor(private ngx: NgxSmartModalService, private auth: AuthService) {}

  public openLogoutModal(): void {
    this.ngx.getModal('logoutModal').open();
  }

  public logout(): void {
    this.ngx.close('logoutModal');
    this.auth.logout();
  }

  ngOnInit(): void {
    this.currentTenantSubscription = this.auth.currentTenant.subscribe(tenant => {
      this.tenant = tenant;
    });

    const tenantQueryParam = JSON.parse(localStorage.getItem('tenantQueryParam'));
    this.tenant = tenantQueryParam;

    this.currentUserSubscription = this.auth.currentUser.subscribe(user => {
      this.user = user;
      if (user) {
        this.userRoles = this.user.dcsPermissions.find(d => d.tenant === this.tenant || d.tenant === '*').roles;

        // this is a slight trick for the user, if they are a RO user regardless of prefix (network, x86, etc...)
        // show them all dropdown options, they will get denied at the component level
        // this allows for more flexibility of the word "admin" in the HTML with no risk
        if (this.userRoles && this.userRoles.includes('ro')) {
          this.userRoles = ['admin'];
        }
      }
    });
  }

  ngOnDestroy(): void {
    SubscriptionUtil.unsubscribe([this.currentUserSubscription, this.currentTenantSubscription]);
  }
}
