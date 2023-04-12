import { Component, OnInit, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { Subscription } from 'rxjs';
import { NetworkObjectModalDto } from 'src/app/models/network-objects/network-object-modal-dto';
import { NetworkObjectGroupModalDto } from 'src/app/models/network-objects/network-object-group-modal-dto';
import { NetworkObjectsGroupsHelpText } from 'src/app/helptext/help-text-networking';
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
  V1NetworkSecurityFirewallRulesService,
  V1NetworkSecurityNatRulesService,
  V1NetworkSecurityFirewallRuleGroupsService,
  V1NetworkSecurityNatRuleGroupsService,
} from 'client';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { TierContextService } from 'src/app/services/tier-context.service';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { Tab } from 'src/app/common/tabs/tabs.component';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import { EntityService } from 'src/app/services/entity.service';
import { TableConfig } from '../../common/table/table.component';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { SearchColumnConfig } from 'src/app/common/seach-bar/search-bar.component';
import { TableContextService } from 'src/app/services/table-context.service';

@Component({
  selector: 'app-network-objects-groups',
  templateUrl: './network-objects-groups.component.html',
})
export class NetworkObjectsGroupsComponent implements OnInit, OnDestroy {
  tiers: Tier[];
  FWRuleGroups;
  natRuleGroups;
  firewallRules;
  natRules;
  allNetworkObjects;
  allNetworkObjectGroups;
  usedObjects = { networkObjects: [], networkObjectGroups: [] };
  unusedObjects = {
    fwRuleNetworkObjects: [],
    fwRuleNetworkObjectGroups: [],
    natRuleNetworkObjects: [],
    natRuleNetworkObjectGroups: [],
    globalUnusedObjects: [],
    globalUnusedObjectGroups: [],
    data: [],
  };
  currentTier: Tier;
  perPage = 20;
  ModalMode = ModalMode;

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
  private unusedObjectsModalSubscription: Subscription;

  public isLoadingObjects = false;
  public isLoadingGroups = false;

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;
  @ViewChild('membersTemplate') membersTemplate: TemplateRef<any>;
  @ViewChild('addressTemplate') addressTemplate: TemplateRef<any>;
  @ViewChild('natServiceTemplate') natServiceTemplate: TemplateRef<any>;
  @ViewChild('objStateTemplate') objStateTemplate: TemplateRef<any>;
  @ViewChild('groupStateTemplate') groupStateTemplate: TemplateRef<any>;

  public objectSearchColumns: SearchColumnConfig[] = [];

  public groupSearchColumns: SearchColumnConfig[] = [];

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

  constructor(
    private datacenterContextService: DatacenterContextService,
    private entityService: EntityService,
    private networkObjectGroupService: V1NetworkSecurityNetworkObjectGroupsService,
    private networkObjectService: V1NetworkSecurityNetworkObjectsService,
    private ngx: NgxSmartModalService,
    private tierContextService: TierContextService,
    private tierService: V1TiersService,
    public helpText: NetworkObjectsGroupsHelpText,
    private tableContextService: TableContextService,
    private firewallRuleService: V1NetworkSecurityFirewallRulesService,
    private firewallRuleGroupService: V1NetworkSecurityFirewallRuleGroupsService,
    private natRuleGroupService: V1NetworkSecurityNatRuleGroupsService,
    private natRuleService: V1NetworkSecurityNatRulesService,
  ) {}

  public getFirewallRuleGroups(): void {
    this.firewallRuleGroupService
      .getManyFirewallRuleGroup({
        filter: [`tierId||eq||${this.currentTier.id}`],
      })
      .subscribe(data => {
        this.FWRuleGroups = data;
      });
  }

  public getNatRuleGroups(): void {
    this.natRuleGroupService
      .getManyNatRuleGroup({
        filter: [`tierId||eq||${this.currentTier.id}`],
      })
      .subscribe(data => {
        this.natRuleGroups = data;
      });
  }

