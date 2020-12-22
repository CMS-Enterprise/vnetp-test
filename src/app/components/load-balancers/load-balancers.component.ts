import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { Subscription } from 'rxjs';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { PoolModalDto } from 'src/app/models/loadbalancer/pool-modal-dto';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import {
  Tier,
  V1TiersService,
  LoadBalancerPool,
  V1LoadBalancerPoolsService,
  LoadBalancerPolicy,
  V1LoadBalancerPoliciesService,
  PoolImportCollectionDto,
  NodeImportCollectionDto,
} from 'api_client';
import { PolicyModalDto } from 'src/app/models/loadbalancer/policy-modal-dto';
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

  currentPoliciesPage = 1;
  currentPoolPage = 1;

  perPage = 20;
  ModalMode = ModalMode;

  policies: LoadBalancerPolicy[];
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
  private policyModalSubscription: Subscription;
  private poolModalSubscription: Subscription;

  constructor(
    private datacenterService: DatacenterContextService,
    private entityService: EntityService,
    private ngx: NgxSmartModalService,
    private policiesService: V1LoadBalancerPoliciesService,
    private poolsService: V1LoadBalancerPoolsService,
    private tierContextService: TierContextService,
    private tierService: V1TiersService,
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

  getPolicies() {
    if (!this.hasCurrentTier()) {
      return;
    }

    this.tierService
      .v1TiersIdGet({
        id: this.currentTier.id,
        join: 'loadBalancerPolicies',
      })
      .subscribe(data => {
        this.policies = data.loadBalancerPolicies;
      });
  }

  getObjectsForNavIndex() {
    switch (this.navIndex) {
      case 1:
        this.getPools();
        break;
      case 7:
        this.getPolicies();
        break;
    }
  }

  importLoadBalancerConfig(data: any[]) {
    // TODO: Bulk Import of Policies

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
      case 7:
        return this.policies;
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

  openPolicyModal(modalMode: ModalMode, policy?: LoadBalancerPolicy) {
    if (modalMode === ModalMode.Edit && !policy) {
      throw new Error('Policy required');
    }

    const dto = new PolicyModalDto();
    dto.TierId = this.currentTier.id;
    dto.Policy = policy;
    dto.ModalMode = modalMode;

    this.subscribeToPolicyModal();
    this.datacenterService.lockDatacenter();
    this.ngx.setModalData(dto, 'loadBalancerPolicyModal');
    this.ngx.getModal('loadBalancerPolicyModal').open();
  }

  subscribeToPoolModal() {
    this.poolModalSubscription = this.ngx.getModal('poolModal').onCloseFinished.subscribe(() => {
      this.getPools();
      this.ngx.resetModalData('poolModal');
      this.poolModalSubscription.unsubscribe();
      this.datacenterService.unlockDatacenter();
    });
  }

  subscribeToPolicyModal() {
    this.policyModalSubscription = this.ngx.getModal('loadBalancerPolicyModal').onCloseFinished.subscribe(() => {
      this.getPolicies();
      this.ngx.resetModalData('loadBalancerPolicyModal');
      this.policyModalSubscription.unsubscribe();
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

  public deletePolicy(policy: LoadBalancerPolicy): void {
    this.entityService.deleteEntity(policy, {
      entityName: 'Policy',
      delete$: this.policiesService.v1LoadBalancerPoliciesIdDelete({ id: policy.id }),
      softDelete$: this.policiesService.v1LoadBalancerPoliciesIdSoftDelete({ id: policy.id }),
      onSuccess: () => this.getPolicies(),
    });
  }

  restorePool(pool: LoadBalancerPool) {
    if (pool.deletedAt) {
      this.poolsService.v1LoadBalancerPoolsIdRestorePatch({ id: pool.id }).subscribe(() => this.getPools());
    }
  }

  restorePolicy(policy: LoadBalancerPolicy) {
    if (policy.deletedAt) {
      this.policiesService.v1LoadBalancerPoliciesIdRestorePatch({ id: policy.id }).subscribe(() => this.getPolicies());
    }
  }

  private hasCurrentTier(): boolean {
    return this.currentTier && !!this.currentTier.id;
  }

  ngOnInit() {
    this.currentDatacenterSubscription = this.datacenterService.currentDatacenter.subscribe(cd => {
      if (cd) {
        this.tiers = cd.tiers;
        this.pools = [];
        this.policies = [];
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
    SubscriptionUtil.unsubscribe([
      this.poolModalSubscription,
      this.policyModalSubscription,
      this.currentDatacenterSubscription,
      this.currentTierSubscription,
    ]);
  }
}
