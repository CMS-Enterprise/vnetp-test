import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { V1MailService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-report-issue-modal',
  templateUrl: './report-issue-modal.component.html',
})
export class ReportIssueModalComponent implements OnInit {
  public issueForm: UntypedFormGroup;
  submitted: boolean;
  selected: string;
  constructor(
    private auth: AuthService,
    private ngx: NgxSmartModalService,
    private formBuilder: UntypedFormBuilder,
    private mailService: V1MailService,
  ) {}
  comps = ['Firewall Rules', 'NAT Rules', 'Network Objects', 'Service Objects', 'Load Balancer', 'Routing', 'VLANs', 'Tiers', 'Subnets'];
  issueFormText = [
    'What is the error?',
    'Has it worked before?',
    'When did it last work?',
    'What were you expecting it to do?',
    'What did it do instead?',
  ];
  ngOnInit() {
    this.buildForm();
  }

  public buildForm(): void {
    this.issueForm = this.formBuilder.group({
      error: ['', Validators.required],
      hasItWorked: ['', Validators.required],
      whenDidItWork: ['', Validators.required],
      expectation: ['', Validators.required],
      whatHappened: ['', Validators.required],
      component: ['', Validators.required],
    });

    this.selected = '';
    this.submitted = false;
  }

  get rfe() {
    return this.issueForm.controls;
  }

  update(e) {
    this.selected = e.target.value;
  }

  public saveFeedback(): void {
    this.submitted = true;
    let form = this.issueForm;
    if (form.invalid) {
      return;
    }
    form = this.addUserInfo(form);
    const mailBody = form.value;

    this.mailService.createOneIssueMail({ mail: mailBody }).subscribe(
      () => this.closeModal(),
      () => {},
    );
  }

  public closeModal(): void {
    this.ngx.close('reportIssueModal');
    this.buildForm();
  }
  public addUserInfo(form: UntypedFormGroup): UntypedFormGroup {
    form.value.timestamp = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }) + ' EST';
    form.value.user = this.auth.currentUserValue.cn;
    form.value.userEmail = this.auth.currentUserValue.mail;
    form.value.status = 'Open';
    form.value.mailType = 'Issue';
    form.value.toEmail = 'pmccardle@presidio.com';

    return form;
  }

  get issue() {
    return this.issueForm.controls;
  }
}
