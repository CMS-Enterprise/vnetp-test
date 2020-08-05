import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { Subscription } from 'rxjs';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { VirtualServerModalDto } from 'src/app/models/loadbalancer/virtual-server-modal-dto';
import { PoolModalDto } from 'src/app/models/loadbalancer/pool-modal-dto';
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
  V1LoadBalancerVlansService,
  V1LoadBalancerSelfIpsService,
  V1LoadBalancerRoutesService,
} from 'api_client';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { NodeModalDto } from 'src/app/models/loadbalancer/node-modal-dto';
import { ProfileModalDto } from 'src/app/models/loadbalancer/profile-modal-dto';
import { PolicyModalDto } from 'src/app/models/loadbalancer/policy-modal-dto';
import { TierContextService } from 'src/app/services/tier-context.service';
import { LoadBalancerVlanModalDto } from 'src/app/models/network/lb-vlan-modal-dto';
import { LoadBalancerRouteModalDto } from 'src/app/models/network/lb-route-modal-dto';
import { LoadBalancerSelfIpModalDto } from 'src/app/models/network/lb-self-ip-modal-dto';
import SubscriptionUtil from 'src/app/utils/subscription.util';
import { Tab } from 'src/app/common/tabs/tabs.component';

@Component({
  selector: 'app-load-balancers',
  templateUrl: './load-balancers.component.html',
})
export class LoadBalancersComponent implements OnInit, OnDestroy {
  navIndex = 0;

  tiers: Tier[];
  currentTier: Tier;

  currentHMPage = 1;
  currentIrulePage = 1;
  currentNodePage = 1;
  currentPoliciesPage = 1;
  currentPoolPage = 1;
  currentProfilesPage = 1;
  currentRoutesPage = 1;
  currentSelfIpsPage = 1;
  currentVSPage = 1;
  currentVlansPage = 1;

  perPage = 20;
  ModalMode = ModalMode;

  healthMonitors: LoadBalancerHealthMonitor[];
  irules: LoadBalancerIrule[];
  nodes: LoadBalancerNode[];
  policies: LoadBalancerPolicy[];
  pools: LoadBalancerPool[];
  profiles: LoadBalancerProfile[];
  routes: LoadBalancerRoute[];
  selfIps: LoadBalancerSelfIp[];
  virtualServers: LoadBalancerVirtualServer[];
  vlans: LoadBalancerVlan[];

  public tabs: Tab[] = [
    {
      name: 'Virtual Servers',
      tooltip: this.helpText.VirtualServers,
    },
    {
      name: 'Pools',
      tooltip: this.helpText.Pools,
    },
    {
      name: 'Pool Relations',
      tooltip: this.helpText.PoolRelations,
    },
    {
      name: 'Nodes',
      tooltip: this.helpText.Nodes,
    },
    {
      name: 'iRules',
      tooltip: this.helpText.IRules,
    },
    {
      name: 'Health Monitors',
      tooltip: this.helpText.HealthMonitors,
    },
    {
      name: 'Profiles',
      tooltip: this.helpText.Profiles,
    },
    {
      name: 'Policies',
      tooltip: this.helpText.Policies,
    },
    {
      name: 'VLANs',
      tooltip: this.helpText.Vlans,
    },
    {
      name: 'Self IPs',
      tooltip: this.helpText.SelfIps,
    },
    {
      name: 'Routes',
      tooltip: this.helpText.Routes,
    },
  ];

  private currentDatacenterSubscription: Subscription;
  private currentTierSubscription: Subscription;
  private healthMonitorModalSubscription: Subscription;
  private iruleModalSubscription: Subscription;
  private nodeModalSubscription: Subscription;
  private policyModalSubscription: Subscription;
  private poolModalSubscription: Subscription;
  private profileModalSubscription: Subscription;
  private routeModalSubscription: Subscription;
  private selfIpModalSubscription: Subscription;
  private virtualServerModalSubscription: Subscription;
  private vlanModalSubscription: Subscription;