  public checkGroupMembership(): void {
    this.allNetworkObjectGroups.forEach(netObjGrp => {
      netObjGrp.networkObjects.forEach(netObj => {
        this.usedObjects.networkObjects.push(netObj.id);
      });
    });
  }

  public getFirewallRules(): void {
    this.usedObjects.networkObjects = [];
    this.usedObjects.networkObjectGroups = [];
    this.unusedObjects.fwRuleNetworkObjectGroups = [];
    this.unusedObjects.fwRuleNetworkObjects = [];
    this.unusedObjects.natRuleNetworkObjects = [];
    this.unusedObjects.natRuleNetworkObjectGroups = [];

    const externalId = this.FWRuleGroups.find(group => {
      if (group.name === 'External') {
        return group;
      }
    }).id;

    const intervrfId = this.FWRuleGroups.find(group => {
      if (group.name === 'Intervrf') {
        return group;
      }
    }).id;

    this.checkGroupMembership();

    this.firewallRuleService
      .getManyFirewallRule({
        filter: [`firewallRuleGroupId||eq||${externalId}`],
        or: [`firewallRuleGroupId||eq||${intervrfId}`],
        sort: ['ruleIndex,ASC'],
        limit: 50000,
      })
      .subscribe(data => {
        this.firewallRules = data;

        this.firewallRules.forEach(rule => {
          this.allNetworkObjects.forEach(netObj => {
            const exists = Object.values(rule).includes(netObj.id);
            if (exists) {
              this.usedObjects.networkObjects.push(netObj.id);
            }
          });

          this.allNetworkObjectGroups.forEach(netObjGrp => {
            const exists = Object.values(rule).includes(netObjGrp.id);
            if (exists) {
              this.usedObjects.networkObjectGroups.push(netObjGrp.id);
            }
          });
        });

        const netObjGroupSet = [...new Set(this.usedObjects.networkObjectGroups)];
        const netObjSet = [...new Set(this.usedObjects.networkObjects)];
        const unusedObjectGroups = this.allNetworkObjectGroups.filter(netObjGrp => !netObjGroupSet.includes(netObjGrp.id));
        const unusedObjects = this.allNetworkObjects.filter(netObj => !netObjSet.includes(netObj.id));
        this.unusedObjects.fwRuleNetworkObjects.push(...unusedObjects);
        this.unusedObjects.fwRuleNetworkObjectGroups.push(...unusedObjectGroups);
        const unusedObjSet = Array.from(new Set(this.unusedObjects.fwRuleNetworkObjects)).filter(
          (v, i, a) => a.findIndex(v2 => v2.id === v.id) === i,
        );
        const unusedObjGroupSet = Array.from(new Set(this.unusedObjects.fwRuleNetworkObjectGroups)).filter(
          (v, i, a) => a.findIndex(v2 => v2.id === v.id) === i,
        );
        this.unusedObjects.fwRuleNetworkObjects = unusedObjSet;
        this.unusedObjects.fwRuleNetworkObjectGroups = unusedObjGroupSet;
      });
    this.getNatRules();
  }

