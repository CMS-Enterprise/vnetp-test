import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  UserDto,
  V2AppCentricTenantsService,
  V2AppCentricVrfsService,
  V2AppCentricBridgeDomainsService,
  V2AppCentricContractsService,
} from 'client';
import { Subscription } from 'rxjs';
import { AppcentricDashboardHelpText, DashboardHelpText } from 'src/app/helptext/help-text-networking';
import { AuthService } from 'src/app/services/auth.service';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

@Component({
  selector: 'app-appcentric-dashboard',
  templateUrl: './appcentric-dashboard.component.html',
  styleUrls: ['./appcentric-dashboard.component.scss'],
})
export class AppcentricDashboardComponent implements OnInit, OnDestroy {
  public user: UserDto;
  public userRoles: string[];

  private currentUserSubscription: Subscription;

  constructor(
    private auth: AuthService,
    private tenantsService: V2AppCentricTenantsService,
    private vrfsService: V2AppCentricVrfsService,
    private bridgeDomainsService: V2AppCentricBridgeDomainsService,
    private contractsService: V2AppCentricContractsService,
    public helpText: AppcentricDashboardHelpText,
  ) {}

  public tenants: number;
  public vrfs: number;
  public bridgeDomains: number;
  public contracts: number;

  public status = [
    { name: 'User Interface', status: 'green' },
    { name: 'API', status: 'green' },
    { name: 'Infrastructure', status: 'green' },
  ];

  dashboardPoller: any;

  ngOnInit() {
    if (this.auth.currentUser) {
      this.currentUserSubscription = this.auth.currentUser.subscribe(user => {
        this.user = user;
        this.userRoles = this.user.dcsPermissions.map(p => p.roles).flat();
      });
    }
    this.loadDashboard(this.userRoles);
    this.dashboardPoller = setInterval(() => this.loadDashboard(this.userRoles), 1000 * 300);
  }

  ngOnDestroy() {
    clearInterval(this.dashboardPoller);
    SubscriptionUtil.unsubscribe([this.currentUserSubscription]);
  }

  // only fetch the dashboard entities that the user has the correct permissions to view
  private loadDashboard(roles?: string[]): void {
    this.getTenantCount();
    this.getVrfCount();
    this.getBridgeDomainCount();
    this.getContractCount();
  }

  private getTenantCount(): void {
    this.tenantsService
      .findAllTenant({
        page: 1,
        perPage: 1,
      })
      .subscribe(data => {
        this.tenants = data.total;
      });
  }

  private getVrfCount(): void {
    this.vrfsService.findAllVrf({ page: 1, perPage: 1 }).subscribe(data => {
      this.vrfs = data.total;
    });
  }

  private getBridgeDomainCount(): void {
    this.bridgeDomainsService.findAllBridgeDomain({ page: 1, perPage: 1 }).subscribe(data => {
      this.bridgeDomains = data.total;
    });
  }

  private getContractCount(): void {
    this.contractsService.findAllContract({ page: 1, perPage: 1 }).subscribe(data => {
      this.contracts = data.total;
    });
  }
}
