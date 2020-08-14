import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { Subscription } from 'rxjs';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { Tier } from 'api_client/model/tier';
import {
  V1TiersService,
  ServiceObject,
  V1NetworkSecurityServiceObjectsService,
  ServiceObjectGroup,
  V1NetworkSecurityServiceObjectGroupsService,
  ServiceObjectGroupRelationBulkImportCollectionDto,
} from 'api_client';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { ServiceObjectModalDto } from 'src/app/models/service-objects/service-object-modal-dto';
import { ServiceObjectGroupModalDto } from 'src/app/models/service-objects/service-object-group-modal-dto';
import { TierContextService } from 'src/app/services/tier-context.service';
import SubscriptionUtil from 'src/app/utils/subscription.util';
import { Tab } from 'src/app/common/tabs/tabs.component';
import ObjectUtil from 'src/app/utils/object.util';

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

  serviceObjectModalSubscription: Subscription;
  serviceObjectGroupModalSubscription: Subscription;
  currentDatacenterSubscription: Subscription;
  currentTierSubscription: Subscription;

  constructor(
    private ngx: NgxSmartModalService,
    public datacenterService: DatacenterContextService,
    public tierContextService: TierContextService,
    private tierService: V1TiersService,
    private serviceObjectService: V1NetworkSecurityServiceObjectsService,
    private serviceObjectGroupService: V1NetworkSecurityServiceObjectGroupsService,
  ) {}

  public handleTabChange(tab: Tab): void {
    this.navIndex = this.tabs.findIndex(t => t.name === tab.name);
    this.getObjectsForNavIndex();
  }

  getServiceObjects() {
    this.tierService.v1TiersIdGet({ id: this.currentTier.id, join: 'serviceObjects' }).subscribe(data => {
      this.serviceObjects = data.serviceObjects;
    });
  }

  getServiceObjectGroups() {
    this.serviceObjectGroupService
      .v1NetworkSecurityServiceObjectGroupsGet({
        join: 'serviceObjects',
        filter: `tierId||eq||${this.currentTier.id}`,
      })
      .subscribe(data => {
        this.serviceObjectGroups = data;
      });
  }

  openServiceObjectModal(modalMode: ModalMode, serviceObject?: ServiceObject) {
    if (modalMode === ModalMode.Edit && !serviceObject) {
      throw new Error('Service Object required.');
    }

    const dto = new ServiceObjectModalDto();

    dto.ModalMode = modalMode;
    dto.TierId = this.currentTier.id;

    if (modalMode === ModalMode.Edit) {
      dto.ServiceObject = serviceObject;
    }

    this.subscribeToServiceObjectModal();
    this.datacenterService.lockDatacenter();
    this.ngx.setModalData(dto, 'serviceObjectModal');
    this.ngx.getModal('serviceObjectModal').open();
  }

  openServiceObjectGroupModal(modalMode: ModalMode, serviceObjectGroup?: ServiceObjectGroup) {
    if (modalMode === ModalMode.Edit && !serviceObjectGroup) {
      throw new Error('Service Object required.');
    }

    const dto = new ServiceObjectGroupModalDto();

    dto.ModalMode = modalMode;
    dto.TierId = this.currentTier.id;

    if (modalMode === ModalMode.Edit) {
      dto.ServiceObjectGroup = serviceObjectGroup;
    }

    this.subscribeToServiceObjectGroupModal();
    this.datacenterService.lockDatacenter();
    this.ngx.setModalData(dto, 'serviceObjectGroupModal');
    this.ngx.getModal('serviceObjectGroupModal').open();
  }

  subscribeToServiceObjectModal() {
    this.serviceObjectModalSubscription = this.ngx
      .getModal('serviceObjectModal')
      .onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
        this.getServiceObjects();
        this.ngx.resetModalData('serviceObjectModal');
        this.datacenterService.unlockDatacenter();
      });
  }

  subscribeToServiceObjectGroupModal() {
    this.serviceObjectGroupModalSubscription = this.ngx
      .getModal('serviceObjectGroupModal')
      .onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
        this.getServiceObjectGroups();
        this.ngx.resetModalData('serviceObjectGroupModal');
        this.datacenterService.unlockDatacenter();
      });
  }

  deleteServiceObject(serviceObject: ServiceObject) {
    if (serviceObject.provisionedAt) {
      throw new Error('Cannot delete provisioned object.');
    }

    const deleteDescription = serviceObject.deletedAt ? 'Delete' : 'Soft-Delete';

    const deleteFunction = () => {
      if (!serviceObject.deletedAt) {
        this.serviceObjectService.v1NetworkSecurityServiceObjectsIdSoftDelete({ id: serviceObject.id }).subscribe(data => {
          this.getServiceObjects();
        });
      } else {
        this.serviceObjectService.v1NetworkSecurityServiceObjectsIdDelete({ id: serviceObject.id }).subscribe(data => {
          this.getServiceObjects();
        });
      }
    };

    this.confirmDeleteObject(
      new YesNoModalDto(
        `${deleteDescription} Service Object?`,
        `Do you want to ${deleteDescription} service object "${serviceObject.name}"?`,
      ),
      deleteFunction,
    );
  }

  restoreServiceObject(serviceObject: ServiceObject) {
    if (serviceObject.deletedAt) {
      this.serviceObjectService.v1NetworkSecurityServiceObjectsIdRestorePatch({ id: serviceObject.id }).subscribe(data => {
        this.getServiceObjects();
      });
    }
  }

  deleteServiceObjectGroup(serviceObjectGroup: ServiceObjectGroup) {
    if (serviceObjectGroup.provisionedAt) {
      throw new Error('Cannot delete provisioned object.');
    }

    const deleteDescription = serviceObjectGroup.deletedAt ? 'Delete' : 'Soft-Delete';

    const deleteFunction = () => {
      if (!serviceObjectGroup.deletedAt) {
        this.serviceObjectGroupService
          .v1NetworkSecurityServiceObjectGroupsIdSoftDelete({
            id: serviceObjectGroup.id,
          })
          .subscribe(data => {
            this.getServiceObjectGroups();
          });
      } else {
        this.serviceObjectGroupService
          .v1NetworkSecurityServiceObjectGroupsIdDelete({
            id: serviceObjectGroup.id,
          })
          .subscribe(data => {
            this.getServiceObjectGroups();
          });
      }
    };

    this.confirmDeleteObject(
      new YesNoModalDto(
        `${deleteDescription} Service Object Group`,
        `Do you want to ${deleteDescription} the service object group "${serviceObjectGroup.name}"?`,
      ),
      deleteFunction,
    );
  }

  restoreServiceObjectGroup(serviceObjectGroup: ServiceObjectGroup) {
    if (serviceObjectGroup.deletedAt) {
      this.serviceObjectGroupService
        .v1NetworkSecurityServiceObjectGroupsIdRestorePatch({
          id: serviceObjectGroup.id,
        })
        .subscribe(data => {
          this.getServiceObjectGroups();
        });
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

  private unsubAll() {
    SubscriptionUtil.unsubscribe([
      this.serviceObjectModalSubscription,
      this.serviceObjectGroupModalSubscription,
      this.currentDatacenterSubscription,
      this.currentTierSubscription,
    ]);
  }

  importServiceObjectsConfig(event: ServiceObject[]) {
    const modalDto = new YesNoModalDto(
      'Import Service Objects',
      `Are you sure you would like to import ${event.length} service object${event.length > 1 ? 's' : ''}?`,
    );
    this.ngx.setModalData(modalDto, 'yesNoModal');
    this.ngx.getModal('yesNoModal').open();

    const yesNoModalSubscription = this.ngx.getModal('yesNoModal').onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
      const modalData = modal.getData() as YesNoModalDto;
      modal.removeData();
      if (modalData && modalData.modalYes) {
        const dto = this.sanitizeData(event);
        this.serviceObjectService
          .v1NetworkSecurityServiceObjectsBulkPost({
            generatedServiceObjectBulkDto: { bulk: dto },
          })
          .subscribe(data => {
            this.getServiceObjects();
          });
      }
      this.showRadio = false;
      yesNoModalSubscription.unsubscribe();
    });
  }

  importServiceObjectGroupRelationsConfig(event) {
    const modalDto = new YesNoModalDto(
      'Import Service Object Group Relations',
      `Are you sure you would like to import ${event.length} service object group relation${event.length > 1 ? 's' : ''}?`,
    );
    this.ngx.setModalData(modalDto, 'yesNoModal');
    this.ngx.getModal('yesNoModal').open();

    const yesNoModalSubscription = this.ngx.getModal('yesNoModal').onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
      const modalData = modal.getData() as YesNoModalDto;
      modal.removeData();
      if (modalData && modalData.modalYes) {
        const serviceObjectRelationsDto = {} as ServiceObjectGroupRelationBulkImportCollectionDto;
        serviceObjectRelationsDto.datacenterId = this.datacenterService.currentDatacenterValue.id;
        serviceObjectRelationsDto.serviceObjectRelations = event;

        this.serviceObjectGroupService
          .v1NetworkSecurityServiceObjectGroupsBulkImportRelationsPost({
            serviceObjectGroupRelationBulkImportCollectionDto: serviceObjectRelationsDto,
          })
          .subscribe(data => {
            this.getServiceObjects();
          });
      }
      this.showRadio = false;
      yesNoModalSubscription.unsubscribe();
    });
  }

  importServiceObjectGroupsConfig(event) {
    const modalDto = new YesNoModalDto(
      'Import Service Object Groups',
      `Are you sure you would like to import ${event.length} service object group${event.length > 1 ? 's' : ''}?`,
    );
    this.ngx.setModalData(modalDto, 'yesNoModal');
    this.ngx.getModal('yesNoModal').open();

    const yesNoModalSubscription = this.ngx.getModal('yesNoModal').onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
      const modalData = modal.getData() as YesNoModalDto;
      modal.removeData();
      if (modalData && modalData.modalYes) {
        const dto = this.sanitizeData(event);
        this.serviceObjectGroupService
          .v1NetworkSecurityServiceObjectGroupsBulkPost({
            generatedServiceObjectGroupBulkDto: { bulk: dto },
          })
          .subscribe(data => {
            this.getServiceObjectGroups();
          });
      }
      this.showRadio = false;
      yesNoModalSubscription.unsubscribe();
    });
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
    this.currentDatacenterSubscription = this.datacenterService.currentDatacenter.subscribe(cd => {
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
    this.unsubAll();
  }
}
