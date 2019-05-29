import { Component, OnInit } from '@angular/core';
import { Vrf } from 'src/app/models/d42/vrf';
import { ModalMode } from 'src/app/models/modal-mode';
import { Subscription } from 'rxjs';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { Papa } from 'ngx-papaparse';
import { HelpersService } from 'src/app/services/helpers.service';
import { VirtualServer } from 'src/app/models/loadbalancer/virtual-server';
import { LoadBalancerDto } from 'src/app/models/loadbalancer/load-balancer-dto';
import { Pool } from 'src/app/models/loadbalancer/pool';
import { VirtualServerModalDto } from 'src/app/models/virtual-server-modal-dto';
import { IRule } from 'src/app/models/loadbalancer/irule';
import { HealthMonitor } from 'src/app/models/loadbalancer/health-monitor';
import { PoolModalDto } from 'src/app/models/pool-modal-dto';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-load-balancers',
  templateUrl: './load-balancers.component.html',
  styleUrls: ['./load-balancers.component.css']
})
export class LoadBalancersComponent implements OnInit {
  navIndex = 0;

  vrfs: Vrf[];
  currentVrf: Vrf;

  virtualServers: Array<VirtualServer>;
  pools: Array<Pool>;
  irules: Array<IRule>;
  healthMonitors: Array<HealthMonitor>;

  deletedVirtualServers: Array<VirtualServer>;
  deletedPools: Array<Pool>;
  deletedIRules: Array<IRule>;
  deletedHealthMonitors: Array<HealthMonitor>;

  editVirtualServerIndex: number;
  editPoolIndex: number;
  editIRuleIndex: number;
  editHealthMonitorIndex: number;

  virtualServerModalMode: ModalMode;
  poolModalMode: ModalMode;
  iruleModalMode: ModalMode;
  healthMonitorModalMode: ModalMode;

  dirty: boolean;

  virtualServerModalSubscription: Subscription;
  poolModalSubscription: Subscription;
  iruleModalSubscription: Subscription;
  healthMonitorModalSubscription: Subscription;

  constructor(private ngx: NgxSmartModalService, private api: AutomationApiService, private papa: Papa, private hs: HelpersService,
              private toastr: ToastrService) {
    this.virtualServers = new Array<VirtualServer>();
    this.pools = new Array<Pool>();
  }

  getVrfs() {
    this.dirty = false;

    let vrfId: number = null;

    if (this.currentVrf) {
      vrfId = this.currentVrf.id;
    }

    this.api.getVrfs().subscribe(data => {
      this.vrfs = data;

      if (!vrfId) {
        this.currentVrf = this.vrfs[0];
      } else {
        this.currentVrf = this.vrfs.find(v => v.id === vrfId);

        if (!this.currentVrf) {
          this.currentVrf = this.vrfs[0];
        }
      }
      this.getVrfObjects(this.currentVrf);
    });
  }

  getVrfObjects(vrf: Vrf) {
      const loadBalancerDto = this.hs.getJsonCustomField(vrf, 'load_balancers') as LoadBalancerDto;

      if (!loadBalancerDto) {
        this.virtualServers = new Array<VirtualServer>();
        this.pools = new Array<Pool>();
        this.irules = new Array<IRule>();
        this.healthMonitors = new Array<HealthMonitor>();
       } else if (loadBalancerDto) {
        this.virtualServers = loadBalancerDto.VirtualServers;
        this.pools = loadBalancerDto.Pools;
        this.irules = loadBalancerDto.IRules;
        this.healthMonitors = loadBalancerDto.HealthMonitors;
    }
      this.deletedVirtualServers = new Array<VirtualServer>();
      this.deletedPools = new Array<Pool>();
      this.deletedIRules = new Array<IRule>();
      this.deletedHealthMonitors = new Array<HealthMonitor>();
  }

  createVirtualServer() {
    this.subscribeToVirtualServerModal();
    const dto = new VirtualServerModalDto();
    dto.Pools = this.pools;
    dto.IRules = this.irules;

    this.ngx.setModalData(this.hs.deepCopy(dto), 'virtualServerModal');
    this.virtualServerModalMode = ModalMode.Create;
    this.ngx.getModal('virtualServerModal').open();
  }

  createPool() {
    this.subscribeToPoolModal();
    const dto = new PoolModalDto();
    dto.HealthMonitors = this.healthMonitors;

    this.ngx.setModalData(this.hs.deepCopy(dto), 'poolModal');
    this.poolModalMode = ModalMode.Create;
    this.ngx.getModal('poolModal').open();
  }

  createIRule() {
    this.subscribeToIRuleModal();
    this.iruleModalMode = ModalMode.Create;
    this.ngx.getModal('iruleModal').open();
  }

