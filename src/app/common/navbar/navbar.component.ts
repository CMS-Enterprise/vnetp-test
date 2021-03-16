import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { UserDto } from '../../../../api_client/model/models';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  public user: UserDto;
  public userRoles: string[];
  public role: string;
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
    this.currentUserSubscription = this.auth.currentUser.subscribe(user => {
      this.user = user;
      if (user) {
        this.userRoles = this.user.dcsPermissions.map(p => p.roles).flat();
        this.role = this.userRoles[0];
        if (this.role.includes('ro')) {
          this.role = 'admin';
        }
      }
    });
    this.currentTenantSubscription = this.auth.currentTenant.subscribe(tenant => {
      this.tenant = tenant;
    });
  }

  ngOnDestroy(): void {
    SubscriptionUtil.unsubscribe([this.currentUserSubscription, this.currentTenantSubscription]);
  }
}
