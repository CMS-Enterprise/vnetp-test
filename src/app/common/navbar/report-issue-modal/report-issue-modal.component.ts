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
  submitted;
  selected;
  constructor(
    private auth: AuthService,
    private ngx: NgxSmartModalService,
    private formBuilder: UntypedFormBuilder,
    private mailService: V1MailService,
  ) {}
  comps = ['Firewall Rules', 'NAT Rules', 'Network Objects', 'Service Objects', 'Load Balancer', 'Routing', 'VLANs', 'Tiers', 'Subnets'];
  // issueFormText =
  //     ['What is the error? \nHas it worked before? \nWhen did it last work? \nWhat were you expecting it to do? \nWhat did it do instead?\n'];
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
  get issue() {
    return this.issueForm.controls;
  }

  private buildForm(): void {
    this.issueForm = this.formBuilder.group({
      description: ['', Validators.required],
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

  public async saveFeedback(): Promise<any> {
    this.submitted = true;
    let form = this.issueForm;
    if (form.invalid) {
      return;
    }
    form = this.addUserInfo(form);
    const mailBody = form.value;
    console.log('mailBody', mailBody);
    this.mailService.createOneMail({ body: mailBody }).subscribe(
      () => this.closeModal(),
      () => {},
    );
    console.log('form', form);
  }

  public closeModal(): void {
    this.ngx.close('reportIssueModal');
    this.buildForm();
  }
  public addUserInfo(form: UntypedFormGroup): any {
    form.value.timestamp = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }) + ' EST';
    form.value.user = this.auth.currentUserValue.cn;
    form.value.userEmail = this.auth.currentUserValue.mail;
    form.value.description = form.value.description.replaceAll('\n', '<br />'); // formatting for email body
    form.value.url = window.location.href;
    form.value.toEmail = 'pmccardle@presidio.com';

    return form;
  }
}
