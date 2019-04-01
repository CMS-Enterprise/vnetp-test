import { Component, OnInit } from '@angular/core';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/models/user';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  constructor(private automationApiService: AutomationApiService,private toastr: ToastrService, private auth: AuthService) {
    this.runningJobs = [];
    this.auth.currentUser.subscribe(u => this.currentUser = u);
  }

  loggedIn: boolean;
  runningJobs: any;
  currentUser: User;

  jobPoller = setInterval(() => this.getRunningJobs() , 10000);

  getRunningJobs() {

    if (!this.currentUser) { return; }

    this.automationApiService.getJobs('?order_by=-created&status=running').subscribe(
      data => this.runningJobs = data,
      error => console.error(error)
    );
  }

  logout() {
    this.auth.logout();
  }

  ngOnInit() {
    this.getRunningJobs();
  }

}
