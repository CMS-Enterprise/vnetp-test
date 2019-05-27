import { Component, OnInit, OnDestroy } from '@angular/core';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/models/user';
import { MessageService } from 'src/app/services/message.service';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { AppMessage } from 'src/app/models/app-message';
import { AppMessageType } from 'src/app/models/app-message-type';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {

  messageServiceSubscription: Subscription;

  constructor(private automationApiService: AutomationApiService, private messageService: MessageService,
              private ngx: NgxSmartModalService , private auth: AuthService) {
    this.runningJobs = [];
    this.auth.currentUser.subscribe(u => this.currentUser = u);
  }

  loggedIn: boolean;
  runningJobs: any;
  currentUser: User;
  jobMessage: AppMessage;

  jobPoller = setInterval(() => this.getJobs() , 10000);

  getMessageServiceSubscription() {
    this.messageServiceSubscription = this.messageService.listen()
    .subscribe((m: AppMessage) => {
      this.messageHandler(m);
    });
  }

  private messageHandler(m: AppMessage) {
    switch (m.Type) {
      case AppMessageType.JobLaunchSuccess:
        if (this.runningJobs.count <= 0) {
          this.runningJobs = { count: 1 };
        } else {
          this.getJobs();
        }

        this.jobMessage = m;
        this.ngx.getModal('jobLaunchModal').open();
        break;
      case AppMessageType.JobLaunchFail:
        this.jobMessage = m;
        this.ngx.getModal('jobLaunchModal').open();
    }
  }

  getJobs() {
    if (!this.currentUser) { return; }

    this.automationApiService.getJobs('?order_by=-created&or__status=running&or__status=pending').subscribe(
      data => this.runningJobs = data
    );
  }

  logout() {
    this.ngx.close('logoutModal');
    this.auth.logout();
  }

  private unsubAll() {
    if (this.messageServiceSubscription) {
      this.messageServiceSubscription.unsubscribe();
    }
  }

  ngOnInit() {
    this.getJobs();
    this.getMessageServiceSubscription();
  }

  ngOnDestroy() {
    this.unsubAll();
  }
}
