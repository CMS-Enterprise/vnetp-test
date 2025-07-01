import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { PoolModalHelpText } from 'src/app/helptext/help-text-networking';
import {
  LoadBalancerHealthMonitor,
  LoadBalancerHealthMonitorTypeEnum,
  LoadBalancerNode,
  LoadBalancerPool,
  LoadBalancerPoolDefaultHealthMonitorsEnum,
  LoadBalancerPoolLoadBalancingMethodEnum,
  Tier,
  V1LoadBalancerPoolsService,
  V1TiersService,
} from 'client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { NameValidator } from 'src/app/validators/name-validator';
import { PoolModalDto } from './pool-modal.dto';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { RangeValidator } from 'src/app/validators/range-validator';
import ValidatorUtil from 'src/app/utils/ValidatorUtil';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import { methodsLookup } from 'src/app/lookups/load-balancing-method.lookup';

@Component({
  selector: 'app-pool-modal',
  templateUrl: './pool-modal.component.html',
})
export class PoolModalComponent implements OnInit {
  public form: UntypedFormGroup;
  public modalMode: ModalMode;
  public submitted: boolean;
  public ModalMode = ModalMode;

  public availableHealthMonitors: LoadBalancerHealthMonitor[] = [];
  public availableNodes: LoadBalancerNode[] = [];

  public selectedDefaultHealthMonitors: LoadBalancerPoolDefaultHealthMonitorsEnum[] = [];
  public selectedHealthMonitors: LoadBalancerHealthMonitor[] = [];
  public selectedNodes: LoadBalancerNode[] = [];

  public defaultHealthMonitors = [
    LoadBalancerPoolDefaultHealthMonitorsEnum.Http,
    LoadBalancerPoolDefaultHealthMonitorsEnum.Https,
    LoadBalancerPoolDefaultHealthMonitorsEnum.Tcp,
    LoadBalancerPoolDefaultHealthMonitorsEnum.Udp,
  ];
  public methods: LoadBalancerPoolLoadBalancingMethodEnum[] = Object.keys(LoadBalancerPoolLoadBalancingMethodEnum)
    .map(k => LoadBalancerPoolLoadBalancingMethodEnum[k])
    .sort();
  public methodsLookup = methodsLookup;

