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
import { PoolMember } from 'src/app/models/loadbalancer/pool-member';
import { VirtualServerModalDto } from 'src/app/models/virtual-server-modal-dto';

@Component({
  selector: 'app-load-balancers',
  templateUrl: './load-balancers.component.html',
  styleUrls: ['./load-balancers.component.css']
})
export class LoadBalancersComponent implements OnInit {

  vrfs: Vrf[];
  currentVrf: Vrf;
  virtualServers: Array<VirtualServer>;
  pools: Array<Pool>;
  deletedVirtualServers: Array<VirtualServer>;
  deletedPools: Array<Pool>;
  navIndex = 0;

  editVirtualServerIndex: number;
  editPoolIndex: number;

  virtualServerModalMode: ModalMode;
  poolModalMode: ModalMode;
  dirty: boolean;

  virtualServerModalSubscription: Subscription;
  poolModalSubscription: Subscription;

  constructor(private ngx: NgxSmartModalService, private api: AutomationApiService, private papa: Papa, private hs: HelpersService) {
    this.virtualServers = new Array<VirtualServer>();
    this.pools = new Array<Pool>();
  }

  getVrfs() {
    this.dirty = false;
    this.api.getVrfs().subscribe(data => {
      this.vrfs = data;
      if (!this.currentVrf) {
        this.currentVrf = this.vrfs[0];
      }
      this.getVrfObjects(this.currentVrf);
    });
  }

  getVrfObjects(vrf: Vrf) {
      const loadBalancerDto = this.hs.getJsonCustomField(vrf, 'load_balancers') as LoadBalancerDto;

      if (!loadBalancerDto) {
        this.virtualServers = new Array<VirtualServer>();
        this.pools = new Array<Pool>();
       } else if (loadBalancerDto) {
        this.virtualServers = loadBalancerDto.VirtualServers;
        this.pools = loadBalancerDto.Pools;
    }
  }

  createVirtualServer() {
    this.subscribeToVirtualServerModal();
    const dto = new VirtualServerModalDto();
    dto.Pools = this.pools;

    this.ngx.setModalData(Object.assign({}, dto), 'virtualServerModal');
    this.virtualServerModalMode = ModalMode.Create;
    this.ngx.getModal('virtualServerModal').open();
  }

  createPool() {
    this.subscribeToPoolModal();
    this.poolModalMode = ModalMode.Create;
    this.ngx.getModal('poolModal').open();
  }

  editVirtualServer(virtualServer: VirtualServer) {
    this.subscribeToVirtualServerModal();
    this.virtualServerModalMode = ModalMode.Edit;

    const dto = new VirtualServerModalDto();
    dto.Pools = this.pools;
    dto.VirtualServer = virtualServer;

    this.ngx.setModalData(Object.assign({}, dto), 'virtualServerModal');
    this.editVirtualServerIndex = this.virtualServers.indexOf(virtualServer);
    this.ngx.getModal('virtualServerModal').open();
  }

  editPool(pool: Pool) {
    this.subscribeToPoolModal() ;
    this.poolModalMode = ModalMode.Edit;
    this.ngx.setModalData(Object.assign({}, pool), 'poolModal');
    this.editPoolIndex = this.pools.indexOf(pool);
    this.ngx.getModal('poolModal').open();
  }

  subscribeToVirtualServerModal() {
    this.virtualServerModalSubscription =
    this.ngx.getModal('virtualServerModal').onAnyCloseEvent.subscribe((modal: NgxSmartModalComponent) => {
      let data = modal.getData() as VirtualServerModalDto;

      if (data.VirtualServer !== undefined) {
        data = Object.assign({}, data);
        this.saveVirtualServer(data.VirtualServer);
      }
      this.ngx.resetModalData('virtualServerModal');
      this.virtualServerModalSubscription.unsubscribe();
    });
  }

  subscribeToPoolModal() {
    this.poolModalSubscription =
    this.ngx.getModal('poolModal').onAnyCloseEvent.subscribe((modal: NgxSmartModalComponent) => {
      let data = modal.getData() as Pool;

      if (data !== undefined) {
        data = Object.assign({}, data);
        this.savePool(data);
      }
      this.ngx.resetModalData('poolModal');
      this.poolModalSubscription.unsubscribe();
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

  deletePool(pool: Pool) {
    const index = this.pools.indexOf(pool);
    if ( index > -1) {
      this.pools.splice(index, 1);

      if (!this.deletedPools) { this.deletedPools = new Array<Pool>(); }
      this.deletedPools.push(pool);

      this.dirty = true;
    }
  }

  saveAll() {
    this.dirty = false;
    const dto = new LoadBalancerDto();

    dto.VirtualServers = this.virtualServers;
    dto.Pools = this.pools;
    dto.VrfId = this.currentVrf.id;

    let extra_vars: {[k: string]: any} = {};
    extra_vars.load_balancer_dto = dto;
    extra_vars.vrf_name = this.currentVrf.name.split('-')[1];
    extra_vars.deleted_virtual_servers = this.deletedVirtualServers;
    extra_vars.deleted_pools = this.deletedPools;

    const body = { extra_vars };

    this.api.launchTemplate('save-load-balancer-dto', body).subscribe(data => { },
      error => { this.dirty = true; });

    this.deletedVirtualServers = new Array<VirtualServer>();
    this.deletedPools = new Array<Pool>();
  }

  handleFileSelect(evt) {
    const files = evt.target.files; // FileList object
    const file = files[0];
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
      this.parseCsv(reader.result);
    };
  }

  private parseCsv(csv) {
    const options = {
      header: true,
      complete: (results) => {
        this.importObjects(results.data);
      }
    };
    this.papa.parse(csv, options);
  }

  importObjects(objects) {
    // Validate Uniqueness

    try {
    objects.forEach(object => {
      if (object.GroupName) {
        const pool = this.pools.find(g => g.Name === object.GroupName);
        if (pool != null) {
          pool.Members.push(object);
        } else {
          const newGroup = new Pool();
          newGroup.Name = object.GroupName;
          newGroup.Members = new Array<PoolMember>();
          this.pools.push(newGroup);
          this.dirty = true;
        }
       } else if (object.Name) {
         this.virtualServers.push(object as VirtualServer);
         this.dirty = true;
       }
    });
  } catch (e) {
    console.error(e);
  }
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
