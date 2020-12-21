import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { Subscription } from 'rxjs';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { VirtualServerModalDto } from 'src/app/models/loadbalancer/virtual-server-modal-dto';
import { PoolModalDto } from 'src/app/models/loadbalancer/pool-modal-dto';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import {
  Tier,
  V1TiersService,
  LoadBalancerPool,
  LoadBalancerHealthMonitor,
  LoadBalancerVirtualServer,
  V1LoadBalancerVirtualServersService,
  V1LoadBalancerPoolsService,
  LoadBalancerNode,
  V1LoadBalancerNodesService,
  V1LoadBalancerProfilesService,
  LoadBalancerProfile,
  LoadBalancerPolicy,
  V1LoadBalancerPoliciesService,
  PoolImportCollectionDto,
  VirtualServerImportCollectionDto,
  NodeImportCollectionDto,
  LoadBalancerVlan,
  LoadBalancerSelfIp,
  LoadBalancerRoute,
  V1LoadBalancerSelfIpsService,
  V1LoadBalancerRoutesService,
} from 'api_client';
import { NodeModalDto } from 'src/app/models/loadbalancer/node-modal-dto';
import { ProfileModalDto } from 'src/app/models/loadbalancer/profile-modal-dto';
import { PolicyModalDto } from 'src/app/models/loadbalancer/policy-modal-dto';
import { TierContextService } from 'src/app/services/tier-context.service';
import { LoadBalancerRouteModalDto } from 'src/app/models/network/lb-route-modal-dto';
import { LoadBalancerSelfIpModalDto } from 'src/app/models/network/lb-self-ip-modal-dto';
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

  public tiers: Tier[];
  public currentTier: Tier;

  currentNodePage = 1;
  currentPoliciesPage = 1;
  currentPoolPage = 1;
  currentProfilesPage = 1;
  currentRoutesPage = 1;
  currentSelfIpsPage = 1;
  currentVSPage = 1;

  perPage = 20;
  ModalMode = ModalMode;

  healthMonitors: LoadBalancerHealthMonitor[];
  nodes: LoadBalancerNode[];
  policies: LoadBalancerPolicy[];
  pools: LoadBalancerPool[];
  profiles: LoadBalancerProfile[];
  routes: LoadBalancerRoute[];
  selfIps: LoadBalancerSelfIp[];
  virtualServers: LoadBalancerVirtualServer[];

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
  private profileModalSubscription: Subscription;
  private routeModalSubscription: Subscription;
  private selfIpModalSubscription: Subscription;
  private virtualServerModalSubscription: Subscription;

  constructor(
    private datacenterService: DatacenterContextService,
    private entityService: EntityService,
    private ngx: NgxSmartModalService,
    private nodeService: V1LoadBalancerNodesService,
    private policiesService: V1LoadBalancerPoliciesService,
    private poolsService: V1LoadBalancerPoolsService,
    private profilesService: V1LoadBalancerProfilesService,
    private routesService: V1LoadBalancerRoutesService,
    private selfIpsService: V1LoadBalancerSelfIpsService,
    private tierContextService: TierContextService,
    private tierService: V1TiersService,
    private virtualServersService: V1LoadBalancerVirtualServersService,
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

  getVirtualServers() {
    if (!this.hasCurrentTier()) {
      return;
    }

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
    if (this.currentTier && this.currentTier.id) {
      this.poolsService
        .v1LoadBalancerPoolsIdTierIdGet({
          id: this.currentTier.id,
        })
        .subscribe(data => {
          this.pools = data;

          if (getVirtualServers) {
            this.getVirtualServers();
          }
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

  getProfiles() {
    if (!this.hasCurrentTier()) {
      return;
    }

    this.tierService
      .v1TiersIdGet({
        id: this.currentTier.id,
        join: 'loadBalancerProfiles',
      })
      .subscribe(data => {
        this.profiles = data.loadBalancerProfiles;
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

  getSelfIps() {
    if (!this.hasCurrentTier()) {
      return;
    }

    this.selfIpsService
      .v1LoadBalancerSelfIpsGet({
        filter: `tierId||eq||${this.currentTier.id}`,
        join: 'loadBalancerVlan',
      })
      .subscribe(data => {
        this.selfIps = data;
      });
  }

  getRoutes() {
    if (!this.hasCurrentTier()) {
      return;
    }

    this.routesService
      .v1LoadBalancerRoutesGet({
        filter: `tierId||eq||${this.currentTier.id}`,
      })
      .subscribe(data => {
        this.routes = data;
      });
  }

  getObjectsForNavIndex() {
    switch (this.navIndex) {
      case 0:
        this.getPools(true);
        break;
      case 1:
        this.getPools();
        this.getHealthMonitors();
        this.getNodes();
        break;
      case 3:
        this.getNodes();
        break;
      case 4:
        break;
      case 5:
        break;
      case 6:
        this.getProfiles();
        break;
      case 7:
        this.getPolicies();
        break;
      case 8:
        break;
      case 9:
        this.getSelfIps();
        break;
      case 10:
        this.getRoutes();
        break;
    }
  }

  importLoadBalancerConfig(data: any[]) {
    // TODO: Bulk Import of Policies, Profiles, SelfIps, Routes

    // Choose Datatype to Import based on navindex.
    switch (this.navIndex) {
      case 0:
        const virtualServerDto = {} as VirtualServerImportCollectionDto;
        virtualServerDto.datacenterId = this.datacenterService.currentDatacenterValue.id;
        virtualServerDto.virtualServers = this.sanitizeData(data);
        this.virtualServersService
          .v1LoadBalancerVirtualServersBulkImportPost({
            virtualServerImportCollectionDto: virtualServerDto,
          })
          .subscribe(() => this.getObjectsForNavIndex());
        break;
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
      case 0:
        return this.virtualServers;
      case 1:
        return this.pools;
      case 3:
        return this.nodes;
      case 6:
        return this.profiles;
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

  openVirtualServerModal(modalMode: ModalMode, virtualServer?: LoadBalancerVirtualServer) {
    const dto = new VirtualServerModalDto();
    dto.TierId = this.currentTier.id;
    dto.Pools = this.pools;
    dto.VirtualServer = virtualServer;
    dto.IRules = []; //this.irules;
    dto.ModalMode = modalMode;

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

  openProfileModal(modalMode: ModalMode, profile?: LoadBalancerProfile) {
    if (modalMode === ModalMode.Edit && !profile) {
      throw new Error('Profile required');
    }

    const dto = new ProfileModalDto();
    dto.TierId = this.currentTier.id;
    dto.Profile = profile;
    dto.ModalMode = modalMode;

    this.subscribeToProfileModal();
    this.datacenterService.lockDatacenter();
    this.ngx.setModalData(dto, 'loadBalancerProfileModal');
    this.ngx.getModal('loadBalancerProfileModal').open();
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

  openSelfIpModal(modalMode: ModalMode, selfIp?: LoadBalancerSelfIp) {
    if (modalMode === ModalMode.Edit && !selfIp) {
      throw new Error('Self IP required');
    }

    const dto = new LoadBalancerSelfIpModalDto();
    dto.TierId = this.currentTier.id;
    dto.SelfIp = selfIp;
    dto.ModalMode = modalMode;

    this.subscribeToSelfIpModal();
    this.datacenterService.lockDatacenter();
    this.ngx.setModalData(dto, 'loadBalancerSelfIpModal');
    this.ngx.getModal('loadBalancerSelfIpModal').open();
  }

  openRouteModal(modalMode: ModalMode, route?: LoadBalancerRoute) {
    if (modalMode === ModalMode.Edit && !route) {
      throw new Error('Route required');
    }

    const dto = new LoadBalancerRouteModalDto();
    dto.TierId = this.currentTier.id;
    dto.Route = route;
    dto.ModalMode = modalMode;

    this.subscribeToRouteModal();
    this.datacenterService.lockDatacenter();
    this.ngx.setModalData(dto, 'loadBalancerRouteModal');
    this.ngx.getModal('loadBalancerRouteModal').open();
  }

  subscribeToSelfIpModal() {
    this.selfIpModalSubscription = this.ngx.getModal('loadBalancerSelfIpModal').onCloseFinished.subscribe(() => {
      this.getSelfIps();
      this.ngx.resetModalData('loadBalancerSelfIpModal');
      this.selfIpModalSubscription.unsubscribe();
      this.datacenterService.unlockDatacenter();
    });
  }

  subscribeToRouteModal() {
    this.routeModalSubscription = this.ngx.getModal('loadBalancerRouteModal').onCloseFinished.subscribe(() => {
      this.getRoutes();
      this.ngx.resetModalData('loadBalancerRouteModal');
      this.routeModalSubscription.unsubscribe();
      this.datacenterService.unlockDatacenter();
    });
  }

  subscribeToVirtualServerModal() {
    this.virtualServerModalSubscription = this.ngx.getModal('virtualServerModal').onCloseFinished.subscribe(() => {
      this.getVirtualServers();
      this.ngx.resetModalData('virtualServerModal');
      this.virtualServerModalSubscription.unsubscribe();
      this.datacenterService.unlockDatacenter();
    });
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

  subscribeToProfileModal() {
    this.profileModalSubscription = this.ngx.getModal('loadBalancerProfileModal').onCloseFinished.subscribe(() => {
      this.getProfiles();
      this.ngx.resetModalData('loadBalancerProfileModal');
      this.profileModalSubscription.unsubscribe();
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

  public deleteVirtualServer(virtualServer: LoadBalancerVirtualServer): void {
    this.entityService.deleteEntity(virtualServer, {
      entityName: 'Virtual Server',
      delete$: this.virtualServersService.v1LoadBalancerVirtualServersIdDelete({ id: virtualServer.id }),
      softDelete$: this.virtualServersService.v1LoadBalancerVirtualServersIdSoftDelete({ id: virtualServer.id }),
      onSuccess: () => this.getVirtualServers(),
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

  public deleteProfile(profile: LoadBalancerProfile): void {
    this.entityService.deleteEntity(profile, {
      entityName: 'Profile',
      delete$: this.profilesService.v1LoadBalancerProfilesIdDelete({ id: profile.id }),
      softDelete$: this.profilesService.v1LoadBalancerProfilesIdSoftDelete({ id: profile.id }),
      onSuccess: () => this.getProfiles(),
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

  public deleteSelfIp(selfIp: LoadBalancerSelfIp): void {
    this.entityService.deleteEntity(selfIp, {
      entityName: 'Self IP',
      delete$: this.selfIpsService.v1LoadBalancerSelfIpsIdDelete({ id: selfIp.id }),
      softDelete$: this.selfIpsService.v1LoadBalancerSelfIpsIdSoftDelete({ id: selfIp.id }),
      onSuccess: () => this.getSelfIps(),
    });
  }

  public deleteRoute(route: LoadBalancerRoute): void {
    this.entityService.deleteEntity(route, {
      entityName: 'Route',
      delete$: this.routesService.v1LoadBalancerRoutesIdDelete({ id: route.id }),
      softDelete$: this.routesService.v1LoadBalancerRoutesIdSoftDelete({ id: route.id }),
      onSuccess: () => this.getRoutes(),
    });
  }

  restoreSelfIp(selfIp: LoadBalancerSelfIp) {
    if (selfIp.deletedAt) {
      this.selfIpsService.v1LoadBalancerSelfIpsIdRestorePatch({ id: selfIp.id }).subscribe(() => this.getSelfIps());
    }
  }

  restoreRoute(route: LoadBalancerRoute) {
    if (route.deletedAt) {
      this.routesService.v1LoadBalancerRoutesIdRestorePatch({ id: route.id }).subscribe(() => this.getRoutes());
    }
  }

  restoreVirtualServer(virtualServer: LoadBalancerVirtualServer) {
    if (virtualServer.deletedAt) {
      this.virtualServersService
        .v1LoadBalancerVirtualServersIdRestorePatch({ id: virtualServer.id })
        .subscribe(() => this.getVirtualServers());
    }
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

  restoreProfile(profile: LoadBalancerProfile) {
    if (profile.deletedAt) {
      this.profilesService.v1LoadBalancerProfilesIdRestorePatch({ id: profile.id }).subscribe(() => this.getProfiles());
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
        this.virtualServers = [];
        this.pools = [];
        this.healthMonitors = [];
        this.nodes = [];
        this.policies = [];
        this.profiles = [];
        this.getObjectsForNavIndex();
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
      this.virtualServerModalSubscription,
      this.poolModalSubscription,
      this.nodeModalSubscription,
      this.profileModalSubscription,
      this.policyModalSubscription,
      this.currentDatacenterSubscription,
      this.currentTierSubscription,
    ]);
  }
}
