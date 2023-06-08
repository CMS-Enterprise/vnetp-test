import { Component, OnInit, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
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
  GetManyServiceObjectResponseDto,
  GetManyServiceObjectGroupResponseDto,
} from 'client';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { ServiceObjectModalDto } from 'src/app/models/service-objects/service-object-modal-dto';
import { ServiceObjectGroupModalDto } from 'src/app/models/service-objects/service-object-group-modal-dto';
import { TierContextService } from 'src/app/services/tier-context.service';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { Tab } from 'src/app/common/tabs/tabs.component';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import { EntityService } from 'src/app/services/entity.service';
import { TableConfig } from '../../common/table/table.component';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { SearchColumnConfig } from 'src/app/common/seach-bar/search-bar.component';
import { TableContextService } from 'src/app/services/table-context.service';
import { FilteredCount } from 'src/app/helptext/help-text-networking';

@Component({
  selector: 'app-service-objects-groups',
  templateUrl: './service-objects-groups.component.html',
})
export class ServiceObjectsGroupsComponent implements OnInit, OnDestroy {
  tiers: Tier[];
  currentTier: Tier;
  public perPage = 20;
  ModalMode = ModalMode;

  serviceObjects = {} as GetManyServiceObjectResponseDto;
  serviceObjectGroups = {} as GetManyServiceObjectGroupResponseDto;

  public svcObjTableComponentDto = new TableComponentDto();
  public svcObjGrpTableComponentDto = new TableComponentDto();

  navIndex = 0;
  showRadio = false;

  public tabs: Tab[] = [{ name: 'Service Objects' }, { name: 'Service Object Groups' }, { name: 'Service Object Group Relations' }];
  public objectSearchColumns: SearchColumnConfig[] = [
    { displayName: 'Type', propertyName: 'protocol' },
    { displayName: 'Source Port', propertyName: 'sourcePorts' },
    { displayName: 'Destination Port', propertyName: 'destinationPorts' },
  ];

  public groupSearchColumns: SearchColumnConfig[] = [
    {
      displayName: 'Type',
      propertyName: 'type',
    },
  ];

  private serviceObjectModalSubscription: Subscription;
  private serviceObjectGroupModalSubscription: Subscription;
  private currentDatacenterSubscription: Subscription;
  private currentTierSubscription: Subscription;

  public isLoadingObjects = false;
  public isLoadingGroups = false;

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;
  @ViewChild('membersTemplate') membersTemplate: TemplateRef<any>;
  @ViewChild('objStateTemplate') objStateTemplate: TemplateRef<any>;
  @ViewChild('groupStateTemplate') groupStateTemplate: TemplateRef<any>;

  public serviceObjectConfig: TableConfig<any> = {
    description: 'Service Objects consist of source and destination ports',
    columns: [
      { name: 'Name', property: 'name' },
      { name: 'Type', property: 'protocol' },
      { name: 'Source Port', property: 'sourcePorts' },
      { name: 'Destination Port', property: 'destinationPorts' },
      { name: 'State', template: () => this.objStateTemplate },
      { name: '', template: () => this.actionsTemplate },
    ],
  };

  public serviceObjectGroupConfig: TableConfig<any> = {
    description: 'Service Object Groups are a collection of Service Objects',
    columns: [
      { name: 'Name', property: 'name' },
      { name: 'Type', property: 'type' },
      { name: 'Members', template: () => this.membersTemplate },
      { name: 'State', template: () => this.groupStateTemplate },
      { name: '', template: () => this.actionsTemplate },
    ],
  };

  constructor(
    private datacenterContextService: DatacenterContextService,
    private entityService: EntityService,
    private ngx: NgxSmartModalService,
    private serviceObjectGroupService: V1NetworkSecurityServiceObjectGroupsService,
    private serviceObjectService: V1NetworkSecurityServiceObjectsService,
    private tierContextService: TierContextService,
    private tierService: V1TiersService,
    private tableContextService: TableContextService,
    public filteredHelpText: FilteredCount,
  ) {}

  public onSvcObjTableEvent(event: TableComponentDto): void {
    this.svcObjTableComponentDto = event;
    this.getServiceObjects(event);
  }
  public onSvcObjGrpTableEvent(event: TableComponentDto): void {
    this.svcObjGrpTableComponentDto = event;
    this.getServiceObjectGroups(event);
  }

