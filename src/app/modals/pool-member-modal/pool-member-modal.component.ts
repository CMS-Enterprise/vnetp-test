import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { PoolMember } from 'src/app/models/loadbalancer/pool-member';

@Component({
  selector: 'app-pool-member-modal',
  templateUrl: './pool-member-modal.component.html',
  styleUrls: ['./pool-member-modal.component.css']
})
export class PoolMemberModalComponent implements OnInit, OnDestroy {
  form: FormGroup;
  submitted: boolean;

  constructor(private ngx: NgxSmartModalService, private formBuilder: FormBuilder) {
  }

  save() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const poolMember = new PoolMember();
    poolMember.Name = this.form.value.name;
    poolMember.Type = this.form.value.type;

    this.ngx.resetModalData('poolMemberModal');
    this.ngx.setModalData(Object.assign({}, poolMember), 'poolMemberModal');
    this.ngx.close('poolMemberModal');
    this.reset();
  }

  cancel() {
    this.ngx.close('poolMemberModal');
    this.reset();
  }

  get f() { return this.form.controls; }

  private setFormValidators() {
  }

  getData() {
    const poolMember =  Object.assign({}, this.ngx.getModalData('poolMemberModal') as PoolMember);
    if (poolMember !== undefined) {
      this.form.controls.name.setValue(poolMember.Name);
      this.form.controls.type.setValue(poolMember.Type);
      }
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      ipAddress: [''],
      fqdn: [''],
      servicePort: [0],
      Priority: [0],
      AutoPopulate: [false]
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
