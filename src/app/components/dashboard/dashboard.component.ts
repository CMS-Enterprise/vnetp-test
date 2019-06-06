import { Component, OnInit } from '@angular/core';
import { AutomationApiService } from 'src/app/services/automation-api.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
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

  dashboardPoller = setInterval(() => this.loadDashboard(), 1000 * 300);

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.getDevices();
    this.getNetworks();
    this.getIps();
    this.getJobs();
  }

  getNetworks() {
    this.automationApiService
      .getSubnets()
      .subscribe(data => (this.subnets = data));
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
      .getJobs(`?created__gte=${date}T00:00&created__lte=${date}T23:59&page_size=50`)
      .subscribe(
        data => (this.jobs = data),
        error => {},
        () => this.sortJobs()
      );
  }

  sortJobs() {
    this.successfulJobs = this.jobs.results.filter(
      job => !job.failed && job.status === 'successful'
    ).length;
    this.failedJobs = this.jobs.results.filter(job => job.failed).length;
  }
}
