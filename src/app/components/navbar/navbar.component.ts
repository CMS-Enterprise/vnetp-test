import { Component, OnInit, OnDestroy } from '@angular/core';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/models/user/user';
import { MessageService } from 'src/app/services/message.service';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { AppMessage } from 'src/app/models/app-message';
import { AppMessageType } from 'src/app/models/app-message-type';
import { HelpersService } from 'src/app/services/helpers.service';
import { Job } from 'src/app/models/other/job';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  messageServiceSubscription: Subscription;
  currentUserSubscription: Subscription;

  constructor(
    private automationApiService: AutomationApiService,
    private messageService: MessageService,
    private ngx: NgxSmartModalService,
    private auth: AuthService,
    private hs: HelpersService,
  ) {
    this.activeJobs = [];
  }

  loggedIn: boolean;
  activeJobs: Array<Job>;
  currentUser: User;
  jobMessage: AppMessage;

  modalJob: Job;

  getMessageServiceSubscription() {
    this.messageServiceSubscription = this.messageService.listen().subscribe((m: AppMessage) => {
      this.messageHandler(m);
    });
  }

  private messageHandler(m: AppMessage) {
    switch (m.Type) {
      case AppMessageType.JobLaunchSuccess:
        this.getJobs();

        this.jobMessage = m;
        this.modalJob = this.hs.deepCopy(m.Object) as Job;
        this.ngx.getModal('jobLaunchModal').open();
        break;
      case AppMessageType.JobLaunchFail:
        this.jobMessage = m;
        this.ngx.getModal('jobLaunchModal').open();
    }
  }

  getJobs() {
    if (!this.currentUser) {
      return;
    }

    this.automationApiService.getJobs('?order_by=-created&or__status=running&or__status=pending').subscribe(data => {
      const result = data as any;
      this.activeJobs = result.results as Array<Job>;
      this.updateModalJob();
    });
  }

  openLogoutModal() {
    this.ngx.getModal('logoutModal').open();
  }

  updateModalJob() {
    if (this.modalJob && this.modalJob.status !== 'failed' && this.modalJob.status !== 'successful') {
      // Try to update the modal job from the activeJobs array.
      const updatedJob = this.activeJobs.find(j => j.id === this.modalJob.id);

      if (updatedJob) {
        this.modalJob = this.hs.deepCopy(updatedJob);
      } else {
        // If the job isn't in active jobs, it has either succeeded or failed.
        // Get its status directly.
        this.automationApiService.getJob(this.modalJob.id).subscribe(data => {
          this.modalJob = data as Job;
        });
      }
    }
  }

  closeJobModal() {
    this.ngx.getModal('jobLaunchModal').close();
    this.modalJob = null;
  }

  logout() {
    this.ngx.close('logoutModal');
    this.auth.logout();
  }

  private unsubAll() {
    [this.currentUserSubscription, this.currentUserSubscription].forEach(sub => {
      try {
        if (sub) {
          sub.unsubscribe();
        }
      } catch (e) {
        console.error(e);
      }
    });

    if (this.messageServiceSubscription) {
      this.messageServiceSubscription.unsubscribe();
    }
  }

  ngOnInit() {
    this.currentUserSubscription = this.auth.currentUser.subscribe(u => (this.currentUser = u));
  }

  ngOnDestroy() {
    this.unsubAll();
  }
}
