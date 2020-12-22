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
  LoadBalancerHealthMonitor,
  V1LoadBalancerPoolsService,
  LoadBalancerNode,
  V1LoadBalancerNodesService,
  LoadBalancerPolicy,
  V1LoadBalancerPoliciesService,
  PoolImportCollectionDto,
  NodeImportCollectionDto,
} from 'api_client';
import { NodeModalDto } from 'src/app/models/loadbalancer/node-modal-dto';
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

  currentNodePage = 1;
  currentPoliciesPage = 1;
  currentPoolPage = 1;

  perPage = 20;
  ModalMode = ModalMode;

  healthMonitors: LoadBalancerHealthMonitor[];
  nodes: LoadBalancerNode[];
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
  private nodeModalSubscription: Subscription;
  private policyModalSubscription: Subscription;
  private poolModalSubscription: Subscription;

  constructor(
    private datacenterService: DatacenterContextService,
    private entityService: EntityService,
    private ngx: NgxSmartModalService,
    private nodeService: V1LoadBalancerNodesService,
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

  getNodes() {
    if (this.currentTier && this.currentTier.id) {
      this.nodeService
        .v1LoadBalancerNodesIdTierIdGet({
          id: this.currentTier.id,
        })
        .subscribe(data => {
          this.nodes = data;
        });
    }
  }

  // TODO: Remove once split into modules, currently required by Pools tab
  getHealthMonitors() {
    if (!this.hasCurrentTier()) {
      return;
    }

    this.tierService
      .v1TiersIdGet({
        id: this.currentTier.id,
        join: 'loadBalancerHealthMonitors',
      })
      .subscribe(data => {
        this.healthMonitors = data.loadBalancerHealthMonitors;
      });
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
        this.getHealthMonitors();
        this.getNodes();
        break;
      case 3:
        this.getNodes();
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
      case 3:
        const nodes = this.sanitizeData(data, true);
        this.nodeService
          .v1LoadBalancerNodesBulkPost({
            generatedLoadBalancerNodeBulkDto: { bulk: nodes },
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
      case 3:
        return this.nodes;
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
    dto.healthMonitors = this.healthMonitors;
    dto.nodes = this.nodes;
    dto.ModalMode = modalMode;
    dto.TierId = this.currentTier.id;

    this.subscribeToPoolModal();
    this.datacenterService.lockDatacenter();
    this.ngx.setModalData(dto, 'poolModal');
    this.ngx.getModal('poolModal').open();
  }

  openNodeModal(modalMode: ModalMode, node?: LoadBalancerNode) {
    if (modalMode === ModalMode.Edit && !node) {
      throw new Error('Node required');
    }
    const dto = new NodeModalDto();
    dto.node = node;
    dto.ModalMode = modalMode;
    dto.TierId = this.currentTier.id;

    this.subscribeToNodeModal();
    this.datacenterService.lockDatacenter();
    this.ngx.setModalData(dto, 'nodeModal');
    this.ngx.getModal('nodeModal').open();
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
      this.getHealthMonitors();
      this.getNodes();
      this.ngx.resetModalData('poolModal');
      this.poolModalSubscription.unsubscribe();
      this.datacenterService.unlockDatacenter();
    });
  }

  subscribeToNodeModal() {
    this.nodeModalSubscription = this.ngx.getModal('nodeModal').onCloseFinished.subscribe(() => {
      this.getNodes();
      this.ngx.resetModalData('nodeModal');
      this.nodeModalSubscription.unsubscribe();
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

  public deleteNode(node: LoadBalancerNode): void {
    this.entityService.deleteEntity(node, {
      entityName: 'Node',
      delete$: this.nodeService.v1LoadBalancerNodesIdDelete({ id: node.id }),
      softDelete$: this.nodeService.v1LoadBalancerNodesIdSoftDelete({ id: node.id }),
      onSuccess: () => this.getNodes(),
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

  restoreNode(node: LoadBalancerNode) {
    if (node.deletedAt) {
      this.nodeService.v1LoadBalancerNodesIdRestorePatch({ id: node.id }).subscribe(() => this.getNodes());
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
        this.healthMonitors = [];
        this.nodes = [];
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
      this.nodeModalSubscription,
      this.policyModalSubscription,
      this.currentDatacenterSubscription,
      this.currentTierSubscription,
    ]);
  }
}
