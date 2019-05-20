import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Pool } from 'src/app/models/loadbalancer/pool';

@Component({
  selector: 'app-pool-modal',
  templateUrl: './pool-modal.component.html',
  styleUrls: ['./pool-modal.component.css']
})
export class PoolModalComponent implements OnInit, OnDestroy {
  form: FormGroup;
  submitted: boolean;

  constructor(private ngx: NgxSmartModalService, private formBuilder: FormBuilder) {
  }

  save() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const pool = new Pool();
    pool.Name = this.form.value.name;

    this.ngx.resetModalData('poolModal');
    this.ngx.setModalData(Object.assign({}, pool), 'poolModal');
    this.ngx.close('poolModal');
    this.reset();
  }

  cancel() {
    this.ngx.close('poolModal');
    this.reset();
  }

  get f() { return this.form.controls; }

  private setFormValidators() {
  }

  getData() {
    const pool =  Object.assign({}, this.ngx.getModalData('poolModal') as Pool);
    if (pool !== undefined) {
      this.form.controls.name.setValue(pool.Name);
      }
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: ['', Validators.required]
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