  constructor(
    private ngx: NgxSmartModalService,
    public datacenterService: DatacenterContextService,
    private tierContextService: TierContextService,
    private tierService: V1TiersService,
    private irulesService: V1LoadBalancerIrulesService,
    private virtualServersService: V1LoadBalancerVirtualServersService,
    private poolsService: V1LoadBalancerPoolsService,
    private nodeService: V1LoadBalancerNodesService,
    private healthMonitorsService: V1LoadBalancerHealthMonitorsService,
    private profilesService: V1LoadBalancerProfilesService,
    private policiesService: V1LoadBalancerPoliciesService,
    private vlansService: V1LoadBalancerVlansService,
    private selfIpsService: V1LoadBalancerSelfIpsService,
    private routesService: V1LoadBalancerRoutesService,
    public helpText: LoadBalancersHelpText,
  ) {}

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

  getIrules() {
    if (this.currentTier && this.currentTier.id) {
      this.tierService
        .v1TiersIdGet({
          id: this.currentTier.id,
          join: 'loadBalancerIrules',
        })
        .subscribe(data => (this.irules = data.loadBalancerIrules));
    }
  }

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

  getVlans() {
    if (!this.hasCurrentTier()) {
      return;
    }

    this.vlansService
      .v1LoadBalancerVlansGet({
        filter: `tierId||eq||${this.currentTier.id}`,
      })
      .subscribe(data => {
        this.vlans = data;
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
        this.getIrules();
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
        this.getIrules();
        break;
      case 5:
        this.getHealthMonitors();
        break;
      case 6:
        this.getProfiles();
        break;
      case 7:
        this.getPolicies();
        break;
      case 7:
        this.getVlans();
        break;
      case 8:
        this.getSelfIps();
        break;
      case 9:
        this.getRoutes();
        break;
    }
  }

  importLoadBalancerConfig(data) {
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
          .subscribe(results => this.getObjectsForNavIndex());
        break;
      case 1:
        const poolDto = {} as PoolImportCollectionDto;
        poolDto.datacenterId = this.datacenterService.currentDatacenterValue.id;
        poolDto.pools = this.sanitizeData(data);
        this.poolsService
          .v1LoadBalancerPoolsBulkImportPost({
            poolImportCollectionDto: poolDto,
          })
          .subscribe(results => this.getObjectsForNavIndex());
        break;
      case 2:
        const nodeDto = {} as NodeImportCollectionDto;
        nodeDto.datacenterId = this.datacenterService.currentDatacenterValue.id;
        nodeDto.nodes = data;
        this.poolsService
          .v1LoadBalancerPoolsBulkUpdatePost({
            nodeImportCollectionDto: nodeDto,
          })
          .subscribe(result => this.getObjectsForNavIndex());
        break;
      case 3:
        const nodes = this.sanitizeData(data, true);
        this.nodeService
          .v1LoadBalancerNodesBulkPost({
            generatedLoadBalancerNodeBulkDto: { bulk: nodes },
          })
          .subscribe(result => this.getObjectsForNavIndex());
        break;
      case 4:
        const irules = this.sanitizeData(data, true);
        this.irulesService
          .v1LoadBalancerIrulesBulkPost({
            generatedLoadBalancerIruleBulkDto: { bulk: irules },
          })
          .subscribe(result => this.getObjectsForNavIndex());
        break;
      case 5:
        const healthMonitors = this.sanitizeData(data, true);
        this.healthMonitorsService
          .v1LoadBalancerHealthMonitorsBulkPost({
            generatedLoadBalancerHealthMonitorBulkDto: { bulk: healthMonitors },
          })
          .subscribe(result => this.getObjectsForNavIndex());
        break;
      default:
        break;

      // TODO: Bulk Import of Policies, Profiles, Vlans, SelfIps, Routes
    }
  }

