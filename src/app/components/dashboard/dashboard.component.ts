import { Component, OnInit, OnDestroy } from '@angular/core';
import { V1DatacentersService, V1TiersService, V1VmwareVirtualMachinesService, V1LoadBalancerVirtualServersService } from 'api_client';
import { DashboardHelpText } from 'src/app/helptext/help-text-networking';
import { PieChartData } from 'src/app/common/d3-pie-chart/d3-pie-chart.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  constructor(
    private datacenterService: V1DatacentersService,
    private tierService: V1TiersService,
    private vmwareService: V1VmwareVirtualMachinesService,
    public helpText: DashboardHelpText,
    private loadBalancerService: V1LoadBalancerVirtualServersService,
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
    this.loadDashboard();
    this.dashboardPoller = setInterval(() => this.loadDashboard(), 1000 * 300);
  }

  ngOnDestroy() {
    clearInterval(this.dashboardPoller);
  }

  private loadDashboard(): void {
    this.getDatacenters();
    this.getTiers();
    this.getVmwareVirtualMachines();
    this.getLoadBalancerVirtualServers();
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
