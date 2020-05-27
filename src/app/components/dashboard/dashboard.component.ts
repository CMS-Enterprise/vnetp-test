import { Component, OnInit, AfterViewInit } from '@angular/core';
import { PieChartData } from '../d3-pie-chart/d3-pie-chart.component';
import { V1DatacentersService, V1TiersService, V1VmwareVirtualMachinesService, V1LoadBalancerVirtualServersService } from 'api_client';
import { DashboardHelpText } from 'src/app/helptext/help-text-networking';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements AfterViewInit {
  constructor(
    private datacenterService: V1DatacentersService,
    private tierService: V1TiersService,
    private vmwareService: V1VmwareVirtualMachinesService,
    public helpText: DashboardHelpText,
    private loadBalancerService: V1LoadBalancerVirtualServersService,
    private authService: AuthService,
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

  dashboardPoller = setInterval(() => this.loadDashboard(), 1000 * 300);

  ngAfterViewInit() {
    this.authService.completeAuthentication();
    this.pieChartData = [{ value: 1, color: '#f2f2f2' }];
    this.loadDashboard();
  }

  loadDashboard() {
    // this.getDatacenters();
    // this.getTiers();
    // this.getVmwareVirtualMachines();
    // this.getLoadBalancerVirtualServers();
  }

  getDatacenters() {
    this.datacenterService.v1DatacentersGet({ page: 1, perPage: 1 }).subscribe(data => {
      const paged = data as any;
      this.datacenters = paged.total;
      try {
        this.status[1].status = 'green';
      } catch {}
    });
  }

  getTiers() {
    this.tierService.v1TiersGet({ page: 1, perPage: 1 }).subscribe(data => {
      const paged = data as any;
      this.tiers = paged.total;
    });
  }

  getVmwareVirtualMachines() {
    this.vmwareService.v1VmwareVirtualMachinesGet({ page: 1, perPage: 1 }).subscribe(data => {
      const paged = data as any;
      this.vmwareVirtualMachines = paged.total;
    });
  }

  getLoadBalancerVirtualServers() {
    this.loadBalancerService.v1LoadBalancerVirtualServersGet({ page: 1, perPage: 1 }).subscribe(data => {
      const paged = data as any;
      this.loadBalancerVirtualServers = paged.total;
    });
  }

  getJobs() {
    const date = new Date().toISOString().slice(0, 10);

    // TODO: Refactor this to provide a more accurate count
    // by showing failed jobs in the last day based on local
    // timezone vs UTC.
    // this.automationApiService
    //   .getJobs(
    //     `?created__gte=${date}T00:00&created__lte=${date}T23:59&page_size=50`,
    //   )
    //   .subscribe(
    //     data => (this.jobs = data),
    //     error => {},
    //     () => this.sortJobs(),
    //   );
  }

  // sortJobs() {
  //   const nonFailedJobs = this.jobs.results.filter(job => !job.failed);
  //   this.failedJobs = this.jobs.results.filter(job => job.failed && job.status !== 'canceled').length;
  //   this.cancelledJobs = this.jobs.results.filter(job => job.failed && job.status === 'canceled').length;

  //   this.successfulJobs = nonFailedJobs.filter(job => job.status === 'successful').length;
  //   this.runningJobs = nonFailedJobs.filter(job => job.status === 'running').length;
  //   this.pendingJobs = nonFailedJobs.filter(job => job.status === 'pending').length;

  //   this.pieChartData = new Array<PieChartData>();

  //   // Successful
  //   if (this.successfulJobs) {
  //     this.pieChartData.push({ value: this.successfulJobs, color: '#4eb796' });
  //   }

  //   // Running
  //   if (this.runningJobs) {
  //     this.pieChartData.push({ value: this.runningJobs, color: '#ffdf5a' });
  //   }

  //   // Failed
  //   if (this.failedJobs) {
  //     this.pieChartData.push({ value: this.failedJobs, color: '#e84d4d' });
  //   }

  //   // Pending
  //   if (this.pendingJobs) {
  //     this.pieChartData.push({ value: this.pendingJobs, color: '#5ac4f9' });
  //   }

  //   // Cancelled Jobs
  //   if (this.cancelledJobs) {
  //     this.pieChartData.push({ value: this.cancelledJobs, color: '#c2c2c6' });
  //   }

  //   // Default
  //   if (!this.pieChartData.length) {
  //     this.pieChartData = [{ value: 1, color: '#f2f2f2' }];
  //   }
  // }
}
