import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
  globalMessageTotal: number;
  selectedTenant: string;

  availableTenants;
  dashboardPoller;

  public status = [
    { name: 'User Interface', status: 'green' },
    { name: 'API', status: 'red' },
    { name: 'Infrastructure', status: 'green' },
  ];

  constructor(private router: Router, private auth: AuthService, private globalMessagesService: V3GlobalMessagesService) {}
  ngOnInit(): void {
    if (this.auth.currentUser) {
      this.currentUserSubscription = this.auth.currentUser.subscribe(user => {
        this.user = user;
        this.userRoles = this.user.dcsPermissions.map(p => p.roles).flat();
        this.loadDashboard();
        this.auth.getTenants(this.user.token).subscribe(data => {
          this.availableTenants = data;
        });
        this.dashboardPoller = setInterval(() => this.loadDashboard(), 1000 * 300);
      });
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.dashboardPoller);
    SubscriptionUtil.unsubscribe([this.currentUserSubscription]);
  }

  public loadDashboard(): void {
    this.getGlobalMessages();
  }

  public getGlobalMessages(): void {
    this.globalMessagesService.getManyMessage({ page: 1, perPage: 10000 }).subscribe(data => {
      this.globalMessageTotal = data.total;
      this.status[1].status = 'green';
    });
  }

  public setTenant(tenant): void {
    const { tenantQueryParameter } = tenant;
    this.selectedTenant = this.auth.currentTenantValue;
    this.auth.currentTenantValue = tenantQueryParameter;
    localStorage.setItem('tenantQueryParam', JSON.stringify(tenantQueryParameter));
    this.router.navigate(['adminportal/dashboard'], { queryParams: { tenant: tenantQueryParameter } });
    setTimeout(location.reload.bind(window.location), 250);
  }
}
