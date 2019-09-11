import { Component, OnInit } from '@angular/core';
import { AutomationApiService } from 'src/app/services/automation-api.service';

@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.component.html'
})
export class JobsComponent implements OnInit {
  jobs: any;

  constructor(private automationApiService: AutomationApiService) {
    this.jobs = [];
  }

  jobPoller = setInterval(() => this.getJobs() , 10000);

  ngOnInit() {
    this.getJobs();
  }

  getJobs() {
    this.automationApiService.getJobs('?order_by=-created&page_size=50').subscribe(
      data => this.jobs = data,
      error => console.error(error)
    );
  }
}
