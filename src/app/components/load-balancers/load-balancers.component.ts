import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { Subscription, Observable } from 'rxjs';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
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
  V1LoadBalancerProfilesService,
  LoadBalancerProfile,
  LoadBalancerPolicy,
  V1LoadBalancerPoliciesService,
  PoolImportCollectionDto,
  VirtualServerImportCollectionDto,
} from 'api_client';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { NodeModalDto } from 'src/app/models/loadbalancer/node-modal-dto';
import { ProfileModalDto } from 'src/app/models/loadbalancer/profile-modal-dto';
import { PolicyModalDto } from 'src/app/models/loadbalancer/policy-modal-dto';

@Component({
  selector: 'app-load-balancers',
  templateUrl: './load-balancers.component.html',
})
export class LoadBalancersComponent implements OnInit, OnDestroy, PendingChangesGuard {
  navIndex = 0;

  tiers: Tier[];
  currentTier: Tier;

  currentIrulePage = 1;
  currentVSPage = 1;
  currentNodePage = 1;
  currentPoolPage = 1;
  currentHMPage = 1;
  currentProfilesPage = 1;
  currentPoliciesPage = 1;

  perPage = 20;

  virtualServers: LoadBalancerVirtualServer[];
  pools: LoadBalancerPool[];
  nodes: LoadBalancerNode[];
  irules: LoadBalancerIrule[];
  healthMonitors: LoadBalancerHealthMonitor[];
  profiles: LoadBalancerProfile[];
  policies: LoadBalancerPolicy[];

  virtualServerModalSubscription: Subscription;
  poolModalSubscription: Subscription;
  nodeModalSubscription: Subscription;
  iruleModalSubscription: Subscription;
  healthMonitorModalSubscription: Subscription;
  profileModalSubscription: Subscription;

  currentDatacenterSubscription: Subscription;
  policyModalSubscription: any;

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
    private profilesService: V1LoadBalancerProfilesService,
    private policiesService: V1LoadBalancerPoliciesService,
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

  getProfiles() {
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
      case 0:
        this.getPools(true);
        this.getIrules();
        break;
      case 1:
        this.getPools();
        this.getHealthMonitors();
        this.getNodes();
        break;
      case 2:
        this.getNodes();
        break;
      case 3:
        this.getIrules();
        break;
      case 4:
        this.getHealthMonitors();
        break;
      case 5:
        this.getProfiles();
        break;
      case 6:
        this.getPolicies();
        break;
    }
  }

  importLoadBalancerConfig(data) {
    // TODO: Display modal indicating the number of entities that will
    // be imported.

    // TODO: Display more descriptive error message when import fails.

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
        this.nodeService
          .v1LoadBalancerNodesBulkPost({
            generatedLoadBalancerNodeBulkDto: { bulk: data },
          })
          .subscribe(result => this.getObjectsForNavIndex());
        break;
      case 3:
        this.irulesService
          .v1LoadBalancerIrulesBulkPost({
            generatedLoadBalancerIruleBulkDto: { bulk: data },
          })
          .subscribe(result => this.getObjectsForNavIndex());
        break;
      case 4:
        this.healthMonitorsService
          .v1LoadBalancerHealthMonitorsBulkPost({
            generatedLoadBalancerHealthMonitorBulkDto: { bulk: data },
          })
          .subscribe(result => this.getObjectsForNavIndex());
        break;
      default:
        break;

      // TODO: Bulk Import of Policies and Profiles
    }
  }

  exportLoadBalancerConfig() {
    // TODO: Export Relationships
    switch (this.navIndex) {
      case 0:
        return this.virtualServers;
      case 1:
        return this.pools;
      case 2:
        return this.nodes;
      case 3:
        return this.irules;
      case 4:
        return this.healthMonitors;
      case 5:
        return this.profiles;
      case 6:
        return this.policies;
      default:
        break;
    }
  }

  sanitizeData(entities: any) {
    return entities.map(entity => {
      this.mapCsv(entity);
      return entity;
    });
  }

  mapCsv = obj => {
    Object.entries(obj).forEach(([key, val]) => {
      if (key === 'healthMonitorNames' || key === 'nodeNames' || key === 'iruleNames' || key === 'policyNames' || key === 'profileNames') {
        const stringArray = val as string;
        obj[key] = this.createAndFormatArray(stringArray);
      }
    });
    return obj;
    // tslint:disable-next-line: semicolon
  };

  createAndFormatArray(names: string) {
    return names
      .replace(/[\[\]']+/g, '')
      .split(',')
      .map(name => name.trim());
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
      throw new Error('Node required.');
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
      throw new Error('IRule required.');
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
      throw new Error('Health Monitor required.');
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

  openProfileModal(modalMode: ModalMode, profile: LoadBalancerProfile) {
    if (modalMode === ModalMode.Edit && !profile) {
      throw new Error('Profile Required');
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

  openPolicyModal(modalMode: ModalMode, policy: LoadBalancerPolicy) {
    if (modalMode === ModalMode.Edit && !policy) {
      throw new Error('Profile Required');
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

  restoreIrules(irule: LoadBalancerIrule) {
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

  private unsubAll() {
    [
      this.virtualServerModalSubscription,
      this.poolModalSubscription,
      this.healthMonitorModalSubscription,
      this.nodeModalSubscription,
      this.profileModalSubscription,
      this.policyModalSubscription,
      this.iruleModalSubscription,
    ].forEach(sub => {
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
    this.currentDatacenterSubscription = this.datacenterService.currentDatacenter.subscribe(cd => {
      if (cd) {
        this.tiers = cd.tiers;
        this.currentTier = null;
        this.virtualServers = [];
        this.pools = [];
        this.nodes = [];
        this.healthMonitors = [];
        this.policies = [];
        this.profiles = [];

        if (cd.tiers.length) {
          this.currentTier = cd.tiers[0];
          this.getObjectsForNavIndex();
        }
      }
    });
  }

  ngOnDestroy() {
    this.unsubAll();
  }
}
