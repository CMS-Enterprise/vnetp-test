import { Component, OnInit } from '@angular/core';
import { UserDto, V3GlobalMessagesService } from 'client';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

@Component({
  selector: 'app-admin-portal-dashboard',
  templateUrl: './admin-portal-dashboard.component.html',
  styleUrls: ['./admin-portal-dashboard.component.scss'],
})
export class AdminPortalDashboardComponent implements OnInit {
  private currentUserSubscription: Subscription;
  public user: UserDto;
  public userRoles: string[];
  globalMessages;

  dashboardPoller;

  public status = [
    { name: 'User Interface', status: 'green' },
    { name: 'API', status: 'red' },
    { name: 'Infrastructure', status: 'green' },
  ];

  constructor(private auth: AuthService, private globalMessagesService: V3GlobalMessagesService) {}
  ngOnInit() {
    if (this.auth.currentUser) {
      this.currentUserSubscription = this.auth.currentUser.subscribe(user => {
        this.user = user;
        this.userRoles = this.user.dcsPermissions.map(p => p.roles).flat();
      });
      this.loadDashboard();
      this.dashboardPoller = setInterval(() => this.loadDashboard(), 1000 * 300);
      console.log('this.dashboardPoller', this.dashboardPoller);
    }
  }

  ngOnDestroy() {
    clearInterval(this.dashboardPoller);
    SubscriptionUtil.unsubscribe([this.currentUserSubscription]);
  }

  public loadDashboard(): void {
    this.getGlobalMessages();
  }

  public getGlobalMessages() {
    this.globalMessagesService.getMessagesMessage({ page: 1, perPage: 10000 }).subscribe(data => {
      this.globalMessages = data.total;
      this.status[1].status = 'green';
    });
  }
}
