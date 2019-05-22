import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Pool } from 'src/app/models/loadbalancer/pool';
import { PoolMember } from 'src/app/models/loadbalancer/pool-member';
import { ModalMode } from 'src/app/models/modal-mode';
import { Subscription } from 'rxjs';
import { PoolModalDto } from 'src/app/models/pool-modal-dto';

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
  selectedHealthMonitors: string[];
  availableHealthMonitors: string[];

  constructor(private ngx: NgxSmartModalService, private formBuilder: FormBuilder) {
  }

  save() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const pool = new Pool();
    pool.Name = this.form.value.name;
    pool.LoadBalancingMethod = this.form.value.loadBalancingMethod;
    pool.Members = Object.assign([], this.poolMembers);
    pool.HealthMonitors = Object.assign([], this.selectedHealthMonitors);

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
    if (!this.poolMembers) {
      this.poolMembers = new Array<PoolMember>();
    }

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
 

    const dto =  Object.assign({}, this.ngx.getModalData('poolModal') as PoolModalDto);

    console.log(dto);

    const pool = dto.pool;

    if (pool !== undefined) {
      this.form.controls.name.setValue(pool.Name);
      this.form.controls.loadBalancingMethod.setValue(pool.LoadBalancingMethod);

      if (dto.pool.HealthMonitors) {
        this.selectedHealthMonitors = dto.pool.HealthMonitors;
      } else {
        this.selectedHealthMonitors = new Array<string>();
      }

      if (pool.Members) {
        this.poolMembers = pool.Members;
      } else {
        this.poolMembers = new Array<PoolMember>();
      }
    }
    this.getAvailableHealthMonitors(dto.HealthMonitors.map(h => h.Name));
  }

  private getAvailableHealthMonitors(healthMonitors: Array<string>) {
    this.availableHealthMonitors = new Array<string>();

    if (!this.selectedHealthMonitors) {
      this.selectedHealthMonitors = new Array<string>();
    }

    if (!this.availableHealthMonitors){
      this.availableHealthMonitors = new Array<string>();
    }

    healthMonitors.forEach( healthMonitor => {
      if (!this.selectedHealthMonitors.includes(healthMonitor)) {
        this.availableHealthMonitors.push(healthMonitor);
      }
    });
  }

  selectHealthMonitor() {
    const healthMonitor = this.form.value.selectedHealthMonitor;

    if (!healthMonitor) {
      return;
    }

    this.selectedHealthMonitors.push(healthMonitor);
    const availableIndex = this.availableHealthMonitors.indexOf(healthMonitor);
    if (availableIndex > -1) {
      this.availableHealthMonitors.splice(availableIndex, 1);
    }
    this.form.controls.selectedHealthMonitor.setValue(null);
    this.form.controls.selectedHealthMonitor.updateValueAndValidity();
  }

  unselectHealthMonitor(healthMonitor) {
    this.availableHealthMonitors.push(healthMonitor);
    const selectedIndex = this.selectedHealthMonitors.indexOf(healthMonitor);
    if (selectedIndex > -1) {
      this.selectedHealthMonitors.splice(selectedIndex, 1);
    }
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      loadBalancingMethod: ['', Validators.required],
      selectedHealthMonitor: ['']
    });

    this.poolMembers = new Array<PoolMember>();
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
