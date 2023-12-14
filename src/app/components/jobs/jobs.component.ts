import { Component, OnInit, OnDestroy } from '@angular/core';
import { V1JobsService } from 'client';

@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.component.html',
})
export class JobsComponent implements OnInit, OnDestroy {
  jobs: any;
  currentJobsPage = 1;
  perPage = 10;

  private jobPoller: any;

  constructor(private jobsService: V1JobsService) {}

  ngOnInit() {
    this.getJobs();
    this.jobPoller = setInterval(() => this.getJobs(), 10000);
  }

  ngOnDestroy(): void {
    clearInterval(this.jobPoller);
  }

  getJobs() {
    this.jobsService.getManyJob({ perPage: 100, page: 1, sort: ['createdAt,DESC'] }).subscribe(response => {
      this.jobs = response.data;
    });
  }
}
