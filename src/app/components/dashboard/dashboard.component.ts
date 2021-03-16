import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  V1DatacentersService,
  V1TiersService,
  V1VmwareVirtualMachinesService,
  V1LoadBalancerVirtualServersService,
  UserDto,
} from 'api_client';
import { DashboardHelpText } from 'src/app/helptext/help-text-networking';
import { PieChartData } from 'src/app/common/d3-pie-chart/d3-pie-chart.component';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import SubscriptionUtil from '../../utils/SubscriptionUtil';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  public user: UserDto;
  public userRoles: string[];

  private currentUserSubscription: Subscription;

  constructor(
    private datacenterService: V1DatacentersService,
    private tierService: V1TiersService,
    private vmwareService: V1VmwareVirtualMachinesService,
    public helpText: DashboardHelpText,
    private loadBalancerService: V1LoadBalancerVirtualServersService,
    private auth: AuthService,
  ) {}

  datacenters: number;
  tiers: number;
  vmwareVirtualMachines: number;
  loadBalancerVirtualServers: number;

  status = [
    { name: 'User Interface', status: 'green' },
    { name: 'API', status: 'red' },
    { name: 'Infrastructure', status: 'green' },
  ];
  jobs: any;
  failedJobs = 0;
  successfulJobs = 0;
  pendingJobs = 0;
  cancelledJobs = 0;
  runningJobs = 0;
  pieChartData: Array<PieChartData>;

  dashboardPoller: any;

  ngOnInit() {
    this.pieChartData = [{ value: 1, color: '#f2f2f2' }];

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

  private loadDashboard(roles?: string[]): void {
    this.getDatacenters();
    this.getTiers();
    if (roles && roles.includes('admin')) {
      this.getVmwareVirtualMachines();
      this.getLoadBalancerVirtualServers();
    }
    if (roles && roles.includes('x86_admin')) {
      this.getVmwareVirtualMachines();
    }
    if (roles && roles.includes('loadbalancer_admin')) {
      this.getLoadBalancerVirtualServers();
    }
  }

  private getDatacenters(): void {
    this.datacenterService.v1DatacentersGet({ page: 1, perPage: 1 }).subscribe(data => {
      const paged: any = data;
      this.datacenters = paged.total;
      try {
        this.status[1].status = 'green';
      } catch {}
    });
  }

  private getTiers(): void {
    this.tierService.v1TiersGet({ page: 1, perPage: 1 }).subscribe(data => {
      const paged: any = data;
      this.tiers = paged.total;
    });
  }

  private getVmwareVirtualMachines(): void {
    this.vmwareService.v1VmwareVirtualMachinesGet({ page: 1, perPage: 1 }).subscribe(data => {
      const paged = data as any;
      this.vmwareVirtualMachines = paged.total;
    });
  }

  private getLoadBalancerVirtualServers(): void {
    this.loadBalancerService.v1LoadBalancerVirtualServersGet({ page: 1, perPage: 1 }).subscribe(data => {
      const paged = data as any;
      this.loadBalancerVirtualServers = paged.total;
    });
  }
}
