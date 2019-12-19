import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IRuleModalHelpText } from 'src/app/helptext/help-text-networking';
import { LoadBalancerIrule } from 'api_client';

@Component({
  selector: 'app-irule-modal',
  templateUrl: './irule-modal.component.html',
})
export class IRuleModalComponent implements OnInit {
  form: FormGroup;
  submitted: boolean;

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: FormBuilder,
    public helpText: IRuleModalHelpText,
  ) {}

  save() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const irule = {} as LoadBalancerIrule;
    irule.name = this.form.value.name;
    irule.content = this.form.value.content;

    this.ngx.resetModalData('iruleModal');
    this.ngx.setModalData(Object.assign({}, irule), 'iruleModal');
    this.ngx.close('iruleModal');
    this.reset();
  }

  cancel() {
    this.ngx.close('iruleModal');
    this.reset();
  }

  get f() {
    return this.form.controls;
  }

  getData() {
    const irule = Object.assign(
      {},
      this.ngx.getModalData('iruleModal') as LoadBalancerIrule,
    );
    if (irule !== undefined) {
      this.form.controls.name.setValue(irule.name);
      this.form.controls.content.setValue(irule.content);
    }
    this.ngx.resetModalData('iruleModal');
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      content: ['', Validators.required],
    });
  }

  private reset() {
    this.submitted = false;
    this.buildForm();
  }

  ngOnInit() {
    this.buildForm();
  }
}