  public handleTabChange(tab: Tab): void {
    // if user clicks on the same tab that they are currently on, don't load any new objects
    if (this.navIndex === this.tabs.findIndex(t => t.name === tab.name)) {
      return;
    }
    this.tableContextService.removeSearchLocalStorage();
    this.navIndex = this.tabs.findIndex(t => t.name === tab.name);
    this.getObjectsForNavIndex();
  }

  getServiceObjects(event?): void {
    this.isLoadingObjects = true;
    let eventParams;

    if (typeof event === 'string') {
      this.serviceObjectService
        .getManyServiceObject({
          s: `{"tierId": {"$eq": "${this.currentTier.id}"}, "$or": [${event}]}`,
          page: 1,
          limit: 5000,
        })
        .subscribe(data => {
          this.serviceObjects = data;
          this.isLoadingObjects = false;
        }),
        () => {},
        () => {
          this.isLoadingObjects = false;
        };
      return;
    }
    if (event) {
      this.svcObjTableComponentDto.page = event.page ? event.page : 1;
      this.svcObjTableComponentDto.perPage = event.perPage ? event.perPage : 20;
      const { searchText } = event;
      this.svcObjTableComponentDto.searchText = searchText;
      const propertyName = event.searchColumn ? event.searchColumn : null;
      if (propertyName === 'protocol') {
        eventParams = `${propertyName}||eq||${searchText}`;
      } else if (propertyName) {
        eventParams = `${propertyName}||cont||${searchText}`;
      }
    } else {
      this.svcObjTableComponentDto.searchText = undefined;
    }
    this.serviceObjectService
      .getManyServiceObject({
        filter: [`tierId||eq||${this.currentTier.id}`, eventParams],
        page: this.svcObjTableComponentDto.page,
        limit: this.svcObjTableComponentDto.perPage,
        sort: ['name,ASC'],
      })
      .subscribe(
        response => {
          this.serviceObjects = response;
        },
        () => {
          this.serviceObjects = null;
          this.getServiceObjects();
        },
        () => {
          this.isLoadingObjects = false;
        },
      );
  }

