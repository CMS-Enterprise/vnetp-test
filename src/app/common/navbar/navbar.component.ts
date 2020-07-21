import { Component, OnInit, OnDestroy } from '@angular/core';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/models/user/user';
import { MessageService } from 'src/app/services/message.service';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { AppMessage } from 'src/app/models/app-message';
import { AppMessageType } from 'src/app/models/app-message-type';
import { HelpersService } from 'src/app/services/helpers.service';
import { Job } from 'src/app/models/other/job';
import SubscriptionUtil from 'src/app/utils/subscription.util';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  public currentUser: User;
  public jobMessage: AppMessage;
  public modalJob: Job;

  private currentUserSubscription: Subscription;

  constructor(private ngx: NgxSmartModalService, private auth: AuthService) {}

  public openLogoutModal(): void {
    this.ngx.getModal('logoutModal').open();
  }

  public logout(): void {
    this.ngx.close('logoutModal');
    this.auth.logout();
  }

  ngOnInit() {
    this.currentUserSubscription = this.auth.currentUser.subscribe(u => (this.currentUser = u));
  }

  ngOnDestroy() {
    SubscriptionUtil.unsubscribe([this.currentUserSubscription, this.currentUserSubscription]);
  }
}
