import { Component, OnInit } from '@angular/core';
import { V1JobsService } from 'api_client';

@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.component.html',
})
export class JobsComponent implements OnInit {
  jobs: any;
  currentJobsPage = 1;
  perPage = 10;

  constructor(private jobsService: V1JobsService) {}

  jobPoller = setInterval(() => this.getJobs(), 10000);

  ngOnInit() {
    this.getJobs();
  }

  getJobs() {
    this.jobsService.v1JobsGet({ perPage: 100, sort: 'createdAt,DESC' }).subscribe(data => {
      this.jobs = data;
    });
  }
}