  getServiceObjectGroups(event?): void {
    this.isLoadingGroups = true;
    let eventParams;
    if (event) {
      this.svcObjGrpTableComponentDto.page = event.page ? event.page : 1;
      this.svcObjGrpTableComponentDto.perPage = event.perPage ? event.perPage : 20;
      const { searchText } = event;
      this.svcObjGrpTableComponentDto.searchText = searchText;
      const propertyName = event.searchColumn ? event.searchColumn : null;
      if (propertyName === 'type') {
        eventParams = `${propertyName}||eq||${searchText}`;
      } else if (propertyName) {
        eventParams = `${propertyName}||cont||${searchText}`;
      }
    } else {
      this.svcObjGrpTableComponentDto.searchText = undefined;
    }
    this.serviceObjectGroupService
      .getManyServiceObjectGroup({
        join: ['serviceObjects'],
        filter: [`tierId||eq||${this.currentTier.id}`, eventParams],
        page: this.svcObjGrpTableComponentDto.page,
        limit: this.svcObjGrpTableComponentDto.perPage,
        sort: ['name,ASC'],
      })
      .subscribe(
        response => {
          this.serviceObjectGroups = response;
        },
        () => {
          this.serviceObjectGroups = null;
          this.getServiceObjectGroups();
        },
        () => {
          this.isLoadingGroups = false;
        },
      );
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
      // get search params from local storage
      const params = this.tableContextService.getSearchLocalStorage();
      let { filteredResults, searchString } = params;

      // if filtered results boolean is true, apply search params in the
      // subsequent get call
      if (filteredResults && !searchString) {
        this.svcObjTableComponentDto.searchColumn = params.searchColumn;
        this.svcObjTableComponentDto.searchText = params.searchText;
        this.getServiceObjects(this.svcObjTableComponentDto);
      } else if (filteredResults && searchString) {
        this.getServiceObjects(searchString);
      } else {
        this.getServiceObjects();
      }
      this.ngx.resetModalData('serviceObjectModal');
      this.datacenterContextService.unlockDatacenter();
    });
  }

  subscribeToServiceObjectGroupModal() {
    this.serviceObjectGroupModalSubscription = this.ngx.getModal('serviceObjectGroupModal').onCloseFinished.subscribe(() => {
      // get search params from local storage
      const params = this.tableContextService.getSearchLocalStorage();
      const { filteredResults } = params;

      // if filtered results boolean is true, apply search params in the
      // subsequent get call
      if (filteredResults) {
        this.svcObjGrpTableComponentDto.searchColumn = params.searchColumn;
        this.svcObjGrpTableComponentDto.searchText = params.searchText;
        this.getServiceObjectGroups(this.svcObjGrpTableComponentDto);
      } else {
        this.getServiceObjectGroups();
      }
      this.ngx.resetModalData('serviceObjectGroupModal');
      this.datacenterContextService.unlockDatacenter();
    });
  }

  public deleteServiceObject(serviceObject: ServiceObject): void {
    this.entityService.deleteEntity(serviceObject, {
      entityName: 'Service Object',
      delete$: this.serviceObjectService.deleteOneServiceObject({ id: serviceObject.id }),
      softDelete$: this.serviceObjectService.softDeleteOneServiceObject({ id: serviceObject.id }),
      onSuccess: () => {
        // get search params from local storage
        const params = this.tableContextService.getSearchLocalStorage();
        const { filteredResults } = params;

        // if filtered results boolean is true, apply search params in the
        // subsequent get call
        if (filteredResults) {
          this.svcObjTableComponentDto.searchColumn = params.searchColumn;
          this.svcObjTableComponentDto.searchText = params.searchText;
          this.getServiceObjects(this.svcObjTableComponentDto);
        } else {
          this.getServiceObjects();
        }
      },
    });
  }

  restoreServiceObject(serviceObject: ServiceObject) {
    if (serviceObject.deletedAt) {
      this.serviceObjectService.restoreOneServiceObject({ id: serviceObject.id }).subscribe(() => {
        // get search params from local storage
        const params = this.tableContextService.getSearchLocalStorage();
        const { filteredResults } = params;

        // if filtered results boolean is true, apply search params in the
        // subsequent get call
        if (filteredResults) {
          this.svcObjTableComponentDto.searchColumn = params.searchColumn;
          this.svcObjTableComponentDto.searchText = params.searchText;
          this.getServiceObjects(this.svcObjTableComponentDto);
        } else {
          this.getServiceObjects();
        }
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
      onSuccess: () => {
        // get search params from local storage
        const params = this.tableContextService.getSearchLocalStorage();
        const { filteredResults } = params;

        // if filtered results boolean is true, apply search params in the
        // subsequent get call
        if (filteredResults) {
          this.svcObjGrpTableComponentDto.searchColumn = params.searchColumn;
          this.svcObjGrpTableComponentDto.searchText = params.searchText;
          this.getServiceObjectGroups(this.svcObjGrpTableComponentDto);
        } else {
          this.getServiceObjectGroups();
        }
      },
    });
  }

  restoreServiceObjectGroup(serviceObjectGroup: ServiceObjectGroup) {
    if (serviceObjectGroup.deletedAt) {
      this.serviceObjectGroupService
        .restoreOneServiceObjectGroup({
          id: serviceObjectGroup.id,
        })
        .subscribe(() => {
          // get search params from local storage
          const params = this.tableContextService.getSearchLocalStorage();
          const { filteredResults } = params;

          // if filtered results boolean is true, apply search params in the
          // subsequent get call
          if (filteredResults) {
            this.svcObjGrpTableComponentDto.searchColumn = params.searchColumn;
            this.svcObjGrpTableComponentDto.searchText = params.searchText;
            this.getServiceObjectGroups(this.svcObjGrpTableComponentDto);
          } else {
            this.getServiceObjectGroups();
          }
        });
    }
  }

  getObjectsForNavIndex() {
    if (!this.currentTier) {
      return;
    }

    if (this.navIndex === 0) {
      this.svcObjGrpTableComponentDto.page = 1;
      this.svcObjGrpTableComponentDto.perPage = 20;
      this.getServiceObjects();
    } else {
      this.svcObjTableComponentDto.page = 1;
      this.svcObjTableComponentDto.perPage = 20;
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
          this.getServiceObjectGroups();
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
        this.serviceObjects = null;
        this.serviceObjectGroups = null;

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