  createHealthMonitor() {
    this.subscribeToHealthMonitorModal();
    this.healthMonitorModalMode = ModalMode.Create;
    this.ngx.getModal('healthMonitorModal').open();
  }

  editVirtualServer(virtualServer: VirtualServer) {
    this.subscribeToVirtualServerModal();
    this.virtualServerModalMode = ModalMode.Edit;

    const dto = new VirtualServerModalDto();
    dto.Pools = this.pools;
    dto.VirtualServer = virtualServer;
    dto.IRules = this.irules;

    this.ngx.setModalData(this.hs.deepCopy(dto), 'virtualServerModal');
    this.editVirtualServerIndex = this.virtualServers.indexOf(virtualServer);
    this.ngx.getModal('virtualServerModal').open();
  }

  editPool(pool: Pool) {
    this.subscribeToPoolModal() ;
    this.poolModalMode = ModalMode.Edit;

    const dto = new PoolModalDto();
    dto.Pool = pool;
    dto.HealthMonitors = this.healthMonitors;

    this.ngx.setModalData(this.hs.deepCopy(dto), 'poolModal');
    this.editPoolIndex = this.pools.indexOf(pool);
    this.ngx.getModal('poolModal').open();
  }

  editIRule(irule: IRule) {
    this.subscribeToIRuleModal();
    this.iruleModalMode = ModalMode.Edit;

    this.ngx.setModalData(this.hs.deepCopy(irule), 'iruleModal');
    this.editIRuleIndex = this.irules.indexOf(irule);
    this.ngx.getModal('iruleModal').open();
  }

  editHealthMonitor(healthMonitor: HealthMonitor) {
    this.subscribeToHealthMonitorModal();
    this.healthMonitorModalMode = ModalMode.Edit;
    this.ngx.setModalData(this.hs.deepCopy(healthMonitor), 'healthMonitorModal');
    this.editHealthMonitorIndex = this.healthMonitors.indexOf(healthMonitor);
    this.ngx.getModal('healthMonitorModal').open();
  }

  subscribeToVirtualServerModal() {
    this.virtualServerModalSubscription =
    this.ngx.getModal('virtualServerModal').onAnyCloseEvent.subscribe((modal: NgxSmartModalComponent) => {
      let data = modal.getData() as VirtualServerModalDto;

      if (data && data.VirtualServer !== undefined) {
        this.saveVirtualServer(data.VirtualServer);
      }
      this.ngx.resetModalData('virtualServerModal');
      this.virtualServerModalSubscription.unsubscribe();
    });
  }

  subscribeToPoolModal() {
    this.poolModalSubscription =
    this.ngx.getModal('poolModal').onAnyCloseEvent.subscribe((modal: NgxSmartModalComponent) => {
      let data = modal.getData() as PoolModalDto;

      if (data && data.Pool !== undefined) {
        this.savePool(data.Pool);
      }
      this.ngx.resetModalData('poolModal');
      this.poolModalSubscription.unsubscribe();
    });
  }

  subscribeToIRuleModal() {
    this.iruleModalSubscription =
    this.ngx.getModal('iruleModal').onAnyCloseEvent.subscribe((modal: NgxSmartModalComponent) => {
      let data = modal.getData() as IRule;

      if (data && data !== undefined) {
        this.saveIRule(data);
      }
      this.ngx.resetModalData('iruleModal');
      this.iruleModalSubscription.unsubscribe();
    });
  }

  subscribeToHealthMonitorModal() {
    this.healthMonitorModalSubscription =
    this.ngx.getModal('healthMonitorModal').onAnyCloseEvent.subscribe((modal: NgxSmartModalComponent) => {
      let data = modal.getData() as HealthMonitor;

      if (data && data !== undefined) {
        this.saveHealthMonitor(data);
      }
      this.ngx.resetModalData('healthMonitorModal');
      this.healthMonitorModalSubscription.unsubscribe();
    });
  }

  saveVirtualServer(virtualServer: VirtualServer) {
    if (this.virtualServerModalMode === ModalMode.Create) {
      this.virtualServers.push(virtualServer);
    } else {
      this.virtualServers[this.editVirtualServerIndex] = virtualServer;
    }
    this.dirty = true;
  }

  deleteVirtualServer(virtualServer: VirtualServer) {
    const index = this.virtualServers.indexOf(virtualServer);
    if ( index > -1) {
      this.virtualServers.splice(index, 1);

      if (!this.deletedVirtualServers) { this.deletedVirtualServers = new Array<VirtualServer>(); }
      this.deletedVirtualServers.push(virtualServer);
      this.dirty = true;
    }
  }

  savePool(pool: Pool) {
    if (this.poolModalMode === ModalMode.Create) {
      this.pools.push(pool);
    } else {
      this.pools[this.editPoolIndex] = pool;
    }
    this.dirty = true;
  }