  exportLoadBalancerConfig() {
    // TODO: Export Relationships
    switch (this.navIndex) {
      case 0:
        return this.virtualServers;
      case 1:
        return this.pools;
      case 3:
        return this.nodes;
      case 4:
        return this.irules;
      case 5:
        return this.healthMonitors;
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
    dto.IRules = this.irules;
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

  openIRuleModal(modalMode: ModalMode, irule?: LoadBalancerIrule) {
    if (modalMode === ModalMode.Edit && !irule) {
      throw new Error('IRule required');
    }

    const dto = {} as any;
    dto.irule = irule;
    dto.ModalMode = modalMode;
    dto.TierId = this.currentTier.id;

    this.subscribeToIRuleModal();
    this.datacenterService.lockDatacenter();
    this.ngx.setModalData(dto, 'iruleModal');
    this.ngx.getModal('iruleModal').open();
  }

  openHealthMonitorModal(modalMode: ModalMode, healthMonitor?: LoadBalancerHealthMonitor) {
    if (modalMode === ModalMode.Edit && !healthMonitor) {
      throw new Error('Health Monitor required');
    }

    const dto = {} as any;
    dto.healthMonitor = healthMonitor;
    dto.ModalMode = modalMode;
    dto.TierId = this.currentTier.id;

    this.subscribeToHealthMonitorModal();
    this.datacenterService.lockDatacenter();
    this.ngx.setModalData(dto, 'healthMonitorModal');
    this.ngx.getModal('healthMonitorModal').open();
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

  openVlanModal(modalMode: ModalMode, vlan?: LoadBalancerVlan) {
    if (modalMode === ModalMode.Edit && !vlan) {
      throw new Error('VLAN required');
    }

    const dto = new LoadBalancerVlanModalDto();
    dto.TierId = this.currentTier.id;
    dto.Vlan = vlan;
    dto.ModalMode = modalMode;

    this.subscribeToVlanModal();
    this.datacenterService.lockDatacenter();
    this.ngx.setModalData(dto, 'loadBalancerVlanModal');
    this.ngx.getModal('loadBalancerVlanModal').open();
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

  subscribeToVlanModal() {
    this.routeModalSubscription = this.ngx.getModal('loadBalancerVlanModal').onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
      this.getVlans();
      this.ngx.resetModalData('loadBalancerVlanModal');
      this.vlanModalSubscription.unsubscribe();
      this.datacenterService.unlockDatacenter();
    });
  }

  subscribeToSelfIpModal() {
    this.selfIpModalSubscription = this.ngx
      .getModal('loadBalancerSelfIpModal')
      .onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
        this.getSelfIps();
        this.ngx.resetModalData('loadBalancerSelfIpModal');
        this.selfIpModalSubscription.unsubscribe();
        this.datacenterService.unlockDatacenter();
      });
  }