  public getNatRules(): void {
    const externalId = this.natRuleGroups.find(group => {
      if (group.name === 'External') {
        return group;
      }
    }).id;

    const intervrfId = this.natRuleGroups.find(group => {
      if (group.name === 'Intervrf') {
        return group;
      }
    }).id;
    this.natRuleService
      .getManyNatRule({
        filter: [`natRuleGroupId||eq||${externalId}`],
        or: [`natRuleGroupId||eq||${intervrfId}`],
        limit: 50000,
      })
      .subscribe(data => {
        this.natRules = data;
        this.natRules.forEach(rule => {
          this.allNetworkObjects.forEach(netObj => {
            const exists = Object.values(rule).includes(netObj.id);
            if (exists) {
              this.usedObjects.networkObjects.push(netObj.id);
            }
          });
          this.allNetworkObjectGroups.forEach(netObjGrp => {
            const exists = Object.values(rule).includes(netObjGrp.id);
            if (exists) {
              this.usedObjects.networkObjectGroups.push(netObjGrp.id);
            }
          });
        });
        const netObjGroupSet = [...new Set(this.usedObjects.networkObjectGroups)];
        const netObjSet = [...new Set(this.usedObjects.networkObjects)];
        const unusedObjectGroups = this.allNetworkObjectGroups.filter(netObjGrp => !netObjGroupSet.includes(netObjGrp.id));
        const unusedObjects = this.allNetworkObjects.filter(netObj => !netObjSet.includes(netObj.id));
        this.unusedObjects.natRuleNetworkObjects.push(...unusedObjects);
        this.unusedObjects.natRuleNetworkObjectGroups.push(...unusedObjectGroups);
        const unusedObjSet = Array.from(new Set(this.unusedObjects.natRuleNetworkObjects)).filter(
          (v, i, a) => a.findIndex(v2 => v2.id === v.id) === i,
        );
        const unusedObjGroupSet = Array.from(new Set(this.unusedObjects.natRuleNetworkObjectGroups)).filter(
          (v, i, a) => a.findIndex(v2 => v2.id === v.id) === i,
        );
        this.unusedObjects.natRuleNetworkObjects = unusedObjSet;
        this.unusedObjects.natRuleNetworkObjectGroups = unusedObjGroupSet;
        this.getDelta();
      });
  }

  private getDelta(): void {
    const objectsToRemove = [];
    const objectGroupsToRemove = [];
    this.unusedObjects.fwRuleNetworkObjects.map(unusedObj => {
      if (this.usedObjects.networkObjects.includes(unusedObj.id)) {
        objectsToRemove.push(unusedObj);
      }
    });
    this.unusedObjects.fwRuleNetworkObjectGroups.map(unusedObjGrp => {
      if (this.usedObjects.networkObjectGroups.includes(unusedObjGrp.id)) {
        objectGroupsToRemove.push(unusedObjGrp);
      }
    });
    objectsToRemove.map(obj => {
      this.unusedObjects.fwRuleNetworkObjects.splice(this.unusedObjects.fwRuleNetworkObjects.indexOf(obj), 1);
    });
    objectGroupsToRemove.map(objGrp => {
      this.unusedObjects.fwRuleNetworkObjectGroups.splice(this.unusedObjects.fwRuleNetworkObjectGroups.indexOf(objGrp), 1);
    });

    this.unusedObjects.globalUnusedObjects.push(...this.unusedObjects.fwRuleNetworkObjects);
    this.unusedObjects.globalUnusedObjects.push(...this.unusedObjects.natRuleNetworkObjects);
    this.unusedObjects.globalUnusedObjectGroups.push(...this.unusedObjects.fwRuleNetworkObjectGroups);
    this.unusedObjects.globalUnusedObjectGroups.push(...this.unusedObjects.natRuleNetworkObjectGroups);
    const netObjSet = [...new Set(this.unusedObjects.globalUnusedObjects)];
    const netObjGroupSet = [...new Set(this.unusedObjects.globalUnusedObjectGroups)];
    this.unusedObjects.globalUnusedObjects = netObjSet;
    this.unusedObjects.globalUnusedObjectGroups = netObjGroupSet;
    delete this.unusedObjects.fwRuleNetworkObjects;
    delete this.unusedObjects.fwRuleNetworkObjectGroups;
    delete this.unusedObjects.natRuleNetworkObjects;
    delete this.unusedObjects.natRuleNetworkObjectGroups;
    this.openUnusedObjectsModal();
  }

  public getAllNetworkObjectsAndGroups(): void {
    this.networkObjectService
      .getManyNetworkObject({
        filter: [`tierId||eq||${this.currentTier.id}`, `deletedAt||isnull`],
        limit: 50000,
      })
      .subscribe(data => {
        this.allNetworkObjects = data;
      });

    this.networkObjectGroupService
      .getManyNetworkObjectGroup({
        filter: [`tierId||eq||${this.currentTier.id}`, `deletedAt||isnull`],
        join: ['networkObjects'],
        limit: 50000,
      })
      .subscribe(data => {
        this.allNetworkObjectGroups = data;
      });
  }

