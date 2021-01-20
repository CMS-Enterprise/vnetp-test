import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { Subscription } from 'rxjs';
import { NetworkObjectModalDto } from 'src/app/models/network-objects/network-object-modal-dto';
import { NetworkObjectGroupModalDto } from 'src/app/models/network-objects/network-object-group-modal-dto';
import { NetworkObjectsGroupsHelpText } from 'src/app/helptext/help-text-networking';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { Tier } from 'api_client/model/tier';
import {
  V1TiersService,
  NetworkObject,
  V1NetworkSecurityNetworkObjectsService,
  NetworkObjectGroup,
  V1NetworkSecurityNetworkObjectGroupsService,
  NetworkObjectGroupRelationBulkImportCollectionDto,
} from 'api_client';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { TierContextService } from 'src/app/services/tier-context.service';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { Tab } from 'src/app/common/tabs/tabs.component';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import { EntityService } from 'src/app/services/entity.service';

@Component({
  selector: 'app-network-objects-groups',
  templateUrl: './network-objects-groups.component.html',
})
export class NetworkObjectsGroupsComponent implements OnInit, OnDestroy {
  tiers: Tier[];
  currentTier: Tier;
  currentNetworkObjectsPage = 1;
  currentNetworkObjectGroupsPage = 1;
  perPage = 20;
  ModalMode = ModalMode;

  networkObjects: NetworkObject[] = [];
  networkObjectGroups: NetworkObjectGroup[] = [];

  navIndex = 0;
  showRadio = false;

  public tabs: Tab[] = [{ name: 'Network Objects' }, { name: 'Network Object Groups' }, { name: 'Network Object Group Relations' }];

  private currentDatacenterSubscription: Subscription;
  private currentTierSubscription: Subscription;
  private networkObjectGroupModalSubscription: Subscription;
  private networkObjectModalSubscription: Subscription;

  constructor(
    private datacenterContextService: DatacenterContextService,
    private entityService: EntityService,
    private networkObjectGroupService: V1NetworkSecurityNetworkObjectGroupsService,
    private networkObjectService: V1NetworkSecurityNetworkObjectsService,
    private ngx: NgxSmartModalService,
    private tierContextService: TierContextService,
    private tierService: V1TiersService,
    public helpText: NetworkObjectsGroupsHelpText,
  ) {}

  public handleTabChange(tab: Tab): void {
    this.navIndex = this.tabs.findIndex(t => t.name === tab.name);
    this.getObjectsForNavIndex();
  }

  getNetworkObjects() {
    this.tierService.v1TiersIdGet({ id: this.currentTier.id, join: 'networkObjects' }).subscribe(data => {
      this.networkObjects = data.networkObjects;
    });
  }

  getNetworkObjectGroups() {
    this.networkObjectGroupService
      .v1NetworkSecurityNetworkObjectGroupsGet({
        join: 'networkObjects',
        filter: `tierId||eq||${this.currentTier.id}`,
      })
      .subscribe(data => {
        this.networkObjectGroups = data;
      });
  }

  openNetworkObjectModal(modalMode: ModalMode, networkObject?: NetworkObject) {
    if (modalMode === ModalMode.Edit && !networkObject) {
      throw new Error('Network Object required.');
    }

    const dto = new NetworkObjectModalDto();

    dto.ModalMode = modalMode;
    dto.TierId = this.currentTier.id;

    if (modalMode === ModalMode.Edit) {
      dto.NetworkObject = networkObject;
    }

    this.subscribeToNetworkObjectModal();
    this.datacenterContextService.lockDatacenter();
    this.ngx.setModalData(dto, 'networkObjectModal');
    this.ngx.getModal('networkObjectModal').open();
  }

  openNetworkObjectGroupModal(modalMode: ModalMode, networkObjectGroup?: NetworkObjectGroup) {
    if (modalMode === ModalMode.Edit && !networkObjectGroup) {
      throw new Error('Network Object required.');
    }

    const dto = new NetworkObjectGroupModalDto();

    dto.ModalMode = modalMode;
    dto.TierId = this.currentTier.id;

    if (modalMode === ModalMode.Edit) {
      dto.NetworkObjectGroup = networkObjectGroup;
    }

    this.subscribeToNetworkObjectGroupModal();
    this.datacenterContextService.lockDatacenter();
    this.ngx.setModalData(dto, 'networkObjectGroupModal');
    this.ngx.getModal('networkObjectGroupModal').open();
  }

  subscribeToNetworkObjectModal() {
    this.networkObjectModalSubscription = this.ngx.getModal('networkObjectModal').onCloseFinished.subscribe(() => {
      this.getNetworkObjects();
      this.ngx.resetModalData('networkObjectModal');
      this.datacenterContextService.unlockDatacenter();
    });
  }

  subscribeToNetworkObjectGroupModal() {
    this.networkObjectGroupModalSubscription = this.ngx.getModal('networkObjectGroupModal').onCloseFinished.subscribe(() => {
      this.getNetworkObjectGroups();
      this.ngx.resetModalData('networkObjectGroupModal');
      this.datacenterContextService.unlockDatacenter();
    });
  }

  public deleteNetworkObject(networkObject: NetworkObject): void {
    this.entityService.deleteEntity(networkObject, {
      entityName: 'Network Object',
      delete$: this.networkObjectService.v1NetworkSecurityNetworkObjectsIdDelete({ id: networkObject.id }),
      softDelete$: this.networkObjectService.v1NetworkSecurityNetworkObjectsIdSoftDelete({ id: networkObject.id }),
      onSuccess: () => this.getNetworkObjects(),
    });
  }

