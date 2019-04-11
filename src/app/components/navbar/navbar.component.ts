import { Component, OnInit } from '@angular/core';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/models/user';
import { ToastrService } from 'ngx-toastr';
import { MessageService } from 'src/app/services/message.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  constructor(private automationApiService: AutomationApiService, private messageService: MessageService,
              private toastr: ToastrService, private auth: AuthService) {
    this.runningJobs = [];
    this.auth.currentUser.subscribe(u => this.currentUser = u);

    this.messageService.listen().subscribe((m: any) => {
      if (m === 'Job Launched') {
        // Set running job count to 1 to immediately display running job
        // if no jobs are currently running.
        if (this.runningJobs.count <= 0) {
          this.runningJobs = { count: 1};

          setTimeout(() => {
            this.getRunningJobs();
          }, 2500);
        }
      }
    });
  }

  loggedIn: boolean;
  runningJobs: any;
  currentUser: User;

  jobPoller = setInterval(() => this.getRunningJobs() , 10000);

  getRunningJobs() {

    if (!this.currentUser) { return; }

    this.automationApiService.getJobs('?order_by=-created&or__status=running&or__status=pending').subscribe(
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
