import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { Subscription } from 'rxjs';
import { PoolModalDto } from 'src/app/models/loadbalancer/pool-modal-dto';
import { PoolModalHelpText } from 'src/app/helptext/help-text-networking';
import {
  LoadBalancerNode,
  LoadBalancerPool,
  LoadBalancerHealthMonitor,
  V1LoadBalancerPoolsService,
} from 'api_client';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';

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
  TierId: string;
  Pool: LoadBalancerPool;
  Nodes: LoadBalancerNode[];
  HealthMonitors: LoadBalancerHealthMonitor[];
  ModalMode: ModalMode;
  PoolId: string;

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: FormBuilder,
    private poolService: V1LoadBalancerPoolsService,
    public helpText: PoolModalHelpText,
  ) {}

  save() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const pool = {} as LoadBalancerPool;
    pool.name = this.form.value.name.trim();
    pool.loadBalancingMethod = this.form.value.loadBalancingMethod;
    pool.servicePort = this.form.value.servicePort;

    if (this.ModalMode === ModalMode.Create) {
      pool.tierId = this.TierId;
      this.poolService
        .v1LoadBalancerPoolsPost({
          loadBalancerPool: pool,
        })
        .subscribe(
          data => {
            this.closeModal();
          },
          error => {},
        );
    } else {
      this.poolService
        .v1LoadBalancerPoolsIdPut({
          id: this.PoolId,
          loadBalancerPool: pool,
        })
        .subscribe(
          data => {
            this.closeModal();
          },
          error => {},
        );
    }

    this.closeModal();
  }

  private closeModal() {
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

  removeHealthMonitor(healthMonitor: LoadBalancerHealthMonitor) {
    const modalDto = new YesNoModalDto('Remove Health Monitor', '');
    this.ngx.setModalData(modalDto, 'yesNoModal');
    this.ngx.getModal('yesNoModal').open();

    const yesNoModalSubscription = this.ngx
      .getModal('yesNoModal')
      .onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
        const data = modal.getData() as YesNoModalDto;
        modal.removeData();
        if (data && data.modalYes) {
          this.poolService
            .v1LoadBalancerPoolsIdDelete({ id: healthMonitor.id })
            .subscribe(() => {
              this.getPools();
            });
        }
        yesNoModalSubscription.unsubscribe();
      });
  }

  private getPools() {
    this.poolService
      .v1LoadBalancerPoolsIdGet({
        id: this.Pool.id,
        join: 'LoadBalancerNodes,LoadBalancerHealthMonitors',
      })
      .subscribe(data => {
        this.Pool = data;
        this.HealthMonitors = data.healthMonitors;
        this.Nodes = data.nodes;
      });
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

    if (dto.TierId) {
      this.TierId = dto.TierId;
    }

    const pool = dto.pool;

    if (!dto.ModalMode) {
      throw Error('Modal Mode not Set.');
    } else {
      this.ModalMode = dto.ModalMode;

      if (this.ModalMode === ModalMode.Edit) {
        this.PoolId = dto.pool.id;
      }
    }

    if (pool !== undefined) {
      this.form.controls.name.setValue(pool.name);
      this.form.controls.loadBalancingMethod.setValue(pool.loadBalancingMethod);
      this.form.controls.servicePort.setValue(pool.servicePort);

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
      servicePort: [''],
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
