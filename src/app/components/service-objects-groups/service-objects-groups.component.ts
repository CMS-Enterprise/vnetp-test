import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { Subscription } from 'rxjs';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { Tier } from 'client/model/tier';
import {
  V1TiersService,
  ServiceObject,
  V1NetworkSecurityServiceObjectsService,
  ServiceObjectGroup,
  V1NetworkSecurityServiceObjectGroupsService,
  ServiceObjectGroupRelationBulkImportCollectionDto,
} from 'client';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { ServiceObjectModalDto } from 'src/app/models/service-objects/service-object-modal-dto';
import { ServiceObjectGroupModalDto } from 'src/app/models/service-objects/service-object-group-modal-dto';
import { TierContextService } from 'src/app/services/tier-context.service';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { Tab } from 'src/app/common/tabs/tabs.component';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import { EntityService } from 'src/app/services/entity.service';

@Component({
  selector: 'app-service-objects-groups',
  templateUrl: './service-objects-groups.component.html',
})
export class ServiceObjectsGroupsComponent implements OnInit, OnDestroy {
  tiers: Tier[];
  currentTier: Tier;

  currentServiceObjectsPage = 1;
  currentServiceObjectGroupsPage = 1;
  perPage = 20;
  ModalMode = ModalMode;

  serviceObjects: ServiceObject[] = [];
  serviceObjectGroups: ServiceObjectGroup[] = [];

  navIndex = 0;
  showRadio = false;

  public tabs: Tab[] = [{ name: 'Service Objects' }, { name: 'Service Object Groups' }, { name: 'Service Object Group Relations' }];

  private serviceObjectModalSubscription: Subscription;
  private serviceObjectGroupModalSubscription: Subscription;
  private currentDatacenterSubscription: Subscription;
  private currentTierSubscription: Subscription;

  constructor(
    private datacenterContextService: DatacenterContextService,
    private entityService: EntityService,
    private ngx: NgxSmartModalService,
    private serviceObjectGroupService: V1NetworkSecurityServiceObjectGroupsService,
    private serviceObjectService: V1NetworkSecurityServiceObjectsService,
    private tierContextService: TierContextService,
    private tierService: V1TiersService,
  ) {}

  public handleTabChange(tab: Tab): void {
    this.navIndex = this.tabs.findIndex(t => t.name === tab.name);
    this.getObjectsForNavIndex();
  }

  getServiceObjects() {
    this.tierService.getOneTier({ id: this.currentTier.id, join: ['serviceObjects'] }).subscribe(data => {
      this.serviceObjects = data.serviceObjects;
    });
  }

  getServiceObjectGroups() {
    this.serviceObjectGroupService
      .getManyServiceObjectGroup({
        join: ['serviceObjects'],
        filter: [`tierId||eq||${this.currentTier.id}`],
      })
      .subscribe((data: unknown) => {
        this.serviceObjectGroups = data as ServiceObjectGroup[];
      });
  }

  openServiceObjectModal(modalMode: ModalMode, serviceObject?: ServiceObject) {
    if (modalMode === ModalMode.Edit && !serviceObject) {
      throw new Error('Service Object required');
    }

    const dto = new ServiceObjectModalDto();

    dto.ModalMode = modalMode;
    dto.TierId = this.currentTier.id;

    if (modalMode === ModalMode.Edit) {
      dto.ServiceObject = serviceObject;
    }

    this.subscribeToServiceObjectModal();
    this.datacenterContextService.lockDatacenter();
    this.ngx.setModalData(dto, 'serviceObjectModal');
    this.ngx.getModal('serviceObjectModal').open();
  }

  openServiceObjectGroupModal(modalMode: ModalMode, serviceObjectGroup?: ServiceObjectGroup) {
    if (modalMode === ModalMode.Edit && !serviceObjectGroup) {
      throw new Error('Service Object required');
    }

    const dto = new ServiceObjectGroupModalDto();

    dto.ModalMode = modalMode;
    dto.TierId = this.currentTier.id;

    if (modalMode === ModalMode.Edit) {
      dto.ServiceObjectGroup = serviceObjectGroup;
    }

    this.subscribeToServiceObjectGroupModal();
    this.datacenterContextService.lockDatacenter();
    this.ngx.setModalData(dto, 'serviceObjectGroupModal');
    this.ngx.getModal('serviceObjectGroupModal').open();
  }

  subscribeToServiceObjectModal() {
    this.serviceObjectModalSubscription = this.ngx.getModal('serviceObjectModal').onCloseFinished.subscribe(() => {
      this.getServiceObjects();
      this.ngx.resetModalData('serviceObjectModal');
      this.datacenterContextService.unlockDatacenter();
    });
  }

