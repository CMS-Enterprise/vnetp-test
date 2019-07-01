import { Component, OnInit } from '@angular/core';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { PieChartData } from '../d3-pie-chart/d3-pie-chart.component';
import { SubnetResponse } from 'src/app/models/d42/subnet';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  constructor(private automationApiService: AutomationApiService) {
    this.ips = { ips: [] };
    this.subnets = { subnets: [] };
    this.devices = { Devices: [] };
    this.jobs = { results: [] };
  }

  ips: any;
  subnets: any;
  devices: any;
  jobs: any;
  failedJobs = 0;
  successfulJobs = 0;
  status: any;
  pieChartData: Array<PieChartData>;

  dashboardPoller = setInterval(() => this.loadDashboard(), 1000 * 300);

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.getDevices();
    this.getNetworks();
    this.getIps();
    this.getStatus();
    this.getJobs();
  }

  getNetworks() {
    this.automationApiService
      .getSubnets()
      .subscribe(data => (this.subnets = data as SubnetResponse));
  }

  getIps() {
    this.automationApiService.getIps().subscribe(data => (this.ips = data));
  }

  getDevices() {
    this.automationApiService
      .getDevices()
      .subscribe(data => (this.devices = data));
  }

  getJobs() {
    const date = new Date().toISOString().slice(0, 10);

    // TODO: Refactor this to provide a more accurate count
    // by showing failed jobs in the last day based on local
    // timezone vs UTC.
    this.automationApiService
      .getJobs(
        `?created__gte=${date}T00:00&created__lte=${date}T23:59&page_size=50`
      )
      .subscribe(data => (this.jobs = data), error => {}, () => this.sortJobs());
  }

  sortJobs() {

    //TODO: Get cancelled and pending jobs.

    this.successfulJobs = this.jobs.results.filter(
      job => !job.failed && job.status === 'successful'
    ).length;
    this.failedJobs = this.jobs.results.filter(job => job.failed).length;

    this.pieChartData = new Array<PieChartData>();

    // Success
    if (this.successfulJobs) {
      this.pieChartData.push(
        { value: this.successfulJobs, color: '#4eb796' } 
      );
    }

    // Fail
    if (this.failedJobs) {
      this.pieChartData.push(
        { value: this.failedJobs, color: '#e84d4d' } 
      );
    }

    // Default
    if (!this.pieChartData.length) {
      this.pieChartData = [{ value: 1, color: '#f2f2f2' }];
    }
  }

  getStatus() {
    this.automationApiService.getSystemStatus().subscribe(data => {
      this.status = data;
    });
  }
}
