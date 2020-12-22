import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { Subscription } from 'rxjs';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { PoolModalDto } from 'src/app/models/loadbalancer/pool-modal-dto';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { Tier, LoadBalancerPool, V1LoadBalancerPoolsService, PoolImportCollectionDto, NodeImportCollectionDto } from 'api_client';
import { TierContextService } from 'src/app/services/tier-context.service';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { Tab } from 'src/app/common/tabs/tabs.component';
import { environment } from 'src/environments/environment';
import { EntityService } from 'src/app/services/entity.service';

enum Indices {
  VirtualServers = 0,
  Pools = 1,
  PoolRelations = 2,
  Nodes = 3,
  iRules = 4,
  HealthMonitors = 5,
  Profiles = 6,
  Policies = 7,
  VLANs = 8,
  SelfIPs = 9,
  Routes = 10,
}

@Component({
  selector: 'app-load-balancers',
  templateUrl: './load-balancers.component.html',
})
export class LoadBalancersComponent implements OnInit, OnDestroy {
  navIndex = 0;

  public currentTier: Tier;
  public datacenterId: string;
  public tiers: Tier[];

  currentPoolPage = 1;

  perPage = 20;
  ModalMode = ModalMode;

  pools: LoadBalancerPool[];

  public wikiBase = environment.wikiBase;

  public tabs: Tab[] = [
    { name: 'Virtual Servers' },
    { name: 'Pools' },
    { name: 'Pool Relations' },
    { name: 'Nodes' },
    { name: 'iRules' },
    { name: 'Health Monitors' },
    { name: 'Profiles' },
    { name: 'Policies' },
    { name: 'VLANs' },
    { name: 'Self IPs' },
    { name: 'Routes' },
  ];

  private currentDatacenterSubscription: Subscription;
  private currentTierSubscription: Subscription;
  private poolModalSubscription: Subscription;

  constructor(
    private datacenterService: DatacenterContextService,
    private entityService: EntityService,
    private ngx: NgxSmartModalService,
    private poolsService: V1LoadBalancerPoolsService,
    private tierContextService: TierContextService,
  ) {}

  // TODO: Remove once split into modules
  public disableExport(): boolean {
    return new Set([Indices.Pools, Indices.HealthMonitors]).has(this.navIndex);
  }

  // TODO: Remove once split into modules
  public disableImport(): boolean {
    return new Set([Indices.HealthMonitors]).has(this.navIndex);
  }

  // TODO: Remove once split into modules
  public enablePerPage(): boolean {
    return !new Set([Indices.Pools, Indices.HealthMonitors]).has(this.navIndex);
  }

  public handleTabChange(tab: Tab): void {
    this.navIndex = this.tabs.findIndex(t => t.name === tab.name);
    this.getObjectsForNavIndex();
  }

  getPools() {
    if (this.currentTier && this.currentTier.id) {
      this.poolsService
        .v1LoadBalancerPoolsIdTierIdGet({
          id: this.currentTier.id,
        })
        .subscribe(data => {
          this.pools = data;
        });
    }
  }

  getObjectsForNavIndex() {
    switch (this.navIndex) {
      case 1:
        this.getPools();
        break;
    }
  }

  importLoadBalancerConfig(data: any[]) {
    // Choose Datatype to Import based on navindex.
    switch (this.navIndex) {
      case 1:
        const poolDto = {} as PoolImportCollectionDto;
        poolDto.datacenterId = this.datacenterService.currentDatacenterValue.id;
        poolDto.pools = this.sanitizeData(data);
        this.poolsService
          .v1LoadBalancerPoolsBulkImportPost({
            poolImportCollectionDto: poolDto,
          })
          .subscribe(() => this.getObjectsForNavIndex());
        break;
      // Pool Relations
      case 2:
        const nodeDto = {} as NodeImportCollectionDto;
        nodeDto.datacenterId = this.datacenterService.currentDatacenterValue.id;
        nodeDto.nodes = data;
        this.poolsService
          .v1LoadBalancerPoolsBulkUpdatePost({
            nodeImportCollectionDto: nodeDto,
          })
          .subscribe(() => this.getObjectsForNavIndex());
        break;
      default:
        break;
    }
  }

  exportLoadBalancerConfig(): any[] {
    // TODO: Export Relationships
    switch (this.navIndex) {
      case 1:
        return this.pools;
      default:
        break;
    }
  }

  sanitizeData(entities: any, resolveTier = false) {
    return entities.map(entity => {
      this.mapData(entity, resolveTier);
      return entity;
    });
  }

  mapData(entity: any, resolveTier: boolean) {
    if (resolveTier) {
      if (entity.vrfName) {
        entity.tierId = this.tiers.find(t => t.name === entity.vrfName).id;
      }
    }
  }

  getPoolName = (poolId: string) => {
    return this.pools.find(p => p.id === poolId).name || 'Error Resolving Name';
    // tslint:disable-next-line: semicolon
  };

  openPoolModal(modalMode: ModalMode, pool?: LoadBalancerPool) {
    if (modalMode === ModalMode.Edit && !pool) {
      throw new Error('Pool required.');
    }
    const dto = new PoolModalDto();
    dto.pool = pool;
    dto.healthMonitors = [];
    dto.nodes = [];
    dto.ModalMode = modalMode;
    dto.TierId = this.currentTier.id;

    this.subscribeToPoolModal();
    this.datacenterService.lockDatacenter();
    this.ngx.setModalData(dto, 'poolModal');
    this.ngx.getModal('poolModal').open();
  }

  subscribeToPoolModal() {
    this.poolModalSubscription = this.ngx.getModal('poolModal').onCloseFinished.subscribe(() => {
      this.getPools();
      this.ngx.resetModalData('poolModal');
      this.poolModalSubscription.unsubscribe();
      this.datacenterService.unlockDatacenter();
    });
  }

  public deletePool(pool: LoadBalancerPool): void {
    this.entityService.deleteEntity(pool, {
      entityName: 'Pool',
      delete$: this.poolsService.v1LoadBalancerPoolsIdDelete({ id: pool.id }),
      softDelete$: this.poolsService.v1LoadBalancerPoolsIdSoftDelete({ id: pool.id }),
      onSuccess: () => this.getPools(),
    });
  }
  restorePool(pool: LoadBalancerPool) {
    if (pool.deletedAt) {
      this.poolsService.v1LoadBalancerPoolsIdRestorePatch({ id: pool.id }).subscribe(() => this.getPools());
    }
  }

  ngOnInit() {
    this.currentDatacenterSubscription = this.datacenterService.currentDatacenter.subscribe(cd => {
      if (cd) {
        this.tiers = cd.tiers;
        this.pools = [];
        this.getObjectsForNavIndex();
        this.datacenterId = cd.id;
      }
    });

    this.currentTierSubscription = this.tierContextService.currentTier.subscribe(ct => {
      if (ct) {
        this.currentTier = ct;
        this.getObjectsForNavIndex();
      }
    });
  }

  ngOnDestroy() {
    SubscriptionUtil.unsubscribe([this.poolModalSubscription, this.currentDatacenterSubscription, this.currentTierSubscription]);
  }
}