  restoreNetworkObject(networkObject: NetworkObject) {
    if (networkObject.deletedAt) {
      this.networkObjectService.v1NetworkSecurityNetworkObjectsIdRestorePatch({ id: networkObject.id }).subscribe(() => {
        this.getNetworkObjects();
      });
    }
  }

  public deleteNetworkObjectGroup(networkObjectGroup: NetworkObjectGroup): void {
    this.entityService.deleteEntity(networkObjectGroup, {
      entityName: 'Network Object Group',
      delete$: this.networkObjectGroupService.v1NetworkSecurityNetworkObjectGroupsIdDelete({
        id: networkObjectGroup.id,
      }),
      softDelete$: this.networkObjectGroupService.v1NetworkSecurityNetworkObjectGroupsIdSoftDelete({
        id: networkObjectGroup.id,
      }),
      onSuccess: () => this.getNetworkObjectGroups(),
    });
  }

  restoreNetworkObjectGroup(networkObjectGroup: NetworkObjectGroup) {
    if (networkObjectGroup.deletedAt) {
      this.networkObjectGroupService
        .v1NetworkSecurityNetworkObjectGroupsIdRestorePatch({
          id: networkObjectGroup.id,
        })
        .subscribe(() => {
          this.getNetworkObjectGroups();
        });
    }
  }

  getObjectsForNavIndex() {
    if (!this.currentTier) {
      return;
    }

    if (this.navIndex === 0) {
      this.getNetworkObjects();
    } else {
      this.getNetworkObjectGroups();
    }
  }

  importNetworkObjectsConfig(event: NetworkObject[]): void {
    const modalDto = new YesNoModalDto(
      'Import Network Objects',
      `Are you sure you would like to import ${event.length} network object${event.length > 1 ? 's' : ''}?`,
    );
    const onConfirm = () => {
      const dto = this.sanitizeData(event);
      this.networkObjectService
        .v1NetworkSecurityNetworkObjectsBulkPost({
          generatedNetworkObjectBulkDto: { bulk: dto },
        })
        .subscribe(() => {
          this.getNetworkObjects();
        });
    };

    const onClose = () => {
      this.showRadio = false;
    };

    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm, onClose);
  }

  importNetworkObjectGroupRelationsConfig(event) {
    const modalDto = new YesNoModalDto(
      'Import Network Object Group Relations',
      `Are you sure you would like to import ${event.length} network object group relation${event.length > 1 ? 's' : ''}?`,
    );
    const onConfirm = () => {
      const networkObjectRelationsDto = {} as NetworkObjectGroupRelationBulkImportCollectionDto;
      networkObjectRelationsDto.datacenterId = this.datacenterContextService.currentDatacenterValue.id;
      networkObjectRelationsDto.networkObjectRelations = event;

      this.networkObjectGroupService
        .v1NetworkSecurityNetworkObjectGroupsBulkImportRelationsPost({
          networkObjectGroupRelationBulkImportCollectionDto: networkObjectRelationsDto,
        })
        .subscribe(() => {
          this.getNetworkObjects();
        });
    };

    const onClose = () => {
      this.showRadio = false;
    };

    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm, onClose);
  }

  importNetworkObjectGroupsConfig(event) {
    const modalDto = new YesNoModalDto(
      'Import Network Object Groups',
      `Are you sure you would like to import ${event.length} network object group${event.length > 1 ? 's' : ''}?`,
    );

    const onConfirm = () => {
      const dto = this.sanitizeData(event);
      this.networkObjectGroupService
        .v1NetworkSecurityNetworkObjectGroupsBulkPost({
          generatedNetworkObjectGroupBulkDto: { bulk: dto },
        })
        .subscribe(() => {
          this.getNetworkObjectGroups();
        });
    };

    const onClose = () => {
      this.showRadio = false;
    };

    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm, onClose);
  }

  sanitizeData(entities: any) {
    return entities.map(entity => {
      this.mapToCsv(entity);
      return entity;
    });
  }

  mapToCsv = obj => {
    Object.entries(obj).forEach(([key, val]) => {
      if (val === 'false' || val === 'f') {
        obj[key] = false;
      }
      if (val === 'true' || val === 't') {
        obj[key] = true;
      }
      if (val === null || val === '') {
        delete obj[key];
      }
      if (key === 'ipAddress') {
        obj[key] = String(val).trim();
      }
      if (key === 'vrf_name') {
        obj[key] = ObjectUtil.getObjectId(val as string, this.tiers);
        obj.tierId = obj[key];
        delete obj[key];
      }
    });
    return obj;
    // tslint:disable-next-line: semicolon
  };

  ngOnInit() {
    this.currentDatacenterSubscription = this.datacenterContextService.currentDatacenter.subscribe(cd => {
      if (cd) {
        this.tiers = cd.tiers;
        this.networkObjects = [];
        this.networkObjectGroups = [];

        if (cd.tiers.length) {
          this.getObjectsForNavIndex();
        }
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
      this.networkObjectModalSubscription,
      this.networkObjectGroupModalSubscription,
      this.currentDatacenterSubscription,
      this.currentTierSubscription,
    ]);
  }
}
