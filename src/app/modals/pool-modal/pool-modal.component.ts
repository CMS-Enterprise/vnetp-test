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
  V1LoadBalancerHealthMonitorsService,
  V1TiersService,
} from 'api_client';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { NodeModalDto } from 'src/app/models/loadbalancer/node-modal-dto';
import { HealthMonitor } from 'src/app/models/loadbalancer/health-monitor';

@Component({
  selector: 'app-pool-modal',
  templateUrl: './pool-modal.component.html',
})
export class PoolModalComponent implements OnInit, OnDestroy {
  form: FormGroup;
  submitted: boolean;

  nodes: LoadBalancerNode[];
  nodesModalMode: ModalMode;
  editNodeIndex: number;
  nodeModalSubscription: Subscription;
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
    if (this.ModalMode === ModalMode.Create && !this.PoolId) {
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

  addHealthMonitor(healthMonitor: LoadBalancerHealthMonitor) {
    this.poolService
      .v1LoadBalancerPoolsPoolIdHealthMonitorHealthMonitorIdPost({
        poolId: this.PoolId,
        healthMonitorId: healthMonitor.id,
      })
      .subscribe(
        data => {
          this.getPools();
        },
        error => {
          this.selectedHealthMonitors = null;
        },
      );
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
            .v1LoadBalancerPoolsPoolIdHealthMonitorHealthMonitorIdDelete({
              poolId: this.PoolId,
              healthMonitorId: healthMonitor.id,
            })
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
        id: this.PoolId,
        join: 'LoadBalancerNodes,LoadBalancerHealthMonitors',
      })
      .subscribe(data => {
        this.Pool = data;
        this.HealthMonitors = data.healthMonitors;
        this.Nodes = data.nodes;
      });
  }

  private setFormValidators() {}

  deleteNode(node: LoadBalancerNode) {
    const modalDto = new YesNoModalDto(
      'Remove Node',
      `Are you sure you would like to delete "${node.name}" node?`,
    );
    this.ngx.setModalData(modalDto, 'yesNoModal');
    this.ngx.getModal('yesNoModal').open();

    const yesNoModalSubscription = this.ngx
      .getModal('yesNoModal')
      .onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
        const data = modal.getData() as YesNoModalDto;
        modal.removeData();
        if (data && data.modalYes) {
          this.poolService
            .v1LoadBalancerPoolsPoolIdNodeNodeIdDelete({
              poolId: this.PoolId,
              nodeId: node.id,
            })
            .subscribe(() => {
              const selectedIndex = this.nodes.indexOf(node);
              if (selectedIndex > -1) {
                this.nodes.splice(selectedIndex, 1);
              }
              this.getPools();
            });
        }
        yesNoModalSubscription.unsubscribe();
      });
  }

  saveNode(node: LoadBalancerNode) {
    if (!this.nodes) {
      this.nodes = new Array<LoadBalancerNode>();
    }
    if (this.ModalMode === ModalMode.Create) {
      this.nodes.push(node);
    } else {
      this.nodes[this.editNodeIndex] = node;
    }
  }

  createNode() {
    const node = {
      TierId: this.TierId,
      PoolId: this.PoolId,
      ModalMode: ModalMode.Create,
    };
    this.subscribeToNodeModal();
    this.ModalMode = ModalMode.Create;
    this.ngx.setModalData(Object.assign({}, node), 'nodeModal');
    this.ngx.getModal('nodeModal').toggle();
  }

  editNode(node: LoadBalancerNode) {
    const nodeDto = {} as NodeModalDto;
    nodeDto.node = node;
    nodeDto.PoolId = this.PoolId;
    nodeDto.ModalMode = ModalMode.Edit;
    this.subscribeToNodeModal();
    this.ngx.setModalData(Object.assign({}, nodeDto), 'nodeModal');
    this.editNodeIndex = this.nodes.indexOf(node);
    this.ngx.getModal('nodeModal').toggle();
  }

  subscribeToNodeModal() {
    this.nodeModalSubscription = this.ngx
      .getModal('nodeModal')
      .onAnyCloseEvent.subscribe((modal: NgxSmartModalComponent) => {
        let data = modal.getData() as LoadBalancerNode;
        if (data !== undefined) {
          data = Object.assign({}, data);
          this.saveNode(data);
        }
        this.ngx.resetModalData('nodeModal');
        this.nodeModalSubscription.unsubscribe();
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
    this.availableHealthMonitors = dto.healthMonitors;
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
        this.nodes = pool.nodes;
      } else {
        this.nodes = new Array<LoadBalancerNode>();
      }
    }
    if (pool && pool.healthMonitors) {
      this.getAvailableHealthMonitors(pool.healthMonitors);
    }
    this.ngx.resetModalData('poolModal');
  }

  private getAvailableHealthMonitors(
    healthMonitors: Array<LoadBalancerHealthMonitor>,
  ) {
    if (!this.selectedHealthMonitors) {
      this.selectedHealthMonitors = new Array<LoadBalancerHealthMonitor>();
    }

    if (!this.availableHealthMonitors) {
      this.availableHealthMonitors = new Array<LoadBalancerHealthMonitor>();
    }

    healthMonitors.forEach(healthMonitor => {
      this.availableHealthMonitors = this.availableHealthMonitors.filter(
        hm => hm.id !== healthMonitor.id,
      );
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
    if (!this.selectedHealthMonitors) {
      this.selectedHealthMonitors = new Array<LoadBalancerHealthMonitor>();
    }
    this.selectedHealthMonitors.push(healthMonitor);
    const availableIndex = this.availableHealthMonitors.indexOf(healthMonitor);
    if (availableIndex > -1) {
      this.availableHealthMonitors.splice(availableIndex, 1);
    }
    this.form.controls.selectedHealthMonitor.setValue(null);
    this.form.controls.selectedHealthMonitor.updateValueAndValidity();
    this.addHealthMonitor(healthMonitor);
  }

  unselectHealthMonitor(healthMonitor: LoadBalancerHealthMonitor) {
    if (!this.availableHealthMonitors) {
      this.availableHealthMonitors = new Array<LoadBalancerHealthMonitor>();
    }

    this.availableHealthMonitors.push(healthMonitor);
    const selectedIndex = this.selectedHealthMonitors.indexOf(healthMonitor);
    if (selectedIndex > -1) {
      this.selectedHealthMonitors.splice(selectedIndex, 1);
    }
    this.removeHealthMonitor(healthMonitor);
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
    this.nodes = new Array<LoadBalancerNode>();
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
