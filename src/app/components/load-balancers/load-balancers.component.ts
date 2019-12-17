import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { Subscription, Observable } from 'rxjs';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { HelpersService } from 'src/app/services/helpers.service';
import { LoadBalancerDto } from 'src/app/models/loadbalancer/load-balancer-dto';
import { VirtualServerModalDto } from 'src/app/models/loadbalancer/virtual-server-modal-dto';
import { PoolModalDto } from 'src/app/models/loadbalancer/pool-modal-dto';
import { ToastrService } from 'ngx-toastr';
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
} from 'api_client';

@Component({
  selector: 'app-load-balancers',
  templateUrl: './load-balancers.component.html',
})
export class LoadBalancersComponent
  implements OnInit, OnDestroy, PendingChangesGuard {
  navIndex = 0;

  vrfs: Tier[];
  currentVrf: Tier;

  virtualServers: LoadBalancerVirtualServer[];
  pools: LoadBalancerPool[];
  irules: LoadBalancerIrule[];
  healthMonitors: LoadBalancerHealthMonitor[];

  deletedVirtualServers: LoadBalancerVirtualServer[];
  deletedPools: LoadBalancerPool[];
  deletedIRules: LoadBalancerIrule[];
  deletedHealthMonitors: LoadBalancerHealthMonitor[];

  editVirtualServerIndex: number;
  editPoolIndex: number;
  editIRuleIndex: number;
  editHealthMonitorIndex: number;

  virtualServerModalMode: ModalMode;
  poolModalMode: ModalMode;
  iruleModalMode: ModalMode;
  healthMonitorModalMode: ModalMode;

  // we shouldn't need any 'dirty' if we are saving on modals
  dirty: boolean;

  virtualServerModalSubscription: Subscription;
  poolModalSubscription: Subscription;
  iruleModalSubscription: Subscription;
  healthMonitorModalSubscription: Subscription;

  currentDatacenterSubscription: Subscription;

  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    return !this.dirty;
  }

  constructor(
    private ngx: NgxSmartModalService,
    private api: AutomationApiService,
    private datacenterService: DatacenterContextService,
    private tierService: V1TiersService,
    private hs: HelpersService,
    private toastr: ToastrService,
    public helpText: LoadBalancersHelpText,
  ) {}

  getVrfs() {
    this.tierService
      .v1TiersIdGet({
        id: '42284ed9-cfb2-4665-a156-89e403677562',
        join:
          'loadBalancerPools,loadBalancerVirtualServers,loadBalancerNodes,loadBalancerHealthMonitors,loadBalancerIrules',
      })
      .subscribe(data => {
        console.log(data);
        this.virtualServers = data.loadBalancerVirtualServers;
        this.pools = data.loadBalancerPools;
        this.irules = data.loadBalancerIrules;
        this.healthMonitors = data.loadBalancerHealthMonitors;
      });
  }

  openVirtualServerModal(
    modalMode: ModalMode,
    virtualServer?: LoadBalancerVirtualServer,
  ) {
    this.subscribeToVirtualServerModal();
    const dto = new VirtualServerModalDto();
    dto.Pools = this.pools;
    dto.VirtualServer = virtualServer;
    dto.IRules = this.irules;
    this.ngx.setModalData(this.hs.deepCopy(dto), 'virtualServerModal');

    if (modalMode === ModalMode.Edit && !virtualServer) {
      this.virtualServerModalMode = ModalMode.Edit;
      this.editVirtualServerIndex = this.virtualServers.indexOf(virtualServer);
    } else {
      this.virtualServerModalMode = ModalMode.Create;
    }

    this.ngx.getModal('virtualServerModal').open();
  }

  openPoolModal(modalMode: ModalMode, pool?: LoadBalancerPool) {
    if (modalMode === ModalMode.Edit && !pool) {
      throw new Error('Pool required.');
    }
    this.subscribeToPoolModal();
    const dto = new PoolModalDto();
    // dto.pool = pool;
    dto.healthMonitors = this.healthMonitors;

    this.ngx.setModalData(this.hs.deepCopy(dto), 'poolModal');

    if (modalMode === ModalMode.Edit) {
      this.poolModalMode = ModalMode.Edit;
      this.editPoolIndex = this.pools.indexOf(pool);
    } else {
      this.poolModalMode = ModalMode.Create;
    }

    this.ngx.getModal('poolModal').open();
  }

  openIRuleModal(modalMode: ModalMode, irule?: LoadBalancerIrule) {
    if (modalMode === ModalMode.Edit && !irule) {
      throw new Error('IRule required.');
    }
    this.subscribeToIRuleModal();
    if (modalMode === ModalMode.Edit) {
      this.iruleModalMode = ModalMode.Edit;
      this.ngx.setModalData(this.hs.deepCopy(irule), 'iruleModal');
      this.editIRuleIndex = this.irules.indexOf(irule);
    } else {
      this.iruleModalMode = ModalMode.Create;
    }
    this.datacenterService.lockDatacenter();
    this.ngx.getModal('iruleModal').open();
  }

  openHealthMonitorModal(
    modalMode: ModalMode,
    healthMonitor?: LoadBalancerHealthMonitor,
  ) {
    if (modalMode === ModalMode.Edit && !healthMonitor) {
      throw new Error('Health Monitor required.');
    }
    this.subscribeToHealthMonitorModal();
    if (modalMode === ModalMode.Edit) {
      this.healthMonitorModalMode = ModalMode.Edit;
      this.ngx.setModalData(
        this.hs.deepCopy(healthMonitor),
        'healthMonitorModal',
      );
      this.editHealthMonitorIndex = this.healthMonitors.indexOf(healthMonitor);
    } else {
      this.healthMonitorModalMode = ModalMode.Create;
    }
    this.datacenterService.lockDatacenter();
    this.ngx.getModal('healthMonitorModal').open();
  }

  subscribeToVirtualServerModal() {
    this.virtualServerModalSubscription = this.ngx
      .getModal('virtualServerModal')
      .onAnyCloseEvent.subscribe((modal: NgxSmartModalComponent) => {
        const data = modal.getData();

        if (data && data.VirtualServer !== undefined) {
          this.saveVirtualServer(data.VirtualServer);
        }
        this.ngx.resetModalData('virtualServerModal');
        this.virtualServerModalSubscription.unsubscribe();
      });
  }

  subscribeToPoolModal() {
    this.poolModalSubscription = this.ngx
      .getModal('poolModal')
      .onAnyCloseEvent.subscribe((modal: NgxSmartModalComponent) => {
        const data = modal.getData();

        if (data && data.Pool !== undefined) {
          this.savePool(data.Pool);
        }
        this.ngx.resetModalData('poolModal');
        this.poolModalSubscription.unsubscribe();
      });
  }

  subscribeToIRuleModal() {
    this.iruleModalSubscription = this.ngx
      .getModal('iruleModal')
      .onAnyCloseEvent.subscribe((modal: NgxSmartModalComponent) => {
        const data = modal.getData() as LoadBalancerIrule;

        if (data && data !== undefined) {
          this.saveIRule(data);
        }
        this.ngx.resetModalData('iruleModal');
        this.iruleModalSubscription.unsubscribe();
      });
  }

  subscribeToHealthMonitorModal() {
    this.healthMonitorModalSubscription = this.ngx
      .getModal('healthMonitorModal')
      .onAnyCloseEvent.subscribe((modal: NgxSmartModalComponent) => {
        const data = modal.getData() as LoadBalancerHealthMonitor;

        if (data && data !== undefined) {
          this.saveHealthMonitor(data);
        }
        this.ngx.resetModalData('healthMonitorModal');
        this.healthMonitorModalSubscription.unsubscribe();
      });
  }

  saveVirtualServer(virtualServer: LoadBalancerVirtualServer) {
    if (this.virtualServerModalMode === ModalMode.Create) {
      this.virtualServers.push(virtualServer);
    } else {
      this.virtualServers[this.editVirtualServerIndex] = virtualServer;
    }
    this.dirty = true;
  }

  deleteVirtualServer(virtualServer: LoadBalancerVirtualServer) {
    const index = this.virtualServers.indexOf(virtualServer);
    if (index > -1) {
      this.virtualServers.splice(index, 1);

      if (!this.deletedVirtualServers) {
        // this.deletedVirtualServers = new Array<VirtualServer>();
      }
      this.deletedVirtualServers.push(virtualServer);
      this.dirty = true;
    }
  }

  savePool(pool: LoadBalancerPool) {
    if (this.poolModalMode === ModalMode.Create) {
      this.pools.push(pool);
    } else {
      this.pools[this.editPoolIndex] = pool;
    }
    this.dirty = true;
  }

  saveHealthMonitor(healthMonitor: LoadBalancerHealthMonitor) {
    if (this.healthMonitorModalMode === ModalMode.Create) {
      this.healthMonitors.push(healthMonitor);
    } else {
      this.healthMonitors[this.editHealthMonitorIndex] = healthMonitor;
    }
    // this.dirty = true;
  }

  saveIRule(irule: LoadBalancerIrule) {
    if (this.iruleModalMode === ModalMode.Create) {
      this.irules.push(irule);
    } else {
      this.irules[this.editIRuleIndex] = irule;
    }
    this.dirty = true;
  }

  // deletePool(pool: LoadBalancerPool) {
  //   for (const vs of this.virtualServers) {
  //     if (vs.Pool === pool.Name) {
  //       this.toastr.error(`Pool in use! Virtual Server: ${vs.Name}`);
  //       console.log('Pool in use!'); // TODO: Toastr
  //       return;
  //     }
  //   }

  //   const index = this.pools.indexOf(pool);
  //   if (index > -1) {
  //     this.pools.splice(index, 1);

  //     if (!this.deletedPools) {
  //       this.deletedPools = new Array<Pool>();
  //     }
  //     this.deletedPools.push(pool);

  //     this.dirty = true;
  //   }
  // }

  // deleteIRule(irule: LoadBalancerIrule) {
  //   for (const vs of this.virtualServers) {
  //     if (vs.IRules.includes(irule.Name)) {
  //       this.toastr.error(`iRule in use! Virtual Server: ${vs.Name}`);
  //       console.log('iRule in use!'); // TODO: Toastr
  //       return;
  //     }
  //   }

  //   const index = this.irules.indexOf(irule);
  //   if (index > -1) {
  //     this.irules.splice(index, 1);

  //     if (!this.deletedIRules) {
  //       this.deletedIRules = new Array<IRule>();
  //     }
  //     this.deletedIRules.push(irule);

  //     this.dirty = true;
  //   }
  // }

  // deleteHealthMonitor(healthMonitor: LoadBalancerHealthMonitor) {
  //   for (const p of this.pools) {
  //     if (p.HealthMonitors.includes(healthMonitor.name)) {
  //       this.toastr.error(`Health Monitor in use! Pool: ${p.Name}`);
  //       console.log('Health Monitor in use!'); // TODO: Toastr
  //       return;
  //     }
  //   }

  //   const index = this.healthMonitors.indexOf(healthMonitor);
  //   if (index > -1) {
  //     this.healthMonitors.splice(index, 1);

  //     if (!this.deletedHealthMonitors) {
  //       this.deletedHealthMonitors = new Array<HealthMonitor>();
  //     }
  //     this.deletedHealthMonitors.push(healthMonitor);

  //     this.dirty = true;
  //   }
  // }

  importLoadBalancerConfig(importObject) {
    // TODO: Import Validation.
    // TODO: Validate VRF Id and display warning with confirmation if not present or mismatch current vrf.
    this.virtualServers = importObject.VirtualServers;
    this.pools = importObject.Pools;
    this.irules = importObject.IRules;
    this.healthMonitors = importObject.HealthMonitors;

    this.dirty = true;
  }

  exportLoadBalancerConfig() {
    const dto = new LoadBalancerDto();

    dto.VirtualServers = this.virtualServers;
    dto.Pools = this.pools;
    dto.IRules = this.irules;
    dto.HealthMonitors = this.healthMonitors;
    dto.VrfId = this.currentVrf.id;

    return dto;
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
    this.getVrfs();
    // this.currentDatacenterSubscription = this.datacenterService.currentDatacenter.subscribe(
    //   cd => {
    //     if (cd) {
    //       this.vrfs = cd.tiers;
    //       this.currentVrf = cd.tiers[0];
    //       this.getVrfs();
    //     }
    //   },
    // );
  }

  ngOnDestroy() {
    this.unsubAll();
  }
}
