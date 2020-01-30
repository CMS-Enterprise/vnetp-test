import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { Subscription, Observable } from 'rxjs';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { VirtualServerModalDto } from 'src/app/models/loadbalancer/virtual-server-modal-dto';
import { PoolModalDto } from 'src/app/models/loadbalancer/pool-modal-dto';
import { PendingChangesGuard } from 'src/app/guards/pending-changes.guard';
import { LoadBalancersHelpText } from 'src/app/helptext/help-text-networking';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import {
  Tier,
  V1TiersService,
  LoadBalancerPool,
  LoadBalancerIrule,
  LoadBalancerHealthMonitor,
  LoadBalancerVirtualServer,
  V1LoadBalancerIrulesService,
  V1LoadBalancerVirtualServersService,
  V1LoadBalancerPoolsService,
  V1LoadBalancerHealthMonitorsService,
  LoadBalancerNode,
  V1LoadBalancerNodesService,
} from 'api_client';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { NodeModalDto } from 'src/app/models/loadbalancer/node-modal-dto';

@Component({
  selector: 'app-load-balancers',
  templateUrl: './load-balancers.component.html',
})
export class LoadBalancersComponent
  implements OnInit, OnDestroy, PendingChangesGuard {
  navIndex = 0;

  tiers: Tier[];
  currentTier: Tier;

  currentIrulePage = 1;
  currentVSPage = 1;
  currentNodePage = 1;
  currentPoolPage = 1;
  currentHMPage = 1;

  perPage = 20;

  virtualServers: LoadBalancerVirtualServer[];
  pools: LoadBalancerPool[];
  nodes: LoadBalancerNode[];
  irules: LoadBalancerIrule[];
  healthMonitors: LoadBalancerHealthMonitor[];

  editVirtualServerIndex: number;
  editPoolIndex: number;
  editNodeIndex: number;
  editIRuleIndex: number;
  editHealthMonitorIndex: number;

  virtualServerModalMode: ModalMode;
  iruleModalMode: ModalMode;
  healthMonitorModalMode: ModalMode;

  virtualServerModalSubscription: Subscription;
  poolModalSubscription: Subscription;
  nodeModalSubscription: Subscription;
  iruleModalSubscription: Subscription;
  healthMonitorModalSubscription: Subscription;

  currentDatacenterSubscription: Subscription;

  @HostListener('window:beforeunload')
  @HostListener('window:popstate')
  canDeactivate(): Observable<boolean> | boolean {
    return !this.datacenterService.datacenterLockValue;
  }

  constructor(
    private ngx: NgxSmartModalService,
    public datacenterService: DatacenterContextService,
    private tierService: V1TiersService,
    private irulesService: V1LoadBalancerIrulesService,
    private virtualServersService: V1LoadBalancerVirtualServersService,
    private poolsService: V1LoadBalancerPoolsService,
    private nodeService: V1LoadBalancerNodesService,
    private healthMonitorsService: V1LoadBalancerHealthMonitorsService,
    public helpText: LoadBalancersHelpText,
  ) {}

  getVirtualServers() {
    this.virtualServersService
      .v1LoadBalancerVirtualServersGet({
        join: 'irules',
        filter: `tierId||eq||${this.currentTier.id}`,
      })
      .subscribe(data => {
        this.virtualServers = data;
      });
  }

  getPools(getVirtualServers = false) {
    this.poolsService
      .v1LoadBalancerPoolsGet({
        join: 'nodes,healthMonitors',
        filter: `tierId||eq||${this.currentTier.id}`,
      })
      .subscribe(data => {
        this.pools = data;

        if (getVirtualServers) {
          this.getVirtualServers();
        }
      });
  }

  getNodes() {
    this.tierService
      .v1TiersIdGet({
        id: this.currentTier.id,
        join: 'loadBalancerNodes',
      })
      .subscribe(data => {
        this.nodes = data.loadBalancerNodes;
      });
  }

  getIrules() {
    this.tierService
      .v1TiersIdGet({
        id: this.currentTier.id,
        join: 'loadBalancerIrules',
      })
      .subscribe(data => (this.irules = data.loadBalancerIrules));
  }

  getHealthMonitors() {
    this.tierService
      .v1TiersIdGet({
        id: this.currentTier.id,
        join: 'loadBalancerHealthMonitors',
      })
      .subscribe(data => {
        this.healthMonitors = data.loadBalancerHealthMonitors;
      });
  }

  getObjectsForNavIndex() {
    if (this.navIndex === 0) {
      this.getPools(true);
      this.getIrules();
    } else if (this.navIndex === 1) {
      this.getPools();
      this.getHealthMonitors();
      this.getNodes();
    } else if (this.navIndex === 2) {
      this.getNodes();
    } else if (this.navIndex === 3) {
      this.getIrules();
    } else if (this.navIndex === 4) {
      this.getHealthMonitors();
    }
  }

  getPoolName = (poolId: string) => {
    return this.pools.find(p => p.id === poolId).name || 'Error Resolving Name';
    // tslint:disable-next-line: semicolon
  };

  openVirtualServerModal(
    modalMode: ModalMode,
    virtualServer?: LoadBalancerVirtualServer,
  ) {
    const dto = new VirtualServerModalDto();
    dto.TierId = this.currentTier.id;
    dto.Pools = this.pools;
    dto.VirtualServer = virtualServer;
    dto.IRules = this.irules;
    dto.ModalMode = modalMode;

    if (modalMode === ModalMode.Edit && !virtualServer) {
      this.editVirtualServerIndex = this.virtualServers.indexOf(virtualServer);
    }

    this.subscribeToVirtualServerModal();
    this.datacenterService.lockDatacenter();
    this.ngx.setModalData(dto, 'virtualServerModal');
    this.ngx.getModal('virtualServerModal').open();
  }

  openPoolModal(modalMode: ModalMode, pool?: LoadBalancerPool) {
    if (modalMode === ModalMode.Edit && !pool) {
      throw new Error('Pool required.');
    }
    const dto = new PoolModalDto();
    dto.pool = pool;
    dto.healthMonitors = this.healthMonitors;
    dto.nodes = this.nodes;
    dto.ModalMode = modalMode;
    dto.TierId = this.currentTier.id;

    if (modalMode === ModalMode.Edit) {
      this.editPoolIndex = this.pools.indexOf(pool);
    }

    this.subscribeToPoolModal();
    this.datacenterService.lockDatacenter();
    this.ngx.setModalData(dto, 'poolModal');
    this.ngx.getModal('poolModal').open();
  }

  openNodeModal(modalMode: ModalMode, node?: LoadBalancerNode) {
    if (modalMode === ModalMode.Edit && !node) {
      throw new Error('Node required.');
    }
    const dto = new NodeModalDto();
    dto.node = node;
    dto.ModalMode = modalMode;
    dto.TierId = this.currentTier.id;

    if (modalMode === ModalMode.Edit) {
      this.editNodeIndex = this.nodes.indexOf(node);
    }

    this.subscribeToNodeModal();
    this.datacenterService.lockDatacenter();
    this.ngx.setModalData(dto, 'nodeModal');
    this.ngx.getModal('nodeModal').open();
  }

  openIRuleModal(modalMode: ModalMode, irule?: LoadBalancerIrule) {
    if (modalMode === ModalMode.Edit && !irule) {
      throw new Error('IRule required.');
    }

    const dto = {} as any;
    dto.irule = irule;
    dto.ModalMode = modalMode;
    dto.TierId = this.currentTier.id;

    if (modalMode === ModalMode.Edit) {
      this.editIRuleIndex = this.irules.indexOf(irule);
    }
    this.subscribeToIRuleModal();
    this.datacenterService.lockDatacenter();
    this.ngx.setModalData(dto, 'iruleModal');
    this.ngx.getModal('iruleModal').open();
  }

  openHealthMonitorModal(
    modalMode: ModalMode,
    healthMonitor?: LoadBalancerHealthMonitor,
  ) {
    if (modalMode === ModalMode.Edit && !healthMonitor) {
      throw new Error('Health Monitor required.');
    }

    const dto = {} as any;
    dto.healthMonitor = healthMonitor;
    dto.ModalMode = modalMode;
    dto.TierId = this.currentTier.id;

    if (modalMode === ModalMode.Edit) {
      this.editHealthMonitorIndex = this.healthMonitors.indexOf(healthMonitor);
    }
    this.subscribeToHealthMonitorModal();
    this.datacenterService.lockDatacenter();
    this.ngx.setModalData(dto, 'healthMonitorModal');
    this.ngx.getModal('healthMonitorModal').open();
  }

  subscribeToVirtualServerModal() {
    this.virtualServerModalSubscription = this.ngx
      .getModal('virtualServerModal')
      .onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
        this.getVirtualServers();
        this.ngx.resetModalData('virtualServerModal');
        this.virtualServerModalSubscription.unsubscribe();
        this.datacenterService.unlockDatacenter();
      });
  }

  subscribeToPoolModal() {
    this.poolModalSubscription = this.ngx
      .getModal('poolModal')
      .onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
        this.getPools();
        this.getHealthMonitors();
        this.getNodes();
        this.ngx.resetModalData('poolModal');
        this.poolModalSubscription.unsubscribe();
        this.datacenterService.unlockDatacenter();
      });
  }

  subscribeToNodeModal() {
    this.nodeModalSubscription = this.ngx
      .getModal('nodeModal')
      .onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
        this.getNodes();
        this.ngx.resetModalData('nodeModal');
        this.nodeModalSubscription.unsubscribe();
        this.datacenterService.unlockDatacenter();
      });
  }

  subscribeToIRuleModal() {
    this.iruleModalSubscription = this.ngx
      .getModal('iruleModal')
      .onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
        this.getIrules();
        this.ngx.resetModalData('iruleModal');
        this.iruleModalSubscription.unsubscribe();
        this.datacenterService.unlockDatacenter();
      });
  }

  subscribeToHealthMonitorModal() {
    this.healthMonitorModalSubscription = this.ngx
      .getModal('healthMonitorModal')
      .onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
        this.getHealthMonitors();
        this.ngx.resetModalData('healthMonitorModal');
        this.healthMonitorModalSubscription.unsubscribe();
        this.datacenterService.unlockDatacenter();
      });
  }

  deleteVirtualServer(virtualServer: LoadBalancerVirtualServer) {
    if (virtualServer.provisionedAt) {
      throw new Error('Cannot delete provisioned object.');
    }
    const deleteDescription = virtualServer.deletedAt
      ? 'Delete'
      : 'Soft-Delete';

    const deleteFunction = () => {
      if (!virtualServer.deletedAt) {
        this.virtualServersService
          .v1LoadBalancerVirtualServersIdSoftDelete({ id: virtualServer.id })
          .subscribe(data => {
            this.getVirtualServers();
          });
      } else {
        this.virtualServersService
          .v1LoadBalancerVirtualServersIdDelete({ id: virtualServer.id })
          .subscribe(data => {
            this.getVirtualServers();
          });
      }
    };

    this.confirmDeleteObject(
      new YesNoModalDto(
        `${deleteDescription} Virtual Server?`,
        `Do you want to ${deleteDescription} virtual server "${virtualServer.name}"?`,
      ),
      deleteFunction,
    );
  }

  deleteIrule(irule: LoadBalancerIrule) {
    if (irule.provisionedAt) {
      throw new Error('Cannot delete provisioned object.');
    }
    const deleteDescription = irule.deletedAt ? 'Delete' : 'Soft-Delete';

    const deleteFunction = () => {
      if (!irule.deletedAt) {
        this.irulesService
          .v1LoadBalancerIrulesIdSoftDelete({ id: irule.id })
          .subscribe(data => {
            this.getIrules();
          });
      } else {
        this.irulesService
          .v1LoadBalancerIrulesIdDelete({ id: irule.id })
          .subscribe(data => {
            this.getIrules();
          });
      }
    };

    this.confirmDeleteObject(
      new YesNoModalDto(
        `${deleteDescription} Irule?`,
        `Do you want to ${deleteDescription} irule "${irule.name}"?`,
      ),
      deleteFunction,
    );
  }

  deleteHealthMonitor(healthMonitor: LoadBalancerHealthMonitor) {
    if (healthMonitor.provisionedAt) {
      throw new Error('Cannot delete provisioned object.');
    }
    const deleteDescription = healthMonitor.deletedAt
      ? 'Delete'
      : 'Soft-Delete';

    const deleteFunction = () => {
      if (!healthMonitor.deletedAt) {
        this.healthMonitorsService
          .v1LoadBalancerHealthMonitorsIdSoftDelete({ id: healthMonitor.id })
          .subscribe(data => {
            this.getHealthMonitors();
          });
      } else {
        this.healthMonitorsService
          .v1LoadBalancerHealthMonitorsIdDelete({ id: healthMonitor.id })
          .subscribe(data => {
            this.getHealthMonitors();
          });
      }
    };

    this.confirmDeleteObject(
      new YesNoModalDto(
        `${deleteDescription} Health Monitor?`,
        `Do you want to ${deleteDescription} health monitor "${healthMonitor.name}"?`,
      ),
      deleteFunction,
    );
  }

  deletePool(pool: LoadBalancerPool) {
    if (pool.provisionedAt) {
      throw new Error('Cannot delete provisioned object.');
    }
    const deleteDescription = pool.deletedAt ? 'Delete' : 'Soft-Delete';

    const deleteFunction = () => {
      if (!pool.deletedAt) {
        this.poolsService
          .v1LoadBalancerPoolsIdSoftDelete({ id: pool.id })
          .subscribe(data => {
            this.getPools();
          });
      } else {
        this.poolsService
          .v1LoadBalancerPoolsIdDelete({ id: pool.id })
          .subscribe(data => {
            this.getPools();
          });
      }
    };

    this.confirmDeleteObject(
      new YesNoModalDto(
        `${deleteDescription} Pool?`,
        `Do you want to ${deleteDescription} pool "${pool.name}"?`,
      ),
      deleteFunction,
    );
  }

  deleteNode(node: LoadBalancerNode) {
    if (node.provisionedAt) {
      throw new Error('Cannot delete provisioned object.');
    }
    const deleteDescription = node.deletedAt ? 'Delete' : 'Soft-Delete';

    const deleteFunction = () => {
      if (!node.deletedAt) {
        this.nodeService
          .v1LoadBalancerNodesIdSoftDelete({ id: node.id })
          .subscribe(data => {
            this.getNodes();
          });
      } else {
        this.nodeService
          .v1LoadBalancerNodesIdDelete({ id: node.id })
          .subscribe(data => {
            this.getNodes();
          });
      }
    };

    this.confirmDeleteObject(
      new YesNoModalDto(
        `${deleteDescription} Node?`,
        `Do you want to ${deleteDescription} node "${node.name}"?`,
      ),
      deleteFunction,
    );
  }

  restoreVirtualServer(virtualServer: LoadBalancerVirtualServer) {
    if (virtualServer.deletedAt) {
      this.virtualServersService
        .v1LoadBalancerVirtualServersIdRestorePatch({ id: virtualServer.id })
        .subscribe(data => this.getVirtualServers());
    }
  }

  restorePool(pool: LoadBalancerPool) {
    if (pool.deletedAt) {
      this.poolsService
        .v1LoadBalancerPoolsIdRestorePatch({ id: pool.id })
        .subscribe(data => this.getPools());
    }
  }

  restoreNode(node: LoadBalancerNode) {
    if (node.deletedAt) {
      this.nodeService
        .v1LoadBalancerNodesIdRestorePatch({ id: node.id })
        .subscribe(data => this.getNodes());
    }
  }

  restoreIrules(irule: LoadBalancerIrule) {
    if (irule.deletedAt) {
      this.irulesService
        .v1LoadBalancerIrulesIdRestorePatch({ id: irule.id })
        .subscribe(data => this.getIrules());
    }
  }

  restoreHealthMonitor(healthMonitor: LoadBalancerHealthMonitor) {
    if (healthMonitor.deletedAt) {
      this.healthMonitorsService
        .v1LoadBalancerHealthMonitorsIdRestorePatch({ id: healthMonitor.id })
        .subscribe(data => this.getHealthMonitors());
    }
  }

  importLoadBalancerConfig(importObject) {
    //   // TODO: Import Validation.
    //   // TODO: Validate VRF Id and display warning with confirmation if not present or mismatch current vrf.
    //   this.virtualServers = importObject.VirtualServers;
    //   this.pools = importObject.Pools;
    //   this.irules = importObject.IRules;
    //   this.healthMonitors = importObject.HealthMonitors;
    //   this.dirty = true;
  }

  exportLoadBalancerConfig() {
    //   const dto = new LoadBalancerDto();
    //   dto.VirtualServers = this.virtualServers;
    //   dto.Pools = this.pools;
    //   dto.IRules = this.irules;
    //   dto.HealthMonitors = this.healthMonitors;
    //   dto.VrfId = this.currentTier.id;
    //   return dto;
  }

  private confirmDeleteObject(
    modalDto: YesNoModalDto,
    deleteFunction: () => void,
  ) {
    this.ngx.setModalData(modalDto, 'yesNoModal');
    this.ngx.getModal('yesNoModal').open();
    const yesNoModalSubscription = this.ngx
      .getModal('yesNoModal')
      .onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
        const data = modal.getData() as YesNoModalDto;
        modal.removeData();
        if (data && data.modalYes) {
          deleteFunction();
        }
        yesNoModalSubscription.unsubscribe();
      });
  }

  private unsubAll() {
    [this.virtualServerModalSubscription, this.poolModalSubscription].forEach(
      sub => {
        try {
          if (sub) {
            sub.unsubscribe();
          }
        } catch (e) {
          console.error(e);
        }
      },
    );
  }

  ngOnInit() {
    this.currentDatacenterSubscription = this.datacenterService.currentDatacenter.subscribe(
      cd => {
        if (cd) {
          this.tiers = cd.tiers;
          this.currentTier = cd.tiers[0];
          this.getObjectsForNavIndex();
        }
      },
    );
  }

  ngOnDestroy() {
    this.unsubAll();
  }
}
