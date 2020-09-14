import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { User } from 'oidc-client';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  public user: User;

  private currentUserSubscription: Subscription;

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
    });
  }

  ngOnDestroy(): void {
    SubscriptionUtil.unsubscribe([this.currentUserSubscription]);
  }
}
