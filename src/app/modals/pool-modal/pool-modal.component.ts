import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { Subscription } from 'rxjs';
import { PoolModalDto } from 'src/app/models/loadbalancer/pool-modal-dto';
import { PoolModalHelpText } from 'src/app/helptext/help-text-networking';
import { LoadBalancerNode, LoadBalancerPool, LoadBalancerHealthMonitor, V1LoadBalancerPoolsService } from 'api_client';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { NameValidator } from 'src/app/validators/name-validator';

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
  selectedNodes: LoadBalancerNode[];
  availableNodes: LoadBalancerNode[];
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
    if (this.form && this.form.value && this.form.value.name) {
      pool.name = this.form.value.name.trim();
    }
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

    const yesNoModalSubscription = this.ngx.getModal('yesNoModal').onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
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

  removeNode(node: LoadBalancerNode) {
    const modalDto = new YesNoModalDto('Remove Node', `Are you sure you would like to delete "${node.name}" node?`);
    this.ngx.setModalData(modalDto, 'yesNoModal');
    this.ngx.getModal('yesNoModal').open();

    const yesNoModalSubscription = this.ngx.getModal('yesNoModal').onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
      const data = modal.getData() as YesNoModalDto;
      modal.removeData();
      if (data && data.modalYes) {
        this.poolService
          .v1LoadBalancerPoolsPoolIdNodeNodeIdDelete({
            poolId: this.PoolId,
            nodeId: node.id,
          })
          .subscribe(() => {
            this.getPools();
          });
      }
      yesNoModalSubscription.unsubscribe();
    });
  }

  addNode(node: LoadBalancerNode) {
    this.poolService
      .v1LoadBalancerPoolsPoolIdNodeNodeIdPost({
        poolId: this.PoolId,
        nodeId: node.id,
      })
      .subscribe(
        data => {
          this.getPools();
        },
        error => {
          this.selectedNodes = null;
        },
      );
  }

  getData() {
    const dto = Object.assign({}, this.ngx.getModalData('poolModal') as PoolModalDto);

    if (dto.TierId) {
      this.TierId = dto.TierId;
    }

    const pool = dto.pool;
    this.availableHealthMonitors = dto.healthMonitors;
    this.availableNodes = dto.nodes;

    if (!dto.ModalMode) {
      throw Error('Modal Mode not Set.');
    } else {
      this.ModalMode = dto.ModalMode;

      if (this.ModalMode === ModalMode.Edit) {
        this.PoolId = dto.pool.id;
      } else {
        this.form.controls.name.enable();
      }
    }
    if (pool !== undefined) {
      this.form.controls.name.setValue(pool.name);
      this.form.controls.name.disable();
      this.form.controls.loadBalancingMethod.setValue(pool.loadBalancingMethod);
      this.form.controls.servicePort.setValue(pool.servicePort);

      if (dto.pool.healthMonitors) {
        this.selectedHealthMonitors = dto.pool.healthMonitors;
      } else {
        this.selectedHealthMonitors = new Array<LoadBalancerHealthMonitor>();
      }
      if (dto.pool && dto.pool.nodes) {
        this.selectedNodes = pool.nodes;
      } else {
        this.selectedNodes = new Array<LoadBalancerNode>();
      }
    }
    if (pool && pool.healthMonitors) {
      this.getAvailableHealthMonitors(pool.healthMonitors);
    }
    if (pool && pool.nodes) {
      this.getAvailableNodes(pool.nodes);
    }
    this.ngx.resetModalData('poolModal');
  }

  private getAvailableHealthMonitors(healthMonitors: Array<LoadBalancerHealthMonitor>) {
    if (!this.selectedHealthMonitors) {
      this.selectedHealthMonitors = new Array<LoadBalancerHealthMonitor>();
    }

    if (!this.availableHealthMonitors) {
      this.availableHealthMonitors = new Array<LoadBalancerHealthMonitor>();
    }

    healthMonitors.forEach(healthMonitor => {
      this.availableHealthMonitors = this.availableHealthMonitors.filter(hm => hm.id !== healthMonitor.id);
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

  private getAvailableNodes(nodes: Array<LoadBalancerNode>) {
    if (!this.selectedNodes) {
      this.selectedNodes = new Array<LoadBalancerNode>();
    }

    if (!this.availableNodes) {
      this.availableNodes = new Array<LoadBalancerNode>();
    }
    nodes.forEach(node => {
      this.availableNodes = this.availableNodes.filter(n => n.id !== node.id);
      if (!this.selectedNodes.includes(node)) {
        this.availableNodes.push(node);
      }
    });
  }

  selectNode() {
    const node = this.form.value.selectedNode;
    if (!node) {
      return;
    }
    if (!this.selectedNodes) {
      this.selectedNodes = new Array<LoadBalancerNode>();
    }
    this.selectedNodes.push(node);
    const availableIndex = this.availableNodes.indexOf(node);
    if (availableIndex > -1) {
      this.availableNodes.splice(availableIndex, 1);
    }
    this.form.controls.selectedNode.setValue(null);
    this.form.controls.selectedNode.updateValueAndValidity();
    this.addNode(node);
  }

  unselectNode(node: LoadBalancerNode) {
    if (!this.availableNodes) {
      this.availableNodes = new Array<LoadBalancerNode>();
    }

    this.availableNodes.push(node);
    const selectedIndex = this.selectedNodes.indexOf(node);
    if (selectedIndex > -1) {
      this.selectedNodes.splice(selectedIndex, 1);
    }
    this.removeNode(node);
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: ['', Validators.compose([Validators.required, NameValidator])],
      loadBalancingMethod: ['', Validators.required],
      selectedHealthMonitor: [''],
      selectedNode: [''],
      servicePort: [''],
    });
  }

  private unsubAll() {}

  public reset() {
    this.unsubAll();
    this.submitted = false;
    this.PoolId = null;
    this.buildForm();
    this.nodes = new Array<LoadBalancerNode>();
    this.selectedHealthMonitors = new Array<LoadBalancerHealthMonitor>();
    this.availableHealthMonitors = new Array<LoadBalancerHealthMonitor>();
    this.selectedNodes = new Array<LoadBalancerNode>();
    this.availableNodes = new Array<LoadBalancerNode>();
  }

  ngOnInit() {
    this.buildForm();
  }

  ngOnDestroy() {
    this.unsubAll();
  }
}