  public subscribeToUnusedObjectsModal(): void {
    this.unusedObjectsModalSubscription = this.ngx.getModal('unusedObjectsModal').onCloseFinished.subscribe(() => {
      this.ngx.resetModalData('unusedObjectsModal');
      this.unusedObjects.fwRuleNetworkObjects = [];
      this.unusedObjects.fwRuleNetworkObjectGroups = [];
      this.unusedObjects.natRuleNetworkObjects = [];
      this.unusedObjects.natRuleNetworkObjectGroups = [];
      this.unusedObjects.globalUnusedObjects = [];
      this.unusedObjects.globalUnusedObjectGroups = [];
      this.unusedObjects.data = [];
      this.getNetworkObjects();
      this.getAllNetworkObjectsAndGroups();
      this.unusedObjectsModalSubscription.unsubscribe();
    });
  }

  public openUnusedObjectsModal(): void {
    this.unusedObjects.globalUnusedObjects.map(obj => {
      obj.type = 'Network Object';
    });
    this.unusedObjects.globalUnusedObjectGroups.map(obj => {
      obj.type = 'Network Object Group';
    });
    this.unusedObjects.data.push(...this.unusedObjects.globalUnusedObjects);
    this.unusedObjects.data.push(...this.unusedObjects.globalUnusedObjectGroups);
    this.subscribeToUnusedObjectsModal();
    this.ngx.getModal('unusedObjectsModal').open();
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

  getNetworkObjects(event?): void {
    let eventParams;
    this.isLoadingObjects = true;
    if (event) {
      this.netObjTableComponentDto.page = event.page ? event.page : 1;
      this.netObjTableComponentDto.perPage = event.perPage ? event.perPage : 20;
      const { searchText } = event;
      const propertyName = event.searchColumn ? event.searchColumn : null;
      if (propertyName) {
        eventParams = `${propertyName}||cont||${searchText}`;
      }
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
      const propertyName = event.searchColumn ? event.searchColumn : null;
      if (propertyName) {
        eventParams = `${propertyName}||cont||${searchText}`;
      }
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
      const { filteredResults } = params;

      // if filtered results boolean is true, apply search params in the
      // subsequent get call
      if (filteredResults) {
        this.netObjTableComponentDto.searchColumn = params.searchColumn;
        this.netObjTableComponentDto.searchText = params.searchText;
        this.getNetworkObjects(this.netObjTableComponentDto);
      } else {
        this.getNetworkObjects();
      }
      this.getAllNetworkObjectsAndGroups();
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
      this.getAllNetworkObjectsAndGroups();
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
        const { filteredResults } = params;

        // if filtered results boolean is true, apply search params in the
        // subsequent get call
        if (filteredResults) {
          this.netObjTableComponentDto.searchColumn = params.searchColumn;
          this.netObjTableComponentDto.searchText = params.searchText;
          this.getNetworkObjects(this.netObjTableComponentDto);
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
        const { filteredResults } = params;

        // if filtered results boolean is true, apply search params in the
        // subsequent get call
        if (filteredResults) {
          this.netObjTableComponentDto.searchColumn = params.searchColumn;
          this.netObjTableComponentDto.searchText = params.searchText;
          this.getNetworkObjects(this.netObjTableComponentDto);
        } else {
          this.getNetworkObjects();
        }
        this.getAllNetworkObjectsAndGroups();
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
        }
      }
    });

    this.currentTierSubscription = this.tierContextService.currentTier.subscribe(ct => {
      if (ct) {
        this.currentTier = ct;
        this.getObjectsForNavIndex();
        this.getFirewallRuleGroups();
        this.getNatRuleGroups();
        this.getAllNetworkObjectsAndGroups();
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
