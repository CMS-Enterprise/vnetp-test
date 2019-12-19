import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Pool } from 'src/app/models/loadbalancer/pool';
import { PoolMember } from 'src/app/models/loadbalancer/pool-member';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { Subscription } from 'rxjs';
import { PoolModalDto } from 'src/app/models/loadbalancer/pool-modal-dto';
import { PoolModalHelpText } from 'src/app/helptext/help-text-networking';
import {
  LoadBalancerNode,
  LoadBalancerPool,
  LoadBalancerHealthMonitorType,
  LoadBalancerHealthMonitor,
  Tier,
} from 'api_client';

@Component({
  selector: 'app-pool-modal',
  templateUrl: './pool-modal.component.html',
})
export class PoolModalComponent implements OnInit, OnDestroy {
  form: FormGroup;
  submitted: boolean;

  poolMembers: LoadBalancerNode[];
  poolMemberModalMode: ModalMode;
  editPoolMemberIndex: any;
  poolMemberModalSubscription: Subscription;
  selectedHealthMonitors: LoadBalancerHealthMonitor[];
  availableHealthMonitors: LoadBalancerHealthMonitor[];
  tier: Tier;

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: FormBuilder,
    public helpText: PoolModalHelpText,
  ) {}

  save() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const pool = {} as LoadBalancerPool;
    pool.name = this.form.value.name;
    pool.loadBalancingMethod = this.form.value.loadBalancingMethod;
    // how should be saving?
    // pool.nodes = Object.assign([], (this.poolMembers));
    // pool.healthMonitors = Object.assign([], this.selectedHealthMonitors);

    pool.name = pool.name.trim();

    const dto = new PoolModalDto();

    dto.pool = pool;

    this.ngx.resetModalData('poolModal');
    this.ngx.setModalData(Object.assign({}, dto), 'poolModal');
    this.ngx.close('poolModal');
    this.reset();
  }

  cancel() {
    this.ngx.close('poolModal');
    this.reset();
  }

  get f() {
    return this.form.controls;
  }

  private setFormValidators() {}

  deletePoolMember(poolMember: LoadBalancerNode) {
    const index = this.poolMembers.indexOf(poolMember);
    if (index > -1) {
      this.poolMembers.splice(index, 1);
    }
  }

  savePoolMember(poolMember: LoadBalancerNode) {
    if (!this.poolMembers) {
      this.poolMembers = new Array<LoadBalancerNode>();
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

  editPoolMember(poolMember: LoadBalancerNode) {
    this.subscribeToPoolMemberModal();
    this.poolMemberModalMode = ModalMode.Edit;
    this.ngx.setModalData(Object.assign({}, poolMember), 'poolMemberModal');
    this.editPoolMemberIndex = this.poolMembers.indexOf(poolMember);
    this.ngx.getModal('poolMemberModal').toggle();
  }

  subscribeToPoolMemberModal() {
    this.poolMemberModalSubscription = this.ngx
      .getModal('poolMemberModal')
      .onAnyCloseEvent.subscribe((modal: NgxSmartModalComponent) => {
        let data = modal.getData() as LoadBalancerNode;

        if (data !== undefined) {
          data = Object.assign({}, data);
          this.savePoolMember(data);
        }
        this.ngx.resetModalData('poolMemberModal');
        this.poolMemberModalSubscription.unsubscribe();
      });
  }

  getData() {
    const dto = Object.assign(
      {},
      this.ngx.getModalData('poolModal') as PoolModalDto,
    );

    const pool = dto.pool;

    if (pool !== undefined) {
      this.form.controls.name.setValue(pool.name);
      this.form.controls.loadBalancingMethod.setValue(pool.loadBalancingMethod);

      if (dto.pool.healthMonitors) {
        this.selectedHealthMonitors = dto.pool.healthMonitors;
      } else {
        this.selectedHealthMonitors = new Array<LoadBalancerHealthMonitor>();
      }

      if (pool.nodes) {
        this.poolMembers = pool.nodes;
      } else {
        this.poolMembers = new Array<LoadBalancerNode>();
      }
    }

    if (dto.healthMonitors) {
      this.getAvailableHealthMonitors(dto.healthMonitors.map(h => h));
    }
    this.ngx.resetModalData('poolModal');
  }

  private getAvailableHealthMonitors(
    healthMonitors: Array<LoadBalancerHealthMonitor>,
  ) {
    this.availableHealthMonitors = new Array<LoadBalancerHealthMonitor>();

    if (!this.selectedHealthMonitors) {
      this.selectedHealthMonitors = new Array<LoadBalancerHealthMonitor>();
    }

    if (!this.availableHealthMonitors) {
      this.availableHealthMonitors = new Array<LoadBalancerHealthMonitor>();
    }

    healthMonitors.forEach(healthMonitor => {
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
      selectedHealthMonitor: [''],
    });
  }

  private unsubAll() {}

  private reset() {
    this.unsubAll();
    this.submitted = false;
    this.buildForm();
    this.poolMembers = new Array<LoadBalancerNode>();
    this.selectedHealthMonitors = new Array<LoadBalancerHealthMonitor>();
    this.availableHealthMonitors = new Array<LoadBalancerHealthMonitor>();
  }

  ngOnInit() {
    this.buildForm();
    this.setFormValidators();
  }

  ngOnDestroy() {
    this.unsubAll();
  }
}
