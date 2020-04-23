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

  addHealthMonitor() {
    this.poolService
      .v1LoadBalancerPoolsPoolIdHealthMonitorHealthMonitorIdPost({
        poolId: this.PoolId,
        healthMonitorId: this.f.selectedHealthMonitor.value,
      })
      .subscribe(data => {
        this.getPool();
        this.f.selectedHealthMonitor.setValue('');
      });
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
            this.getPool();
          });
      }
      yesNoModalSubscription.unsubscribe();
    });
  }

  private getPool() {
    this.poolService.v1LoadBalancerPoolsIdPoolIdGet({ id: this.PoolId }).subscribe(data => {
      this.Pool = data[0];
      this.selectedHealthMonitors = data[0].healthMonitors;
      this.selectedNodes = data[0].nodes;
    });
  }

  removeNode(nodeToPool: any) {
    const modalDto = new YesNoModalDto('Remove Node', `Are you sure you would like to delete "${nodeToPool.loadBalancerNode.name}" node?`);
    this.ngx.setModalData(modalDto, 'yesNoModal');
    this.ngx.getModal('yesNoModal').open();

    const yesNoModalSubscription = this.ngx.getModal('yesNoModal').onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
      const data = modal.getData() as YesNoModalDto;
      modal.removeData();
      if (data && data.modalYes) {
        this.poolService
          .v1LoadBalancerPoolsPoolIdNodeNodeIdServicePortServicePortPriorityPriorityDelete({
            poolId: this.PoolId,
            nodeId: nodeToPool.loadBalancerNode.id,
            servicePort: nodeToPool.servicePort,
            priority: nodeToPool.priority,
          })
          .subscribe(() => {
            this.getPool();
          });
      }
      yesNoModalSubscription.unsubscribe();
    });
  }

  addNode() {
    this.poolService
      .v1LoadBalancerPoolsPoolIdNodeNodeIdServicePortServicePortPriorityPriorityPost({
        poolId: this.PoolId,
        nodeId: this.f.selectedNode.value.id,
        servicePort: this.f.servicePort.value,
        priority: this.f.priority.value,
      })
      .subscribe(data => {
        this.getPool();
        this.f.selectedNode.setValue('');
      });
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

      if (dto.pool.healthMonitors) {
        this.selectedHealthMonitors = dto.pool.healthMonitors;
      } else {
        this.selectedHealthMonitors = new Array<LoadBalancerHealthMonitor>();
      }
      if (dto.pool.nodes) {
        this.selectedNodes = dto.pool.nodes;
      } else {
        this.selectedNodes = new Array<LoadBalancerNode>();
      }
    }

    this.ngx.resetModalData('poolModal');
  }

  // not currently filtering properly, also need to add this type of logic to virtual servers -> profiles, policies
  private removeIntersection(all: any[], selected: any[]) {
    return all.filter(allEntity => !selected.includes(allEntity));
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100), NameValidator])],
      loadBalancingMethod: ['', Validators.required],
      selectedHealthMonitor: [''],
      selectedNode: [''],
      servicePort: [''],
      priority: [''],
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