  subscribeToRouteModal() {
    this.routeModalSubscription = this.ngx.getModal('loadBalancerRouteModal').onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
      this.getRoutes();
      this.ngx.resetModalData('loadBalancerRouteModal');
      this.routeModalSubscription.unsubscribe();
      this.datacenterService.unlockDatacenter();
    });
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
    this.poolModalSubscription = this.ngx.getModal('poolModal').onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
      this.getPools();
      this.getHealthMonitors();
      this.getNodes();
      this.ngx.resetModalData('poolModal');
      this.poolModalSubscription.unsubscribe();
      this.datacenterService.unlockDatacenter();
    });
  }

  subscribeToNodeModal() {
    this.nodeModalSubscription = this.ngx.getModal('nodeModal').onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
      this.getNodes();
      this.ngx.resetModalData('nodeModal');
      this.nodeModalSubscription.unsubscribe();
      this.datacenterService.unlockDatacenter();
    });
  }

  subscribeToIRuleModal() {
    this.iruleModalSubscription = this.ngx.getModal('iruleModal').onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
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

  subscribeToProfileModal() {
    this.profileModalSubscription = this.ngx
      .getModal('loadBalancerProfileModal')
      .onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
        this.getProfiles();
        this.ngx.resetModalData('loadBalancerProfileModal');
        this.profileModalSubscription.unsubscribe();
        this.datacenterService.unlockDatacenter();
      });
  }

  subscribeToPolicyModal() {
    this.policyModalSubscription = this.ngx
      .getModal('loadBalancerPolicyModal')
      .onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
        this.getPolicies();
        this.ngx.resetModalData('loadBalancerPolicyModal');
        this.policyModalSubscription.unsubscribe();
        this.datacenterService.unlockDatacenter();
      });
  }

  deleteVirtualServer(virtualServer: LoadBalancerVirtualServer) {
    if (virtualServer.provisionedAt) {
      throw new Error('Cannot delete provisioned object.');
    }
    const deleteDescription = virtualServer.deletedAt ? 'Delete' : 'Soft-Delete';

    const deleteFunction = () => {
      if (!virtualServer.deletedAt) {
        this.virtualServersService.v1LoadBalancerVirtualServersIdSoftDelete({ id: virtualServer.id }).subscribe(data => {
          this.getVirtualServers();
        });
      } else {
        this.virtualServersService.v1LoadBalancerVirtualServersIdDelete({ id: virtualServer.id }).subscribe(data => {
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
        this.irulesService.v1LoadBalancerIrulesIdSoftDelete({ id: irule.id }).subscribe(data => {
          this.getIrules();
        });
      } else {
        this.irulesService.v1LoadBalancerIrulesIdDelete({ id: irule.id }).subscribe(data => {
          this.getIrules();
        });
      }
    };

    this.confirmDeleteObject(
      new YesNoModalDto(`${deleteDescription} Irule?`, `Do you want to ${deleteDescription} irule "${irule.name}"?`),
      deleteFunction,
    );
  }

  deleteHealthMonitor(healthMonitor: LoadBalancerHealthMonitor) {
    if (healthMonitor.provisionedAt) {
      throw new Error('Cannot delete provisioned object.');
    }
    const deleteDescription = healthMonitor.deletedAt ? 'Delete' : 'Soft-Delete';

    const deleteFunction = () => {
      if (!healthMonitor.deletedAt) {
        this.healthMonitorsService.v1LoadBalancerHealthMonitorsIdSoftDelete({ id: healthMonitor.id }).subscribe(data => {
          this.getHealthMonitors();
        });
      } else {
        this.healthMonitorsService.v1LoadBalancerHealthMonitorsIdDelete({ id: healthMonitor.id }).subscribe(data => {
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
        this.poolsService.v1LoadBalancerPoolsIdSoftDelete({ id: pool.id }).subscribe(data => {
          this.getPools();
        });
      } else {
        this.poolsService.v1LoadBalancerPoolsIdDelete({ id: pool.id }).subscribe(data => {
          this.getPools();
        });
      }
    };

    this.confirmDeleteObject(
      new YesNoModalDto(`${deleteDescription} Pool?`, `Do you want to ${deleteDescription} pool "${pool.name}"?`),
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
        this.nodeService.v1LoadBalancerNodesIdSoftDelete({ id: node.id }).subscribe(data => {
          this.getNodes();
        });
      } else {
        this.nodeService.v1LoadBalancerNodesIdDelete({ id: node.id }).subscribe(data => {
          this.getNodes();
        });
      }
    };

    this.confirmDeleteObject(
      new YesNoModalDto(`${deleteDescription} Node?`, `Do you want to ${deleteDescription} node "${node.name}"?`),
      deleteFunction,
    );
  }

  deleteProfile(profile: LoadBalancerProfile) {
    if (profile.provisionedAt) {
      throw new Error('Cannot delete provisioned object.');
    }
    const deleteDescription = profile.deletedAt ? 'Delete' : 'Soft-Delete';

    const deleteFunction = () => {
      if (!profile.deletedAt) {
        this.profilesService.v1LoadBalancerProfilesIdSoftDelete({ id: profile.id }).subscribe(data => {
          this.getProfiles();
        });
      } else {
        this.profilesService.v1LoadBalancerProfilesIdDelete({ id: profile.id }).subscribe(data => {
          this.getProfiles();
        });
      }
    };

    this.confirmDeleteObject(
      new YesNoModalDto(`${deleteDescription} Profile?`, `Do you want to ${deleteDescription} Profile "${profile.name}"?`),
      deleteFunction,
    );
  }

  deletePolicy(policy: LoadBalancerPolicy) {
    if (policy.provisionedAt) {
      throw new Error('Cannot delete provisioned object.');
    }
    const deleteDescription = policy.deletedAt ? 'Delete' : 'Soft-Delete';

    const deleteFunction = () => {
      if (!policy.deletedAt) {
        this.policiesService.v1LoadBalancerPoliciesIdSoftDelete({ id: policy.id }).subscribe(data => {
          this.getPolicies();
        });
      } else {
        this.policiesService.v1LoadBalancerPoliciesIdDelete({ id: policy.id }).subscribe(data => {
          this.getPolicies();
        });
      }
    };

    this.confirmDeleteObject(
      new YesNoModalDto(`${deleteDescription} Policy?`, `Do you want to ${deleteDescription} Policy "${policy.name}"?`),
      deleteFunction,
    );
  }

  deleteVlan(vlan: LoadBalancerVlan) {
    if (vlan.provisionedAt) {
      throw new Error('Cannot delete provisioned object.');
    }
    const deleteDescription = vlan.deletedAt ? 'Delete' : 'Soft-Delete';

    const deleteFunction = () => {
      if (!vlan.deletedAt) {
        this.vlansService.v1LoadBalancerVlansIdSoftDelete({ id: vlan.id }).subscribe(data => {
          this.getVlans();
        });
      } else {
        this.vlansService.v1LoadBalancerVlansIdDelete({ id: vlan.id }).subscribe(data => {
          this.getVlans();
        });
      }
    };

    this.confirmDeleteObject(
      new YesNoModalDto(`${deleteDescription} VLAN?`, `Do you want to ${deleteDescription} VLAN "${vlan.name}"?`),
      deleteFunction,
    );
  }

  deleteSelfIp(selfIp: LoadBalancerSelfIp) {
    if (selfIp.provisionedAt) {
      throw new Error('Cannot delete provisioned object.');
    }
    const deleteDescription = selfIp.deletedAt ? 'Delete' : 'Soft-Delete';

    const deleteFunction = () => {
      if (!selfIp.deletedAt) {
        this.selfIpsService.v1LoadBalancerSelfIpsIdSoftDelete({ id: selfIp.id }).subscribe(data => {
          this.getSelfIps();
        });
      } else {
        this.selfIpsService.v1LoadBalancerSelfIpsIdDelete({ id: selfIp.id }).subscribe(data => {
          this.getSelfIps();
        });
      }
    };

    this.confirmDeleteObject(
      new YesNoModalDto(`${deleteDescription} Self IP?`, `Do you want to ${deleteDescription} Self IP "${selfIp.name}"?`),
      deleteFunction,
    );
  }

  deleteRoute(route: LoadBalancerRoute) {
    if (route.provisionedAt) {
      throw new Error('Cannot delete provisioned object.');
    }
    const deleteDescription = route.deletedAt ? 'Delete' : 'Soft-Delete';

    const deleteFunction = () => {
      if (!route.deletedAt) {
        this.routesService.v1LoadBalancerRoutesIdSoftDelete({ id: route.id }).subscribe(data => {
          this.getRoutes();
        });
      } else {
        this.routesService.v1LoadBalancerRoutesIdDelete({ id: route.id }).subscribe(data => {
          this.getRoutes();
        });
      }
    };

    this.confirmDeleteObject(
      new YesNoModalDto(`${deleteDescription} Route?`, `Do you want to ${deleteDescription} Route "${route.name}"?`),
      deleteFunction,
    );
  }

  restoreVlan(vlan: LoadBalancerVlan) {
    if (vlan.deletedAt) {
      this.vlansService.v1LoadBalancerVlansIdRestorePatch({ id: vlan.id }).subscribe(data => this.getVlans());
    }
  }

  restoreSelfIp(selfIp: LoadBalancerSelfIp) {
    if (selfIp.deletedAt) {
      this.selfIpsService.v1LoadBalancerSelfIpsIdRestorePatch({ id: selfIp.id }).subscribe(data => this.getSelfIps());
    }
  }

  restoreRoute(route: LoadBalancerRoute) {
    if (route.deletedAt) {
      this.routesService.v1LoadBalancerRoutesIdRestorePatch({ id: route.id }).subscribe(data => this.getRoutes());
    }
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
      this.poolsService.v1LoadBalancerPoolsIdRestorePatch({ id: pool.id }).subscribe(data => this.getPools());
    }
  }

  restoreNode(node: LoadBalancerNode) {
    if (node.deletedAt) {
      this.nodeService.v1LoadBalancerNodesIdRestorePatch({ id: node.id }).subscribe(data => this.getNodes());
    }
  }

  restoreIrule(irule: LoadBalancerIrule) {
    if (irule.deletedAt) {
      this.irulesService.v1LoadBalancerIrulesIdRestorePatch({ id: irule.id }).subscribe(data => this.getIrules());
    }
  }

  restoreHealthMonitor(healthMonitor: LoadBalancerHealthMonitor) {
    if (healthMonitor.deletedAt) {
      this.healthMonitorsService
        .v1LoadBalancerHealthMonitorsIdRestorePatch({ id: healthMonitor.id })
        .subscribe(data => this.getHealthMonitors());
    }
  }

  restoreProfile(profile: LoadBalancerProfile) {
    if (profile.deletedAt) {
      this.profilesService.v1LoadBalancerProfilesIdRestorePatch({ id: profile.id }).subscribe(data => this.getProfiles());
    }
  }

  restorePolicy(policy: LoadBalancerPolicy) {
    if (policy.deletedAt) {
      this.policiesService.v1LoadBalancerPoliciesIdRestorePatch({ id: policy.id }).subscribe(data => this.getPolicies());
    }
  }

  private confirmDeleteObject(modalDto: YesNoModalDto, deleteFunction: () => void) {
    this.ngx.setModalData(modalDto, 'yesNoModal');
    this.ngx.getModal('yesNoModal').open();
    const yesNoModalSubscription = this.ngx.getModal('yesNoModal').onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
      const data = modal.getData() as YesNoModalDto;
      modal.removeData();
      if (data && data.modalYes) {
        deleteFunction();
      }
      yesNoModalSubscription.unsubscribe();
    });
  }

  private hasCurrentTier(): boolean {
    return this.currentTier && !!this.currentTier.id;
  }

  private unsubAll() {
    SubscriptionUtil.unsubscribe([
      this.virtualServerModalSubscription,
      this.poolModalSubscription,
      this.healthMonitorModalSubscription,
      this.nodeModalSubscription,
      this.profileModalSubscription,
      this.policyModalSubscription,
      this.iruleModalSubscription,
      this.currentDatacenterSubscription,
      this.currentTierSubscription,
    ]);
  }

  ngOnInit() {
    this.currentDatacenterSubscription = this.datacenterService.currentDatacenter.subscribe(cd => {
      if (cd) {
        this.tiers = cd.tiers;
        this.virtualServers = [];
        this.pools = [];
        this.nodes = [];
        this.healthMonitors = [];
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
    this.unsubAll();
  }
}
