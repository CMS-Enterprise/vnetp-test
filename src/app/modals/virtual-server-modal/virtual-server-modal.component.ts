import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { VirtualServer } from 'src/app/models/loadbalancer/virtual-server';

@Component({
  selector: 'app-virtual-server-modal',
  templateUrl: './virtual-server-modal.component.html',
  styleUrls: ['./virtual-server-modal.component.css']
})
export class VirtualServerModalComponent implements OnInit, OnDestroy {
  form: FormGroup;
  submitted: boolean;

  constructor(private ngx: NgxSmartModalService, private formBuilder: FormBuilder) {
  }

  save() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const serviceObject = new VirtualServer();
    serviceObject.Name = this.form.value.name;
    serviceObject.Type = this.form.value.type;

    this.ngx.resetModalData('virtualServerModal');
    this.ngx.setModalData(Object.assign({}, serviceObject), 'virtualServerModal');
    this.ngx.close('virtualServerModal');
    this.reset();
  }

  cancel() {
    this.ngx.close('virtualServerModal');
    this.reset();
  }

  get f() { return this.form.controls; }

  private setFormValidators() {
  }

  getData() {
    const virtualServer =  Object.assign({}, this.ngx.getModalData('virtualServerModal') as VirtualServer);
    if (virtualServer !== undefined) {
      this.form.controls.name.setValue(virtualServer.Name);
      this.form.controls.type.setValue(virtualServer.Type);
      }
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      type: ['', Validators.required]
    });
  }

  private unsubAll() {
  }

  private reset() {
    this.unsubAll();
    this.submitted = false;
    this.buildForm();
  }

  ngOnInit() {
    this.buildForm();
    this.setFormValidators();
  }

  ngOnDestroy() {
    this.unsubAll();
  }
}
