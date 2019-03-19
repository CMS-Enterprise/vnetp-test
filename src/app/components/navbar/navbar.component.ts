import { Component, OnInit } from '@angular/core';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { AuthServiceService } from 'src/app/services/auth-service.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  constructor(private automationApiService: AutomationApiService, private auth: AuthServiceService) {}

  runningJobs: any;

  jobPoller = setInterval(() => this.getRunningJobs() , 5000);

  getRunningJobs() {
    this.automationApiService.getJobs('?order_by=-created&status=running').subscribe(
      data => this.runningJobs = data,
      error => console.error(error)
    );
  }

  ngOnInit() {
    this.getRunningJobs();
  }

}
