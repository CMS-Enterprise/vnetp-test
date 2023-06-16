import { Component, OnInit, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { Subscription } from 'rxjs';
import { NetworkObjectModalDto } from 'src/app/models/network-objects/network-object-modal-dto';
import { NetworkObjectGroupModalDto } from 'src/app/models/network-objects/network-object-group-modal-dto';
import { FilteredCount, NetworkObjectsGroupsHelpText } from 'src/app/helptext/help-text-networking';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { Tier } from 'client/model/tier';
import {
  V1TiersService,
  NetworkObject,
  V1NetworkSecurityNetworkObjectsService,
  NetworkObjectGroup,
  V1NetworkSecurityNetworkObjectGroupsService,
  NetworkObjectGroupRelationBulkImportCollectionDto,
  GetManyNetworkObjectResponseDto,
  GetManyNetworkObjectGroupResponseDto,
} from 'client';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { TierContextService } from 'src/app/services/tier-context.service';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { Tab } from 'src/app/common/tabs/tabs.component';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import { EntityService } from 'src/app/services/entity.service';
import { TableConfig } from '../../common/table/table.component';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { SearchColumnConfig } from 'src/app/common/search-bar/search-bar.component';
import { TableContextService } from 'src/app/services/table-context.service';
import { GenericService } from 'src/app/services/generic.service';

@Component({
  selector: 'app-network-objects-groups',
  templateUrl: './network-objects-groups.component.html',
})
export class NetworkObjectsGroupsComponent implements OnInit, OnDestroy {
  tiers: Tier[];
  currentTier: Tier;
  perPage = 20;
  ModalMode = ModalMode;
  filteredResults: boolean;

  networkObjects = {} as GetManyNetworkObjectResponseDto;
  networkObjectGroups = {} as GetManyNetworkObjectGroupResponseDto;

  public netObjTableComponentDto = new TableComponentDto();
  public netObjGrpTableComponentDto = new TableComponentDto();

  navIndex = 0;
  showRadio = false;

  public tabs: Tab[] = [{ name: 'Network Objects' }, { name: 'Network Object Groups' }, { name: 'Network Object Group Relations' }];

  private currentDatacenterSubscription: Subscription;
  private currentTierSubscription: Subscription;
  private networkObjectGroupModalSubscription: Subscription;
  private networkObjectModalSubscription: Subscription;

  public isLoadingObjects = false;
  public isLoadingGroups = false;

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;
  @ViewChild('membersTemplate') membersTemplate: TemplateRef<any>;
  @ViewChild('addressTemplate') addressTemplate: TemplateRef<any>;
  @ViewChild('natServiceTemplate') natServiceTemplate: TemplateRef<any>;
  @ViewChild('objStateTemplate') objStateTemplate: TemplateRef<any>;
  @ViewChild('groupStateTemplate') groupStateTemplate: TemplateRef<any>;

  public objectSearchColumns: SearchColumnConfig[] = [
    { displayName: 'IpAddress', propertyName: 'ipAddress' },
    { displayName: 'FQDN', propertyName: 'fqdn' },
    { displayName: 'Start IP', propertyName: 'startIpAddress' },
    { displayName: 'End IP', propertyName: 'endIpAddress' },
  ];

  public groupSearchColumns: SearchColumnConfig[] = [{ displayName: 'Member', propertyName: 'networkObjects' }];

  public networkObjectConfig: TableConfig<any> = {
    description: 'Network Objects can consist of a single host (with NAT/PAT), range or subnet',
    columns: [
      { name: 'Name', property: 'name' },
      { name: 'Type', property: 'type' },
      { name: 'Address', template: () => this.addressTemplate },
      { name: 'Nat Translated IP Address', property: 'natDirection' },
      { name: 'Nat Type', property: 'natType' },
      { name: 'Nat Direction', property: 'natDirection' },
      { name: 'Nat Protocol', property: 'natProtocol' },
      { name: 'NAT Source:Translated Port', template: () => this.natServiceTemplate },
      { name: 'State', template: () => this.objStateTemplate },
      { name: '', template: () => this.actionsTemplate },
    ],
  };

  public networkObjectGroupConfig: TableConfig<any> = {
    description: 'Network Object Groups are a collection of Network Objects',
    columns: [
      { name: 'Name', property: 'name' },
      { name: 'Members', template: () => this.membersTemplate },
      { name: 'State', template: () => this.groupStateTemplate },
      { name: '', template: () => this.actionsTemplate },
    ],
  };

  genericService: GenericService<NetworkObject>;
  methodName = 'getManyNetworkObject';

  constructor(
    private datacenterContextService: DatacenterContextService,
    private entityService: EntityService,
    private networkObjectGroupService: V1NetworkSecurityNetworkObjectGroupsService,
    private networkObjectService: V1NetworkSecurityNetworkObjectsService,
    private ngx: NgxSmartModalService,
    private tierContextService: TierContextService,
    private tierService: V1TiersService,
    public helpText: NetworkObjectsGroupsHelpText,
    public filteredHelpText: FilteredCount,
    private tableContextService: TableContextService,
  ) {
    this.genericService = new GenericService<NetworkObject>();
    this.genericService.setService(this.networkObjectService);
    this.genericService.setMethodName(this.methodName);
  }

  public onNetObjTableEvent(event: TableComponentDto): void {
    this.netObjTableComponentDto = event;
    this.getNetworkObjects(event);
  }
  public onNetObjGrpTableEvent(event: TableComponentDto): void {
    this.netObjGrpTableComponentDto = event;
    this.getNetworkObjectGroups(event);
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

  getNetworkObjects(event?) {
    this.filteredResults = false;
    let eventParams;
    this.isLoadingObjects = true;

    if (typeof event === 'string') {
      this.isLoadingObjects = false;
      this.networkObjectService
        .getManyNetworkObject({
          s: `{"tierId": {"$eq": "${this.currentTier.id}"}, "$or": [${event}]}`,
          page: 1,
          limit: 5000,
          // sort: ['name,ASC'],
        })
        .subscribe(data => {
          this.filteredResults = true;
          this.networkObjects = data;
          this.isLoadingObjects = false;
        }),
        // tslint:disable-next-line
        () => {
          this.networkObjects = null;
          this.getNetworkObjects();
        },
        // tslint:disable-next-line
        () => {
          this.isLoadingObjects = false;
        };
      return;
    }
    if (event) {
      this.netObjTableComponentDto.page = event.page ? event.page : 1;
      this.netObjTableComponentDto.perPage = event.perPage ? event.perPage : 20;
      const { searchText } = event;
      const propertyName = event.searchColumn ? event.searchColumn : null;
      this.netObjTableComponentDto.searchText = searchText;
      if (propertyName === 'ipAddress' || propertyName === 'startIpAddress' || propertyName === 'endIpAddress') {
        eventParams = `${propertyName}||eq||${searchText}`;
      } else if (propertyName) {
        eventParams = `${propertyName}||cont||${searchText}`;
      }
    } else {
      this.netObjTableComponentDto.searchText = undefined;
    }
    this.networkObjectService
      .getManyNetworkObject({
        filter: [`tierId||eq||${this.currentTier.id}`, eventParams],
        page: this.netObjTableComponentDto.page,
        limit: this.netObjTableComponentDto.perPage,
        sort: ['name,ASC'],
      })
      .subscribe(
        response => {
          this.networkObjects = response;
        },
        () => {
          this.networkObjects = null;
          this.getNetworkObjects();
        },
        () => {
          this.isLoadingObjects = false;
        },
      );
  }

  getNetworkObjectGroups(event?): void {
    this.isLoadingGroups = true;
    let eventParams;
    if (event) {
      this.netObjGrpTableComponentDto.page = event.page ? event.page : 1;
      this.netObjGrpTableComponentDto.perPage = event.perPage ? event.perPage : 50;
      const { searchText } = event;
      this.netObjGrpTableComponentDto.searchText = searchText;
      const propertyName = event.searchColumn ? event.searchColumn : null;
      if (propertyName) {
        eventParams = `${propertyName}||cont||${searchText}`;
      }
    } else {
      this.netObjGrpTableComponentDto.searchText = undefined;
    }
    this.networkObjectGroupService
      .getManyNetworkObjectGroup({
        join: ['networkObjects'],
        filter: [`tierId||eq||${this.currentTier.id}`, eventParams],
        page: this.netObjGrpTableComponentDto.page,
        limit: this.netObjGrpTableComponentDto.perPage,
        sort: ['name,ASC'],
      })
      .subscribe(
        response => {
          this.networkObjectGroups = response;
        },
        () => {
          this.networkObjectGroups = null;
          this.getNetworkObjectGroups();
        },
        () => {
          this.isLoadingGroups = false;
        },
      );
  }

  openNetworkObjectModal(modalMode: ModalMode, networkObject?: NetworkObject) {
    if (modalMode === ModalMode.Edit && !networkObject) {
      throw new Error('Network Object required');
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
      throw new Error('Network Object required');
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
      // get search params from local storage
      const params = this.tableContextService.getSearchLocalStorage();
      const { filteredResults, searchString } = params;

      // if filtered results boolean is true, apply search params in the
      // subsequent get call
      if (filteredResults && !searchString) {
        this.netObjTableComponentDto.searchColumn = params.searchColumn;
        this.netObjTableComponentDto.searchText = params.searchText;
        this.getNetworkObjects(this.netObjTableComponentDto);
      } else if (filteredResults && searchString) {
        this.getNetworkObjects(searchString);
      } else {
        this.getNetworkObjects();
      }
      this.ngx.resetModalData('networkObjectModal');
      this.datacenterContextService.unlockDatacenter();
    });
  }

  subscribeToNetworkObjectGroupModal() {
    this.networkObjectGroupModalSubscription = this.ngx.getModal('networkObjectGroupModal').onCloseFinished.subscribe(() => {
      // get search params from local storage
      const params = this.tableContextService.getSearchLocalStorage();
      const { filteredResults } = params;

      // if filtered results boolean is true, apply search params in the
      // subsequent get call
      if (filteredResults) {
        this.netObjGrpTableComponentDto.searchColumn = params.searchColumn;
        this.netObjGrpTableComponentDto.searchText = params.searchText;
        this.getNetworkObjectGroups(this.netObjGrpTableComponentDto);
      } else {
        this.getNetworkObjectGroups();
      }
      this.ngx.resetModalData('networkObjectGroupModal');
      this.datacenterContextService.unlockDatacenter();
    });
  }

  public deleteNetworkObject(networkObject: NetworkObject): void {
    this.entityService.deleteEntity(networkObject, {
      entityName: 'Network Object',
      delete$: this.networkObjectService.deleteOneNetworkObject({ id: networkObject.id }),
      softDelete$: this.networkObjectService.softDeleteOneNetworkObject({ id: networkObject.id }),
      onSuccess: () => {
        // get search params from local storage
        const params = this.tableContextService.getSearchLocalStorage();
        const { filteredResults, searchString } = params;

        // if filtered results boolean is true, apply search params in the
        // subsequent get call
        if (filteredResults && !searchString) {
          this.netObjTableComponentDto.searchColumn = params.searchColumn;
          this.netObjTableComponentDto.searchText = params.searchText;
          this.getNetworkObjects(this.netObjTableComponentDto);
        } else if (filteredResults && searchString) {
          this.getNetworkObjects(searchString);
        } else {
          this.getNetworkObjects();
        }
      },
    });
  }

  restoreNetworkObject(networkObject: NetworkObject) {
    if (networkObject.deletedAt) {
      this.networkObjectService.restoreOneNetworkObject({ id: networkObject.id }).subscribe(() => {
        // get search params from local storage
        const params = this.tableContextService.getSearchLocalStorage();
        const { filteredResults, searchString } = params;

        // if filtered results boolean is true, apply search params in the
        // subsequent get call
        if (filteredResults && !searchString) {
          this.netObjTableComponentDto.searchColumn = params.searchColumn;
          this.netObjTableComponentDto.searchText = params.searchText;
          this.getNetworkObjects(this.netObjTableComponentDto);
        } else if (filteredResults && searchString) {
          this.getNetworkObjects(searchString);
        } else {
          this.getNetworkObjects();
        }
      });
    }
  }

  public deleteNetworkObjectGroup(networkObjectGroup: NetworkObjectGroup): void {
    this.entityService.deleteEntity(networkObjectGroup, {
      entityName: 'Network Object Group',
      delete$: this.networkObjectGroupService.deleteOneNetworkObjectGroup({
        id: networkObjectGroup.id,
      }),
      softDelete$: this.networkObjectGroupService.softDeleteOneNetworkObjectGroup({
        id: networkObjectGroup.id,
      }),
      onSuccess: () => {
        // get search params from local storage
        const params = this.tableContextService.getSearchLocalStorage();
        const { filteredResults } = params;

        // if filtered results boolean is true, apply search params in the
        // subsequent get call
        if (filteredResults) {
          this.netObjGrpTableComponentDto.searchColumn = params.searchColumn;
          this.netObjGrpTableComponentDto.searchText = params.searchText;
          this.getNetworkObjectGroups(this.netObjGrpTableComponentDto);
        } else {
          this.getNetworkObjectGroups();
        }
      },
    });
  }

  restoreNetworkObjectGroup(networkObjectGroup: NetworkObjectGroup) {
    if (networkObjectGroup.deletedAt) {
      this.networkObjectGroupService
        .restoreOneNetworkObjectGroup({
          id: networkObjectGroup.id,
        })
        .subscribe(() => {
          // get search params from local storage
          const params = this.tableContextService.getSearchLocalStorage();
          const { filteredResults } = params;

          // if filtered results boolean is true, apply search params in the
          // subsequent get call
          if (filteredResults) {
            this.netObjGrpTableComponentDto.searchColumn = params.searchColumn;
            this.netObjGrpTableComponentDto.searchText = params.searchText;
            this.getNetworkObjectGroups(this.netObjGrpTableComponentDto);
          } else {
            this.getNetworkObjectGroups();
          }
        });
    }
  }

  getObjectsForNavIndex() {
    if (!this.currentTier) {
      return;
    }

    if (this.navIndex === 0) {
      this.netObjGrpTableComponentDto.page = 1;
      this.netObjGrpTableComponentDto.perPage = 20;
      this.getNetworkObjects();
    } else {
      this.netObjTableComponentDto.page = 1;
      this.netObjTableComponentDto.perPage = 20;
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
        .createManyNetworkObject({
          createManyNetworkObjectDto: { bulk: dto },
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
        .bulkImportRelationsNetworkObjectGroupNetworkObject({
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
        .createManyNetworkObjectGroup({
          createManyNetworkObjectGroupDto: { bulk: dto },
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
      if (key === 'ipAddress' && val !== '') {
        obj[key] = String(val).trim();
      }
      if (key === 'vrf_name') {
        obj[key] = ObjectUtil.getObjectId(val as string, this.tiers);
        obj.tierId = obj[key];
        delete obj[key];
      }
    });
    return obj;
    /* tslint:disable */
  };
  /* tslint:enable */

  ngOnInit() {
    this.currentDatacenterSubscription = this.datacenterContextService.currentDatacenter.subscribe(cd => {
      if (cd) {
        this.tiers = cd.tiers;
        this.networkObjects = null;
        this.networkObjectGroups = null;

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
