import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { V1MailService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
  selector: 'app-request-enhancement-modal',
  templateUrl: './request-enhancement-modal.component.html',
})
export class RequestEnhancementModalComponent implements OnInit {
  rfeForm: UntypedFormGroup;
  submitted;
  selected;
  constructor(private ngx: NgxSmartModalService, private formBuilder: UntypedFormBuilder, private mailService: V1MailService) {}
  comps = ['Network Objects', 'Service Objects', 'Load Balancer', 'Routing', 'Firewall Rules', 'VLANs', 'Tiers', 'Subnets', 'NAT Rules'];
  rfeFormText =
    'What is it doing now? \nWhat do you want it to do? \nWhat are the benefits of doing this? \nHow will this be helpful to you?\n';

  ngOnInit() {
    this.buildForm();
  }
  private buildForm(): void {
    // TODO test len on description instead, because default text counts
    this.rfeForm = this.formBuilder.group({
      description: [this.rfeFormText, Validators.required],
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

  public async saveFeedback(): Promise<any> {
    this.submitted = true;
    let form = this.rfeForm;
    if (form.invalid) {
      return;
    }
    console.log('form', form);
    const mailBody = form.value;
    console.log('mailBody', mailBody);
    // const jsonBody = JSON.parse(mailBody);
    // console.log('jsonBody',jsonBody)
    this.mailService.createOneMail({ body: mailBody }).subscribe(
      () => this.closeModal(),
      () => {},
    );
    console.log('form', form);
  }

  public closeModal(): void {
    this.ngx.close('requestEnhancementModal');
    this.ngx.close('reportIssueModal');
    this.buildForm();
  }
}