  private poolId: string;
  private tierId: string;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private ngx: NgxSmartModalService,
    private poolService: V1LoadBalancerPoolsService,
    public helpText: PoolModalHelpText,
    private tiersService: V1TiersService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
  }

  get f() {
    return this.form.controls;
  }

  public closeModal(): void {
    this.ngx.close('poolModal');
    this.submitted = false;
    this.poolId = null;
    this.selectedHealthMonitors = [];
    this.availableHealthMonitors = [];
    this.selectedDefaultHealthMonitors = [];
    this.selectedNodes = [];
    this.availableNodes = [];
    this.buildForm();
  }

  public save(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const { loadBalancingMethod, name } = this.form.value;

    const pool: LoadBalancerPool = {
      loadBalancingMethod,
      name,
      healthMonitors: this.selectedHealthMonitors || [],
      defaultHealthMonitors: this.selectedDefaultHealthMonitors || [],
      tierId: this.tierId,
    };

    if (this.modalMode === ModalMode.Create) {
      this.createPool(pool);
    } else {
      this.updatePool(pool);
    }
  }

  public addHealthMonitor(): void {
    const healthMonitorId = this.f.selectedHealthMonitor.value;

    if (this.isDefaultHealthMonitor(healthMonitorId)) {
      this.selectedDefaultHealthMonitors.push(healthMonitorId);
      this.poolService
        .updateOneLoadBalancerPool({
          id: this.poolId,
          loadBalancerPool: {
            defaultHealthMonitors: this.selectedDefaultHealthMonitors,
          } as LoadBalancerPool,
        })
        .subscribe(() => {
          this.loadPoolResources();
          this.f.selectedHealthMonitor.setValue(null);
        });
    } else {
      this.poolService
        .addHealthMonitorToPoolLoadBalancerPool({
          poolId: this.poolId,
          healthMonitorId: this.f.selectedHealthMonitor.value,
        })
        .subscribe(() => {
          this.loadPoolResources();
          this.f.selectedHealthMonitor.setValue(null);
        });
    }
  }

  public addNode(): void {
    const { selectedNode, servicePort, ratio } = this.form.getRawValue();
    if (!selectedNode || !servicePort || !ratio) {
      return;
    }

    this.poolService
      .addNodeToPoolLoadBalancerPool({
        poolId: this.poolId,
        nodeId: selectedNode.id,
        servicePort,
        ratio,
      })
      .subscribe(() => {
        this.loadPoolResources();
        this.f.selectedNode.setValue(null);
        this.f.servicePort.setValue(null);
        this.f.ratio.setValue(null);
      });
  }

  public removeHealthMonitor(healthMonitorId: string | LoadBalancerHealthMonitorTypeEnum, isDefaultHealthMonitor = false): void {
    const healthMonitorName = isDefaultHealthMonitor
      ? healthMonitorId
      : ObjectUtil.getObjectName(healthMonitorId, this.availableHealthMonitors);

    const modalDto = new YesNoModalDto(
      'Remove Health Monitor',
      `Are you sure you would like to remove health monitor "${healthMonitorName}"?`,
      'Remove Health Monitor',
      'Cancel',
      'danger',
    );
    const onConfirm = () => {
      if (isDefaultHealthMonitor) {
        this.selectedDefaultHealthMonitors = this.selectedDefaultHealthMonitors.filter(h => h !== healthMonitorId);
        this.poolService
          .updateOneLoadBalancerPool({
            id: this.poolId,
            loadBalancerPool: {
              defaultHealthMonitors: this.selectedDefaultHealthMonitors,
            } as LoadBalancerPool,
          })
          .subscribe(() => {
            this.loadPoolResources();
          });
      } else {
        this.poolService
          .removeHealthMonitorFromPoolLoadBalancerPool({
            poolId: this.poolId,
            healthMonitorId,
          })
          .subscribe(() => {
            this.loadPoolResources();
          });
      }
    };
    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm);
  }

  public removeNode(nodeToPool: NodeToPool): void {
    const modalDto = new YesNoModalDto(
      'Remove Node',
      `Are you sure you would like to remove node "${nodeToPool.loadBalancerNode.name}"?`,
      'Remove Node',
      'Cancel',
      'danger',
    );
    const onConfirm = () => {
      this.poolService
        .removeNodeFromPoolLoadBalancerPool({
          poolId: this.poolId,
          nodeId: nodeToPool.loadBalancerNode.id,
          servicePort: nodeToPool.servicePort,
        })
        .subscribe(() => {
          this.loadPoolResources();
        });
    };
    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm);
  }

  public getData(): void {
    const dto: PoolModalDto = Object.assign({}, this.ngx.getModalData('poolModal')) as any;
    const { pool, tierId } = dto;
    this.tierId = tierId;
    this.modalMode = pool ? ModalMode.Edit : ModalMode.Create;

    if (this.modalMode === ModalMode.Edit) {
      const { loadBalancingMethod, name, healthMonitors, defaultHealthMonitors, nodes, id } = pool;
      this.poolId = id;

      this.form.controls.name.disable();

      this.form.controls.loadBalancingMethod.setValue(loadBalancingMethod);
      this.form.controls.name.setValue(name);
      this.selectedHealthMonitors = healthMonitors || [];
      this.selectedDefaultHealthMonitors = defaultHealthMonitors || [];
      this.selectedNodes = nodes || [];
    } else {
      this.form.controls.name.enable();
    }

    this.loadAvailableResources();
    this.loadPoolResources();
    this.ngx.resetModalData('poolModal');
  }

  private isDefaultHealthMonitor(type: LoadBalancerPoolDefaultHealthMonitorsEnum): type is LoadBalancerPoolDefaultHealthMonitorsEnum {
    return this.defaultHealthMonitors.includes(type);
  }

  private buildForm(): void {
    const requiredWhenAddingNode = () => this.modalMode === ModalMode.Edit && !!this.form.get('selectedNode').value;

    this.form = this.formBuilder.group({
      name: ['', NameValidator()],
      loadBalancingMethod: ['', Validators.required],
      selectedHealthMonitor: [''],
      selectedNode: [''],
      servicePort: ['', Validators.compose([ValidatorUtil.optionallyRequired(requiredWhenAddingNode), RangeValidator(1, 65535)])],
      ratio: ['', Validators.compose([ValidatorUtil.optionallyRequired(requiredWhenAddingNode), RangeValidator(1, 100)])],
    });
  }

  private createPool(loadBalancerPool: LoadBalancerPool): void {
    this.poolService.createOneLoadBalancerPool({ loadBalancerPool }).subscribe(() => this.closeModal());
  }

  private updatePool(loadBalancerPool: LoadBalancerPool): void {
    delete loadBalancerPool.tierId;
    this.poolService
      .updateOneLoadBalancerPool({
        id: this.poolId,
        loadBalancerPool,
      })
      .subscribe(() => this.closeModal());
  }

  private loadPoolResources(): void {
    if (!this.poolId) {
      return;
    }
    this.poolService.getPoolLoadBalancerPool({ id: this.poolId }).subscribe((pools: LoadBalancerPool[]) => {
      const [pool] = pools;
      this.selectedHealthMonitors = pool.healthMonitors;
      this.selectedNodes = pool.nodes;
    });
  }

  private loadAvailableResources(): void {
    this.tiersService
      .getOneTier({
        id: this.tierId,
        join: ['loadBalancerNodes,loadBalancerHealthMonitors'],
      })
      .subscribe((tier: Tier) => {
        this.availableNodes = tier.loadBalancerNodes;
        this.availableHealthMonitors = tier.loadBalancerHealthMonitors;
      });
  }
}

interface NodeToPool {
  loadBalancerNode: { id: string; name: string };
  servicePort: number;
}
