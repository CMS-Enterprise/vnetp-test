import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Pool } from 'src/app/models/loadbalancer/pool';
import { PoolMember } from 'src/app/models/loadbalancer/pool-member';
import { ModalMode } from 'src/app/models/modal-mode';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pool-modal',
  templateUrl: './pool-modal.component.html',
  styleUrls: ['./pool-modal.component.css']
})
export class PoolModalComponent implements OnInit, OnDestroy {
  form: FormGroup;
  submitted: boolean;

  poolMembers: Array<PoolMember>;
  poolMemberModalMode: ModalMode;
  editPoolMemberIndex: any;
  poolMemberModalSubscription: Subscription;

  constructor(private ngx: NgxSmartModalService, private formBuilder: FormBuilder) {
  }

  save() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const pool = new Pool();
    pool.Name = this.form.value.name;
    console.log(this.form.value.loadBalancingMethod);
    pool.LoadBalancingMethod = this.form.value.loadBalancingMethod;
    pool.Members = Object.assign([], this.poolMembers);

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

  deletePoolMember(poolMember: PoolMember) {
    const index = this.poolMembers.indexOf(poolMember);
    if (index > -1) {
      this.poolMembers.splice(index, 1);
    }
  }

  savePoolMember(poolMember: PoolMember) {
    if (this.poolMemberModalMode === ModalMode.Create) {
      this.poolMembers.push(poolMember);
    } else {
      this.poolMembers[this.editPoolMemberIndex] = poolMember;
    }
  }

  createPoolMember() {
    this.subscribeToPoolMemberModal();
    this.poolMemberModalMode = ModalMode.Create;
    this.ngx.getModal('poolMemberModal').toggle();
  }

  editPoolMember(poolMember: PoolMember) {
    this.subscribeToPoolMemberModal();
    this.poolMemberModalMode = ModalMode.Edit;
    this.ngx.setModalData(Object.assign({}, poolMember), 'poolMemberModal');
    this.editPoolMemberIndex = this.poolMembers.indexOf(poolMember);
    this.ngx.getModal('poolMemberModal').toggle();
  }

  subscribeToPoolMemberModal() {
    this.poolMemberModalSubscription =
    this.ngx.getModal('poolMemberModal').onAnyCloseEvent.subscribe((modal: NgxSmartModalComponent) => {
      let data = modal.getData() as PoolMember;

      if (data !== undefined) {
        data = Object.assign({}, data);
        this.savePoolMember(data);
      }
      this.ngx.resetModalData('poolMemberModal');
      this.poolMemberModalSubscription.unsubscribe();
    });
  }

  getData() {
    const pool =  Object.assign({}, this.ngx.getModalData('poolModal') as Pool);
    if (pool !== undefined) {
      this.form.controls.name.setValue(pool.Name);
      this.form.controls.loadBalancingMethod.setValue(pool.LoadBalancingMethod);
      }
    if (pool.Members) {
        this.poolMembers = pool.Members;
      } else {
        this.poolMembers = new Array<PoolMember>();
      }
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      loadBalancingMethod: ['', Validators.required]
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