  saveHealthMonitor(healthMonitor: HealthMonitor) {
    if (this.healthMonitorModalMode === ModalMode.Create) {
      this.healthMonitors.push(healthMonitor);
    } else {
      this.healthMonitors[this.editHealthMonitorIndex] = healthMonitor;
    }
    this.dirty = true;
  }

  saveIRule(irule: IRule) {
    if (this.iruleModalMode === ModalMode.Create){
      this.irules.push(irule);
    } else {
      this.irules[this.editIRuleIndex] = irule;
    }
    this.dirty = true;
  }

  deletePool(pool: Pool) {
    for (const vs of this.virtualServers) {
      if (vs.Pool === pool.Name) {
        this.toastr.error(`Pool in use! Virtual Server: ${vs.Name}`);
        console.log('Pool in use!'); // TODO: Toastr
        return;
      }
    }

    const index = this.pools.indexOf(pool);
    if ( index > -1) {
      this.pools.splice(index, 1);

      if (!this.deletedPools) { this.deletedPools = new Array<Pool>(); }
      this.deletedPools.push(pool);

      this.dirty = true;
    }
  }

  deleteIRule(irule: IRule) {
    for (const vs of this.virtualServers) {
      if (vs.IRules.includes(irule.Name)) {
        this.toastr.error(`iRule in use! Virtual Server: ${vs.Name}`);
        console.log('iRule in use!'); // TODO: Toastr
        return;
      }
    }

    const index = this.irules.indexOf(irule);
    if (index > -1) {
      this.irules.splice(index, 1);

      if (!this.deletedIRules) { this.deletedIRules = new Array<IRule>(); }
      this.deletedIRules.push(irule);

      this.dirty = true;
    }
  }

  deleteHealthMonitor(healthMonitor: HealthMonitor) {
    for (const p of this.pools) {
      if (p.HealthMonitors.includes(healthMonitor.Name)) {
        this.toastr.error(`Health Monitor in use! Pool: ${p.Name}`);
        console.log('Health Monitor in use!'); // TODO: Toastr
        return;
      }
    }

    const index = this.healthMonitors.indexOf(healthMonitor);
    if (index > -1) {
      this.healthMonitors.splice(index, 1);

      if (!this.deletedHealthMonitors) { this.deletedHealthMonitors = new Array<HealthMonitor>(); }
      this.deletedHealthMonitors.push(healthMonitor);

      this.dirty = true;
    }
  }

  saveAll() {
    this.dirty = false;
    const dto = new LoadBalancerDto();

    dto.VirtualServers = this.virtualServers;
    dto.Pools = this.pools;
    dto.VrfId = this.currentVrf.id;
    dto.IRules = this.irules;
    dto.HealthMonitors = this.healthMonitors;

    let extra_vars: {[k: string]: any} = {};
    extra_vars.load_balancer_dto = dto;
    extra_vars.vrf_name = this.currentVrf.name.split('-')[1];
    extra_vars.vrf_id = this.currentVrf.id;
    extra_vars.deleted_virtual_servers = this.deletedVirtualServers;
    extra_vars.deleted_pools = this.deletedPools;
    extra_vars.deleted_irules = this.deletedIRules;
    extra_vars.deleted_healthmonitors = this.deletedHealthMonitors;

    const body = { extra_vars };

    this.api.launchTemplate('save-load-balancer-dto', body).subscribe(data => { },
      error => { this.dirty = true; });

    this.deletedVirtualServers = new Array<VirtualServer>();
    this.deletedPools = new Array<Pool>();
    this.deletedIRules = new Array<IRule>();
    this.deletedHealthMonitors = new Array<HealthMonitor>();
  }

  importLoadBalancerConfig(importObject) {
    // TODO: Import Validation.
    // TODO: Validate VRF Id and display warning with confirmation if not present or mismatch current vrf.
    this.virtualServers = importObject.VirtualServers;
    this.pools = importObject.Pools;
    this.irules = importObject.IRules;
    this.healthMonitors = importObject.HealthMonitors;

    this.dirty = true;
  }

  exportLoadBalancerConfig(){
    const dto = new LoadBalancerDto();

    dto.VirtualServers = this.virtualServers;
    dto.Pools = this.pools;
    dto.IRules = this.irules;
    dto.HealthMonitors = this.healthMonitors;
    dto.VrfId = this.currentVrf.id;

    return dto;
  }

  private unsubAll() {
    [this.virtualServerModalSubscription,
      this.poolModalSubscription]
      .forEach(sub => {
        try {
          if (sub) {
          sub.unsubscribe();
          }
        } catch (e) {
          console.error(e);
        }
      });
  }

  ngOnInit() {
    this.getVrfs();
  }

  ngOnDestroy() {
    this.unsubAll();
  }

}
