import { Component, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { Subscription, forkJoin } from 'rxjs';
import { FirewallRuleModalDto } from 'src/app/models/firewall/firewall-rule-modal-dto';
import { FirewallRuleScope } from 'src/app/models/other/firewall-rule-scope';
import {
  V1NetworkSecurityFirewallRuleGroupsService,
  FirewallRule,
  FirewallRuleGroup,
  NetworkObject,
  NetworkObjectGroup,
  ServiceObject,
  ServiceObjectGroup,
  V1TiersService,
  V1NetworkSecurityFirewallRulesService,
  Tier,
  FirewallRuleImportCollectionDto,
  V1NetworkSecurityNetworkObjectsService,
  V1NetworkSecurityNetworkObjectGroupsService,
  V1NetworkSecurityServiceObjectsService,
  V1NetworkSecurityServiceObjectGroupsService,
  FirewallRuleImport,
  FirewallRulePreview,
  GetManyFirewallRuleResponseDto,
} from 'client';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { PreviewModalDto } from 'src/app/models/other/preview-modal-dto';
import { TableConfig } from 'src/app/common/table/table.component';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import { EntityService } from 'src/app/services/entity.service';
import { SearchColumnConfig } from '../../../common/search-bar/search-bar.component';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { TableContextService } from 'src/app/services/table-context.service';

@Component({
  selector: 'app-firewall-rules-detail',
  templateUrl: './firewall-rules-detail.component.html',
})
export class FirewallRulesDetailComponent implements OnInit, OnDestroy {
  public searchColumns: SearchColumnConfig[] = [];
  Id = '';
  TierName = '';
  currentTierIds: string[];
  ModalMode = ModalMode;

  firewallRuleGroup: FirewallRuleGroup;
  firewallRules = {} as GetManyFirewallRuleResponseDto;
  latestRuleIndex;

  // Pagination
  perPage = 50;
  public tableComponentDto = new TableComponentDto();

  // Relations
  networkObjects: NetworkObject[];
  networkObjectGroups: NetworkObjectGroup[];
  serviceObjects: ServiceObject[];
  serviceObjectGroups: ServiceObjectGroup[];
  tiers: Tier[];

  firewallRuleModalSubscription: Subscription;

  scope: FirewallRuleScope;
  TierId: string;
  FirewallRuleGroup: FirewallRuleGroup;
  currentDatacenterSubscription: Subscription;

  tableHeaders: string[] = [
    'Name',
    'Action',
    'Protocol',
    'Direction',
    'Source Address',
    'Destination Address',
    'Service',
    'Log',
    'Enabled',
    'Rule Index',
    '',
  ];

  public isLoading = false;

  // Templates
  @ViewChild('sourceAddress') sourceAddressTemplate: TemplateRef<any>;
  @ViewChild('destinationAddress') destinationAddressTemplate: TemplateRef<any>;
  @ViewChild('serviceType') serviceTemplate: TemplateRef<any>;
  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

  public config: TableConfig<any> = {
    description: 'Firewall Rules for the currently selected Tier',
    columns: [
      { name: 'Name', property: 'name' },
      { name: 'Action', property: 'action' },
      { name: 'Protocol', property: 'protocol' },
      { name: 'Direction', property: 'direction' },
      { name: 'Source Address', template: () => this.sourceAddressTemplate },
      { name: 'Destination Address', template: () => this.destinationAddressTemplate },
      { name: 'Service Type', template: () => this.serviceTemplate },
      { name: 'Log', property: 'logging' },
      { name: 'Enabled', property: 'enabled' },
      { name: 'Rule Index', property: 'ruleIndex' },
      { name: '', template: () => this.actionsTemplate },
    ],
  };

  get scopeString() {
    return this.scope;
  }

  constructor(
    private route: ActivatedRoute,
    private ngx: NgxSmartModalService,
    private entityService: EntityService,
    private firewallRuleService: V1NetworkSecurityFirewallRulesService,
    private firewallRuleGroupService: V1NetworkSecurityFirewallRuleGroupsService,
    private tierService: V1TiersService,
    private networkObjectService: V1NetworkSecurityNetworkObjectsService,
    private networkObjectGroupService: V1NetworkSecurityNetworkObjectGroupsService,
    private serviceObjectService: V1NetworkSecurityServiceObjectsService,
    private serviceObjectGroupService: V1NetworkSecurityServiceObjectGroupsService,
    private datacenterService: DatacenterContextService,
    private tableContextService: TableContextService,
  ) {}

  ngOnInit(): void {
    this.currentDatacenterSubscription = this.datacenterService.currentDatacenter.subscribe(cd => {
      if (cd) {
        this.tiers = cd.tiers;
        this.datacenterService.lockDatacenter();
        this.Id += this.route.snapshot.paramMap.get('id');
        this.currentTierIds = this.datacenterService.currentTiersValue;
        this.getFirewallRuleGroup();
      }
    });
  }

  ngOnDestroy(): void {
    this.currentDatacenterSubscription.unsubscribe();
    this.datacenterService.unlockDatacenter();
  }

  refresh(): void {
    this.getFirewallRuleGroup();
  }

  public onTableEvent(event: TableComponentDto): void {
    this.tableComponentDto = event;
    this.getFirewallRules(event);
  }

  getFirewallRuleGroup(): void {
    this.firewallRuleGroupService
      .getOneFirewallRuleGroup({
        id: this.Id,
      })
      .subscribe(data => {
        this.FirewallRuleGroup = {
          name: data.name,
          type: data.type,
          id: data.id,
        } as FirewallRuleGroup;

        this.TierId = data.tierId;

        this.getObjects();
        this.getFirewallRuleLastIndex();
      });
  }

  getFirewallRules(event?): void {
    this.isLoading = true;
    let eventParams;
    if (event) {
      this.tableComponentDto.page = event.page ? event.page : 1;
      this.tableComponentDto.perPage = event.perPage ? event.perPage : 50;
      const { searchText } = event;
      const propertyName = event.searchColumn ? event.searchColumn : null;
      if (propertyName) {
        eventParams = propertyName + '||cont||' + searchText;
      }
    } else {
      this.tableComponentDto.perPage = this.perPage;
    }
    this.firewallRuleService
      .getManyFirewallRule({
        filter: [`firewallRuleGroupId||eq||${this.FirewallRuleGroup.id}`, eventParams],
        page: this.tableComponentDto.page,
        limit: this.tableComponentDto.perPage,
        sort: ['ruleIndex,ASC'],
      })
      .subscribe(
        response => {
          // TODO: Review this approach, see if we can resolve
          // this in the generated client.
          this.firewallRules = response;
          // this.totalFirewallRules = result.total;
        },
        () => {
          this.firewallRules = null;
        },
        () => {
          this.isLoading = false;
        },
      );
  }

  getFirewallRuleLastIndex(): void {
    this.firewallRuleService
      .getManyFirewallRule({
        filter: [`firewallRuleGroupId||eq||${this.FirewallRuleGroup.id}`],
        page: 1,
        limit: 1,
        sort: ['ruleIndex,DESC'],
      })
      .subscribe(response => {
        // TODO: Review this approach, see if we can resolve
        // this in the generated client.
        if (response.data[0]) {
          this.latestRuleIndex = response.data[0].ruleIndex;
        }
      });
  }

  getObjects(): void {
    const tierRequest = this.tierService.getOneTier({ id: this.TierId });
    const networkObjectRequest = this.networkObjectService.getManyNetworkObject({
      filter: [`tierId||eq||${this.TierId}`, `deletedAt||isnull`],
      fields: ['id,name'],
      sort: ['updatedAt,ASC'],
      page: 1,
      limit: 50000,
    });
    const networkObjectGroupRequest = this.networkObjectGroupService.getManyNetworkObjectGroup({
      filter: [`tierId||eq||${this.TierId}`, `deletedAt||isnull`],
      fields: ['id,name'],
      sort: ['updatedAt,ASC'],
      page: 1,
      limit: 50000,
    });
    const serviceObjectRequest = this.serviceObjectService.getManyServiceObject({
      filter: [`tierId||eq||${this.TierId}`, `deletedAt||isnull`],
      fields: ['id,name'],
      sort: ['updatedAt,ASC'],
      page: 1,
      limit: 50000,
    });
    const serviceObjectGroupRequest = this.serviceObjectGroupService.getManyServiceObjectGroup({
      filter: [`tierId||eq||${this.TierId}`, `deletedAt||isnull`],
      fields: ['id,name'],
      sort: ['updatedAt,ASC'],
      page: 1,
      limit: 50000,
    });

    forkJoin([tierRequest, networkObjectRequest, networkObjectGroupRequest, serviceObjectRequest, serviceObjectGroupRequest]).subscribe(
      result => {
        this.TierName = result[0].name;
        this.networkObjects = result[1].data;
        this.networkObjectGroups = result[2].data;
        this.serviceObjects = result[3].data;
        this.serviceObjectGroups = result[4].data;

        this.getFirewallRules();
      },
    );
  }

  createFirewallRule(): void {
    this.openFirewallRuleModal(ModalMode.Create);
  }

  openFirewallRuleModal(modalMode: ModalMode, firewallRule?: FirewallRule): void {
    if (modalMode === ModalMode.Edit && !firewallRule) {
      throw new Error('Firewall Rule Required');
    }

    const dto = new FirewallRuleModalDto();
    dto.FirewallRuleGroupId = this.Id;
    dto.TierId = this.TierId;
    dto.ModalMode = modalMode;
    dto.NetworkObjects = this.networkObjects;
    dto.NetworkObjectGroups = this.networkObjectGroups;
    dto.ServiceObjects = this.serviceObjects;
    dto.ServiceObjectGroups = this.serviceObjectGroups;

    if (modalMode === ModalMode.Edit) {
      dto.FirewallRule = firewallRule;
    } else {
      dto.FirewallRule = {} as FirewallRule;
      dto.FirewallRule.ruleIndex = this.latestRuleIndex + 1;
    }

    this.subscribeToFirewallRuleModal();
    this.ngx.setModalData(dto, 'firewallRuleModal');
    this.ngx.getModal('firewallRuleModal').open();
  }

  subscribeToFirewallRuleModal(): void {
    this.firewallRuleModalSubscription = this.ngx.getModal('firewallRuleModal').onCloseFinished.subscribe(() => {
      this.getFirewallRuleGroup();
      this.ngx.resetModalData('firewallRuleModal');
    });
  }

  public getServiceObjectName = (id: string) => ObjectUtil.getObjectName(id, this.serviceObjects);
  public getServiceObjectGroupName = (id: string): string => ObjectUtil.getObjectName(id, this.serviceObjectGroups);
  public getNetworkObjectName = (id: string): string => ObjectUtil.getObjectName(id, this.networkObjects);
  public getNetworkObjectGroupName = (id: string): string => ObjectUtil.getObjectName(id, this.networkObjectGroups);

  public deleteFirewallRule(firewallRule: FirewallRule): void {
    this.entityService.deleteEntity(firewallRule, {
      entityName: 'Firewall Rule',
      delete$: this.firewallRuleService.deleteOneFirewallRule({ id: firewallRule.id }),
      softDelete$: this.firewallRuleService.softDeleteOneFirewallRule({ id: firewallRule.id }),
      onSuccess: () => {
        const params = this.tableContextService.getSearchLocalStorage();
        const { filteredResults } = params;
        if (filteredResults) {
          this.tableComponentDto.searchColumn = params.searchColumn;
          this.tableComponentDto.searchText = params.searchText;
          this.getFirewallRules(this.tableComponentDto);
        } else {
          this.getFirewallRules();
        }
      },
    });
  }

  restoreFirewallRule(firewallRule: FirewallRule): void {
    if (firewallRule.deletedAt) {
      this.firewallRuleService.restoreOneFirewallRule({ id: firewallRule.id }).subscribe(() => {
        const params = this.tableContextService.getSearchLocalStorage();
        const { filteredResults } = params;
        if (filteredResults) {
          this.tableComponentDto.searchColumn = params.searchColumn;
          this.tableComponentDto.searchText = params.searchText;
          this.getFirewallRules(this.tableComponentDto);
        } else {
          this.getFirewallRules();
        }
      });
    }
  }

  importFirewallRulesConfig(event: FirewallRuleImport[]): void {
    const fwDto: FirewallRuleImportCollectionDto = {
      datacenterId: this.datacenterService.currentDatacenterValue.id,
      firewallRules: this.sanitizeData(event),
      dryRun: true,
    };

    this.firewallRuleService
      .bulkImportFirewallRulesFirewallRule({
        firewallRuleImportCollectionDto: fwDto,
      })
      .subscribe(data => {
        this.createPreview(data, event);
      });
  }

  private sanitizeData(entities: FirewallRuleImport[]): FirewallRuleImport[] {
    return entities.map((entity: FirewallRuleImport) => {
      entity.ruleIndex = Number(entity.ruleIndex);
      this.mapCsv(entity);
      return entity;
    });
  }

  private mapCsv(entity: FirewallRuleImport): FirewallRuleImport {
    Object.entries(entity).forEach(([key, val]) => {
      if (val === 'FALSE' || val === 'false' || val === 'f' || val === 'F') {
        entity[key] = false;
      }
      if (val === 'TRUE' || val === 'true' || val === 't' || val === 'T') {
        entity[key] = true;
      }
      if (val === null || val === '') {
        delete entity[key];
      }
    });
    return entity;
  }

  private createPreview(data: FirewallRulePreview, firewallRules: FirewallRuleImport[]): void {
    const { firewallRulesToBeUploaded, firewallRulesToBeDeleted } = data;
    const fwData = { data: firewallRulesToBeUploaded };
    const tableConfig: TableConfig<FirewallRule> = {
      description: 'Firewall Rules Import Preview',
      columns: [
        { name: 'Name', property: 'name' },
        { name: 'Action', property: 'action' },
        { name: 'Protocol', property: 'protocol' },
        { name: 'Direction', property: 'direction' },
        { name: 'Source Address', template: () => this.sourceAddressTemplate },
        { name: 'Destination Address', template: () => this.destinationAddressTemplate },
        { name: 'Service', template: () => this.serviceTemplate },
        { name: 'Rule Index', property: 'ruleIndex' },
      ],
      rowStyle: (firewallRule: FirewallRule) => (firewallRule.hasOwnProperty('id') ? { background: '#e6ffed' } : { background: '#e6ffed' }),
    };
    const previewModalDto = new PreviewModalDto(tableConfig, fwData as any);
    this.ngx.setModalData(previewModalDto, 'previewModal');
    this.ngx.getModal('previewModal').open();

    const previewImportSubscription = this.ngx.getModal('previewModal').onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
      const modalData: PreviewModalDto<FirewallRule> = modal.getData();
      modal.removeData();
      if (modalData && modalData.confirm) {
        const firewallConfirmDto: FirewallRuleImportCollectionDto = {
          datacenterId: this.datacenterService.currentDatacenterValue.id,
          firewallRules: this.sanitizeData(firewallRules),
          dryRun: false,
        };

        this.firewallRuleService
          .bulkImportFirewallRulesFirewallRule({
            firewallRuleImportCollectionDto: firewallConfirmDto,
          })
          .subscribe(() => {
            this.getFirewallRuleGroup();
          });
      }
      previewImportSubscription.unsubscribe();
    });
  }
}
