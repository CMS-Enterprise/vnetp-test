import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { V1MailService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-request-enhancement-modal',
  templateUrl: './request-enhancement-modal.component.html',
})
export class RequestEnhancementModalComponent implements OnInit {
  rfeForm: UntypedFormGroup;
  submitted: boolean;
  selected: string;
  constructor(
    private auth: AuthService,
    private ngx: NgxSmartModalService,
    private formBuilder: UntypedFormBuilder,
    private mailService: V1MailService,
  ) {}
  comps = ['Firewall Rules', 'NAT Rules', 'Network Objects', 'Service Objects', 'Load Balancer', 'Routing', 'VLANs', 'Tiers', 'Subnets'];
  rfeFormText = [
    'What is it doing now?',
    'What do you want it to do?',
    'What are the benefits of doing this?',
    'How will this be helpful to you?',
  ];

  ngOnInit() {
    this.buildForm();
  }
  public buildForm(): void {
    this.rfeForm = this.formBuilder.group({
      description: ['', Validators.required],
      component: ['', Validators.required],
    });

    this.selected = '';
    this.submitted = false;
  }

  get rfe() {
    return this.rfeForm.controls;
  }

  update(e) {
    this.selected = e.target.value;
  }

  public saveFeedback(): void {
    this.submitted = true;
    let form = this.rfeForm;
    form = this.addUserInfo(form);
    if (form.invalid) {
      return;
    }
    // form = this.addUserInfo(form);
    const mailBody = form.value;
    this.mailService.createOneEnhancementMail(mailBody).subscribe(
      () => this.closeModal(),
      () => {},
    );
  }

  public closeModal(): void {
    this.ngx.close('requestEnhancementModal');
    this.buildForm();
  }

  // adds generic fields for RFE/submit issue buttons
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