  subscribeToServiceObjectGroupModal() {
    this.serviceObjectGroupModalSubscription = this.ngx.getModal('serviceObjectGroupModal').onCloseFinished.subscribe(() => {
      this.getServiceObjectGroups();
      this.ngx.resetModalData('serviceObjectGroupModal');
      this.datacenterContextService.unlockDatacenter();
    });
  }

  public deleteServiceObject(serviceObject: ServiceObject): void {
    this.entityService.deleteEntity(serviceObject, {
      entityName: 'Service Object',
      delete$: this.serviceObjectService.deleteOneServiceObject({ id: serviceObject.id }),
      softDelete$: this.serviceObjectService.softDeleteOneServiceObject({ id: serviceObject.id }),
      onSuccess: () => this.getServiceObjects(),
    });
  }

  restoreServiceObject(serviceObject: ServiceObject) {
    if (serviceObject.deletedAt) {
      this.serviceObjectService.restoreOneServiceObject({ id: serviceObject.id }).subscribe(() => {
        this.getServiceObjects();
      });
    }
  }

  public deleteServiceObjectGroup(serviceObjectGroup: ServiceObjectGroup): void {
    this.entityService.deleteEntity(serviceObjectGroup, {
      entityName: 'Service Object Group',
      delete$: this.serviceObjectGroupService.deleteOneServiceObjectGroup({
        id: serviceObjectGroup.id,
      }),
      softDelete$: this.serviceObjectGroupService.softDeleteOneServiceObjectGroup({
        id: serviceObjectGroup.id,
      }),
      onSuccess: () => this.getServiceObjectGroups(),
    });
  }

  restoreServiceObjectGroup(serviceObjectGroup: ServiceObjectGroup) {
    if (serviceObjectGroup.deletedAt) {
      this.serviceObjectGroupService
        .restoreOneServiceObjectGroup({
          id: serviceObjectGroup.id,
        })
        .subscribe(() => {
          this.getServiceObjectGroups();
        });
    }
  }

  getObjectsForNavIndex() {
    if (!this.currentTier) {
      return;
    }

    if (this.navIndex === 0) {
      this.getServiceObjects();
    } else {
      this.getServiceObjectGroups();
    }
  }

  public importServiceObjectsConfig(event: ServiceObject[]): void {
    const modalDto = new YesNoModalDto(
      'Import Service Objects',
      `Are you sure you would like to import ${event.length} service object${event.length > 1 ? 's' : ''}?`,
    );

    const onConfirm = () => {
      const dto = this.sanitizeData(event);
      this.serviceObjectService
        .createManyServiceObject({
          createManyServiceObjectDto: { bulk: dto },
        })
        .subscribe(() => {
          this.getServiceObjects();
        });
    };

    const onClose = () => {
      this.showRadio = false;
    };

    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm, onClose);
  }

  public importServiceObjectGroupRelationsConfig(event: any): void {
    const modalDto = new YesNoModalDto(
      'Import Service Object Group Relations',
      `Are you sure you would like to import ${event.length} service object group relation${event.length > 1 ? 's' : ''}?`,
    );
    const onConfirm = () => {
      const serviceObjectRelationsDto = {} as ServiceObjectGroupRelationBulkImportCollectionDto;
      serviceObjectRelationsDto.datacenterId = this.datacenterContextService.currentDatacenterValue.id;
      serviceObjectRelationsDto.serviceObjectRelations = event;

      this.serviceObjectGroupService
        .bulkImportRelationsServiceObjectGroupServiceObject({
          serviceObjectGroupRelationBulkImportCollectionDto: serviceObjectRelationsDto,
        })
        .subscribe(() => {
          this.getServiceObjects();
        });
    };

    const onClose = () => {
      this.showRadio = false;
    };

    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm, onClose);
  }

  public importServiceObjectGroupsConfig(event: any): void {
    const modalDto = new YesNoModalDto(
      'Import Service Object Groups',
      `Are you sure you would like to import ${event.length} service object group${event.length > 1 ? 's' : ''}?`,
    );
    const onConfirm = () => {
      const dto = this.sanitizeData(event);
      this.serviceObjectGroupService
        .createManyServiceObjectGroup({
          createManyServiceObjectGroupDto: { bulk: dto },
        })
        .subscribe(() => {
          this.getServiceObjectGroups();
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
      if (val === null || val === '') {
        delete obj[key];
      }
      if (key === 'type' || key === 'protocol') {
        obj[key] = String(val).toUpperCase();
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
        this.serviceObjects = [];
        this.serviceObjectGroups = [];

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
      this.serviceObjectModalSubscription,
      this.serviceObjectGroupModalSubscription,
      this.currentDatacenterSubscription,
      this.currentTierSubscription,
    ]);
  }
}
