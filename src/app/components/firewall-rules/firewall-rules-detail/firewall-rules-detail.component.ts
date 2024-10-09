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
  Zone,
  FirewallRuleImportCollectionDto,
  V1NetworkSecurityNetworkObjectsService,
  V1NetworkSecurityNetworkObjectGroupsService,
  V1NetworkSecurityServiceObjectsService,
  V1NetworkSecurityServiceObjectGroupsService,
  FirewallRuleImport,
  FirewallRulePreview,
  GetManyFirewallRuleResponseDto,
  FirewallRuleDirectionEnum,
  FirewallRuleProtocolEnum,
  V1NetworkSecurityZonesService,
  V1RuntimeDataHitcountService,
  HitcountJobCreateDtoTypeEnum,
  PanosApplication,
  V1RuntimeDataAppIdRuntimeService,
  AppIdRuntimeJobCreateDtoTypeEnum,
} from 'client';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { PreviewModalDto } from 'src/app/models/other/preview-modal-dto';
import { TableConfig } from 'src/app/common/table/table.component';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import { EntityService } from 'src/app/services/entity.service';
import { SearchColumnConfig } from '../../../common/search-bar/search-bar.component';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { TableContextService } from 'src/app/services/table-context.service';
import { AdvancedSearchAdapter } from 'src/app/common/advanced-search/advanced-search.adapter';
import { FirewallRulePacketTracerDto } from '../../../models/firewall/firewall-rule-packet-tracer-dto';
import UndeployedChangesUtil from '../../../utils/UndeployedChangesUtil';
import { RuleOperationModalDto } from '../../../models/rule-operation-modal.dto';
import { RuntimeDataService } from '../../../services/runtime-data.service';
import { LiteTableConfig } from '../../../common/lite-table/lite-table.component';
import { MatDrawer } from '@angular/material/sidenav';
import { AppIdRuntimeService } from '../../app-id-runtime/app-id-runtime.service';
import { TierContextService } from '../../../services/tier-context.service';
import { FirewallRuleModalComponent } from '../firewall-rule-modal/firewall-rule-modal.component';

@Component({
  selector: 'app-firewall-rules-detail',
  templateUrl: './firewall-rules-detail.component.html',
  styleUrls: ['./firewall-rules-detail.component.scss'],
})
export class FirewallRulesDetailComponent implements OnInit, OnDestroy {
  public searchColumns: SearchColumnConfig[] = [
    { displayName: 'Direction', propertyName: 'direction', propertyType: FirewallRuleDirectionEnum },
    { displayName: 'Protocol', propertyName: 'protocol', propertyType: FirewallRuleProtocolEnum },
    { displayName: 'Enabled', propertyName: 'enabled', propertyType: 'boolean' },
    { displayName: 'Source Address', propertyName: 'sourceIpAddress' },
    { displayName: 'Destination Address', propertyName: 'destinationIpAddress' },
    { displayName: 'Source Port', propertyName: 'sourcePorts', searchOperator: 'cont' },
    { displayName: 'Destination Port', propertyName: 'destinationPorts', searchOperator: 'cont' },
  ];
  Id = '';
  TierName = '';
  currentTierIds: string[];
  ModalMode = ModalMode;
  filteredResults: boolean;

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
  packetTracerObjects = new FirewallRulePacketTracerDto();
  zones: Zone[];

  firewallRuleModalSubscription: Subscription;
  packetTracerSubscription: Subscription;

  scope: FirewallRuleScope;
  TierId: string;
  FirewallRuleGroup: FirewallRuleGroup;
  currentDatacenterSubscription: Subscription;

  objectInfoSubscription: Subscription;
  public isLoading = false;

  public firewallRuleOperationModalSubscription: Subscription;
  public firewallRuleGroupName: string;

  isRefreshingRuntimeData = false;
  jobStatus: string;

  appIdModalSubscription: Subscription;
  panosApplications: PanosApplication[] = [];

  infoBoxVisible = false;
  selectedPanosApplication: PanosApplication;

  isRefreshingAppIdRuntimeData = false;
  tier: Tier;
  datacenterId: string;
  appIdJobStatus: string;

  // Templates
  @ViewChild('directionZone') directionZoneTemplate: TemplateRef<any>;
  @ViewChild('sourceAddress') sourceAddressTemplate: TemplateRef<any>;
  @ViewChild('destinationAddress') destinationAddressTemplate: TemplateRef<any>;
  @ViewChild('serviceType') serviceTemplate: TemplateRef<any>;
  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;
  @ViewChild('updatedAt') updatedAtTemplate: TemplateRef<any>;
  @ViewChild('hitcountTemplate') hitcountTemplate: TemplateRef<any>;
  @ViewChild('appIdTemplate') appIdTemplate: TemplateRef<any>;
  @ViewChild('appIdNameTemplate') appIdNameTemplate: TemplateRef<any>;
  @ViewChild('drawer') drawer: MatDrawer;
  @ViewChild(FirewallRuleModalComponent) firewallModal: FirewallRuleModalComponent;

  public config: TableConfig<any> = {
    description: 'Firewall Rules for the currently selected Tier',
    columns: [
      { name: 'Name', property: 'name' },
      { name: 'Action', property: 'action' },
      { name: 'Protocol', property: 'protocol' },
      { name: 'Direction', template: () => this.directionZoneTemplate },
      { name: 'Source Address', template: () => this.sourceAddressTemplate },
      { name: 'Destination Address', template: () => this.destinationAddressTemplate },
      { name: 'Service Type', template: () => this.serviceTemplate },
      { name: 'Log', property: 'logging' },
      { name: 'Enabled', property: 'enabled' },
      { name: 'Rule Index', property: 'ruleIndex' },
      { name: '', template: () => this.actionsTemplate },
    ],
    expandableRows: () => [this.hitcountTemplate, this.appIdTemplate],
  };

  public liteConfig: LiteTableConfig<PanosApplication> = {
    columns: [
      { name: 'Name', template: () => this.appIdNameTemplate },
      { name: 'Category', property: 'category' },
      { name: 'Sub Category', property: 'subCategory' },
      { name: 'Risk', property: 'risk' },
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
    private zoneService: V1NetworkSecurityZonesService,
    private tableContextService: TableContextService,
    private hitcountService: V1RuntimeDataHitcountService,
    private runtimeDataService: RuntimeDataService,
    private appIdService: AppIdRuntimeService,
    private appIdApiService: V1RuntimeDataAppIdRuntimeService,
    private tierContextService: TierContextService,
  ) {
    const advancedSearchAdapterObject = new AdvancedSearchAdapter<FirewallRule>();
    advancedSearchAdapterObject.setService(this.firewallRuleService);
    advancedSearchAdapterObject.setServiceName('V1NetworkSecurityFirewallRulesService');
    this.config.advancedSearchAdapter = advancedSearchAdapterObject;
  }

  ngOnInit(): void {
    this.currentDatacenterSubscription = this.datacenterService.currentDatacenter.subscribe(cd => {
      if (cd) {
        this.datacenterId = cd.id;
        this.tiers = cd.tiers;
        this.datacenterService.lockDatacenter();
        this.Id += this.route.snapshot.paramMap.get('id');
        this.currentTierIds = this.datacenterService.currentTiersValue;
        this.getFirewallRuleGroup();
      }
    });
  }

  toggleDrawer(panosApp: PanosApplication): void {
    if (this.selectedPanosApplication) {
      if (panosApp.id === this.selectedPanosApplication?.id) {
        this.selectedPanosApplication = null;
        this.drawer.close();
        return;
      }
      if (panosApp.id !== this.selectedPanosApplication?.id) {
        this.selectedPanosApplication = panosApp;
        return;
      }
    }

    this.selectedPanosApplication = panosApp;
    this.drawer.toggle();
  }

  refreshAppId(): void {
    if (this.runtimeDataService.isRecentlyRefreshed(this.tier.runtimeDataLastRefreshed) || this.isRefreshingAppIdRuntimeData) {
      return;
    }

    this.isRefreshingAppIdRuntimeData = true;
    this.firewallModal.handleAppIdRefresh(true);

    this.appIdApiService
      .createRuntimeDataJobAppIdRuntime({
        appIdRuntimeJobCreateDto: {
          type: AppIdRuntimeJobCreateDtoTypeEnum.AppIdRuntime,
          tierId: this.TierId,
          datacenterId: this.datacenterId,
        },
      })
      .subscribe(job => {
        let status = '';
        this.runtimeDataService.pollJobStatus(job.id).subscribe({
          next: towerJobDto => {
            status = towerJobDto.status;
          },
          error: () => {
            status = 'error';
            this.isRefreshingRuntimeData = false;
            this.firewallModal.handleAppIdRefresh(false);
            this.appIdJobStatus = status;
          },
          complete: () => {
            this.isRefreshingRuntimeData = false;
            this.firewallModal.handleAppIdRefresh(false);
            if (status === 'successful') {
              this.tierService.getOneTier({ id: this.TierId }).subscribe(tier => {
                this.tier = tier;
                console.log('calling load apps with: ', this.tier.appVersion);
                this.appIdService.loadPanosApplications(this.tier.appVersion);
              });
              this.tierContextService.refreshTiers(this.TierId);
            }
            this.appIdJobStatus = status;
          },
        });
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

  public openFirewallRuleOperationModal(firewallRule: FirewallRule): void {
    const dto: RuleOperationModalDto = {
      tierId: this.TierId,
      ruleId: firewallRule.id,
      sourceRuleGroupId: firewallRule.firewallRuleGroupId,
      ruleGroupName: this.firewallRuleGroupName,
    };
    this.subscribeToFirewallRuleOperationModal();
    this.ngx.setModalData(dto, 'firewallRuleOperationModal');
    this.ngx.open('firewallRuleOperationModal');
  }

  private subscribeToFirewallRuleOperationModal(): void {
    this.firewallRuleOperationModalSubscription = this.ngx.getModal('firewallRuleOperationModal').onCloseFinished.subscribe(() => {
      this.getFirewallRuleGroup();
      this.ngx.resetModalData('firewallRuleOperationModal');
      this.firewallRuleOperationModalSubscription.unsubscribe();
    });
  }

  getFirewallRuleGroup(): void {
    this.firewallRuleGroupService
      .getOneFirewallRuleGroup({
        id: this.Id,
      })
      .subscribe(data => {
        this.FirewallRuleGroup = data;
        this.TierId = data.tierId;
        this.firewallRuleGroupName = data.name;

        this.getObjects();
        this.getFirewallRuleLastIndex();
      });
  }

  getFirewallRules(event?, eventParams?): void {
    this.filteredResults = false;
    this.isLoading = true;
    if (event) {
      this.tableComponentDto.page = event.page ? event.page : 1;
      this.tableComponentDto.perPage = event.perPage ? event.perPage : 50;
      const { searchText } = event;
      const propertyName = event.searchColumn ? event.searchColumn : null;
      if (propertyName === 'sourcePorts' || propertyName === 'destinationPorts' || propertyName === 'name') {
        eventParams = propertyName + '||cont||' + searchText;
      } else if (propertyName) {
        eventParams = propertyName + '||eq||' + searchText;
      }
    } else {
      this.tableComponentDto.perPage = this.perPage;
    }
    this.firewallRuleService
      .getManyFirewallRule({
        filter: [`firewallRuleGroupId||eq||${this.FirewallRuleGroup.id}`, eventParams],
        join: ['fromZone', 'toZone', 'panosApplications'],
        page: this.tableComponentDto.page,
        perPage: this.tableComponentDto.perPage,
        sort: ['ruleIndex,ASC'],
      })
      .subscribe(
        response => {
          this.firewallRules = response;
        },
        () => {
          this.isLoading = false;
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
        perPage: 1,
        sort: ['ruleIndex,DESC'],
      })
      .subscribe(response => {
        if (response.data[0]) {
          this.latestRuleIndex = response.data[0].ruleIndex;
        }
      });
  }

  getObjects(): void {
    const tierRequest = this.tierService.getOneTier({ id: this.TierId });
    const networkObjectRequest = this.networkObjectService.getManyNetworkObject({
      filter: [`tierId||eq||${this.TierId}`, 'deletedAt||isnull'],
      fields: ['id,name'],
      sort: ['updatedAt,ASC'],
      page: 1,
      perPage: 50000,
    });
    const networkObjectGroupRequest = this.networkObjectGroupService.getManyNetworkObjectGroup({
      filter: [`tierId||eq||${this.TierId}`, 'deletedAt||isnull'],
      fields: ['id,name'],
      sort: ['updatedAt,ASC'],
      page: 1,
      perPage: 50000,
    });
    const serviceObjectRequest = this.serviceObjectService.getManyServiceObject({
      filter: [`tierId||eq||${this.TierId}`, 'deletedAt||isnull'],
      fields: ['id,name'],
      sort: ['updatedAt,ASC'],
      page: 1,
      perPage: 50000,
    });
    const serviceObjectGroupRequest = this.serviceObjectGroupService.getManyServiceObjectGroup({
      filter: [`tierId||eq||${this.TierId}`, 'deletedAt||isnull'],
      fields: ['id,name'],
      sort: ['updatedAt,ASC'],
      page: 1,
      perPage: 50000,
    });
    const zoneRequest = this.zoneService.getManyZone({
      filter: [`tierId||eq||${this.TierId}`, 'deletedAt||isnull'],
      fields: ['id,name'],
      sort: ['updatedAt,ASC'],
      page: 1,
      perPage: 50000,
    });

    forkJoin([
      tierRequest,
      networkObjectRequest,
      networkObjectGroupRequest,
      serviceObjectRequest,
      serviceObjectGroupRequest,
      zoneRequest,
    ]).subscribe(result => {
      this.tier = result[0];
      this.TierName = this.tier.name;
      this.networkObjects = result[1].data;
      this.networkObjectGroups = result[2].data;
      this.serviceObjects = result[3].data;
      this.serviceObjectGroups = result[4].data;
      this.zones = result[5].data;
      this.getFirewallRules();
      this.appIdService.loadPanosApplications(this.tier.appVersion);

      if (!this.runtimeDataService.isRecentlyRefreshed(this.tier.runtimeDataLastRefreshed)) {
        this.refreshAppId();
      }
    });
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
    dto.Zones = this.zones;
    dto.GroupType = this.FirewallRuleGroup.type;

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
      this.firewallRuleModalSubscription.unsubscribe();
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

  public sanitizeData(entities: FirewallRuleImport[]): FirewallRuleImport[] {
    return entities.map((entity: FirewallRuleImport) => {
      entity.ruleIndex = Number(entity.ruleIndex);
      this.mapCsv(entity);
      return entity;
    });
  }

  public mapCsv(entity: FirewallRuleImport): FirewallRuleImport {
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

  public createPreview(data: FirewallRulePreview, firewallRules: FirewallRuleImport[]): void {
    const { firewallRulesToBeUploaded } = data;
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
      const modalData: PreviewModalDto<FirewallRule> = modal.getData() as any;
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
            window.location.reload();
          });
      }
      previewImportSubscription.unsubscribe();
    });
  }
  subscribeToPacketTracer() {
    this.packetTracerSubscription = this.ngx.getModal('firewallRulePacketTracer').onCloseFinished.subscribe(() => {
      this.ngx.resetModalData('firewallRulePacketTracer');
      this.packetTracerSubscription.unsubscribe();
    });
  }

  openPacketTracer() {
    this.getAllFirewallRules();
    this.getAllNetworkObjectGroups();
    this.getAllServiceObjectGroups();
    this.subscribeToPacketTracer();
    this.ngx.getModal('firewallRulePacketTracer').open();
  }
  getZoneNames(zones: any[]): string {
    return zones.map(zone => zone.name).join(', ');
  }

  getAllFirewallRules() {
    this.firewallRuleService
      .getManyFirewallRule({
        filter: [`firewallRuleGroupId||eq||${this.FirewallRuleGroup.id}`],
        sort: ['ruleIndex,ASC'],
        join: [
          'sourceNetworkObject',
          'destinationNetworkObject',
          'sourceNetworkObjectGroup',
          'destinationNetworkObjectGroup',
          'serviceObject',
          'serviceObjectGroup',
        ],
        page: 1,
        perPage: 50000,
      })
      .subscribe(response => {
        this.packetTracerObjects.firewallRules = response.data;
      });
  }

  getAllNetworkObjectGroups() {
    this.networkObjectGroupService
      .getManyNetworkObjectGroup({
        filter: [`tierId||eq||${this.TierId}`],
        join: ['networkObjects'],
        page: 1,
        perPage: 50000,
      })
      .subscribe(response => {
        this.packetTracerObjects.networkObjectGroups = response.data;
      });
  }

  getAllServiceObjectGroups() {
    this.serviceObjectGroupService
      .getManyServiceObjectGroup({
        filter: [`tierId||eq||${this.TierId}`],
        join: ['serviceObjects'],
        page: 1,
        perPage: 50000,
      })
      .subscribe(response => {
        this.packetTracerObjects.serviceObjectGroups = response.data;
      });
  }

  getObjectInfo(property, objectType, objectId) {
    if (objectId) {
      switch (objectType) {
        case 'NetworkObject': {
          this.handleNetworkObject(property, objectId);
          break;
        }
        case 'NetworkObjectGroup': {
          this.handleNetworkObjectGroup(property, objectId);
          break;
        }
        case 'ServiceObject': {
          this.handleServiceObject(property, objectId);
          break;
        }
        case 'ServiceObjectGroup': {
          this.handleServiceObjectGroup(property, objectId);
          break;
        }
      }
    }
  }

  handleNetworkObject(property, objectId) {
    this.networkObjectService.getOneNetworkObject({ id: objectId }).subscribe(data => {
      const objectName = data.name;
      const modalTitle = `${property} : ${objectName}`;
      let value;
      if (data.type === 'Fqdn') {
        value = data.fqdn;
      } else if (data.type === 'Range') {
        value = `${data.startIpAddress} - ${data.endIpAddress}`;
      } else {
        value = data.ipAddress;
      }
      const modalBody = [`${data.type}: ${value}`];
      const dto = {
        modalTitle,
        modalBody,
      };
      this.subscribeToObjectInfoModal();
      this.ngx.setModalData(dto, 'firewallRuleObjectInfoModal');
      this.ngx.getModal('firewallRuleObjectInfoModal').open();
    });
  }

  handleNetworkObjectGroup(property, objectId) {
    this.networkObjectGroupService.getOneNetworkObjectGroup({ id: objectId, join: ['networkObjects'] }).subscribe(data => {
      const members = data.networkObjects;
      const memberDetails = members.map(member => {
        let returnValue = `Name: ${member.name} --- `;

        if (member.type === 'IpAddress') {
          returnValue += `IP Address: ${member.ipAddress}`;
        } else if (member.type === 'Range') {
          returnValue += `Range: ${member.startIpAddress}-${member.endIpAddress}`;
        } else if (member.type === 'Fqdn') {
          returnValue += `FQDN: ${member.fqdn}`;
        }

        return returnValue;
      });
      const modalBody = memberDetails;
      const objectName = data.name;
      const modalTitle = `${property} : ${objectName}`;
      const dto = {
        modalTitle,
        modalBody,
      };
      this.subscribeToObjectInfoModal();
      this.ngx.setModalData(dto, 'firewallRuleObjectInfoModal');
      this.ngx.getModal('firewallRuleObjectInfoModal').open();
    });
  }

  handleServiceObject(property, objectId) {
    this.serviceObjectService.getOneServiceObject({ id: objectId }).subscribe(data => {
      const objectName = data.name;
      const modalTitle = `${property} : ${objectName}`;
      const modalBody = [`Protocol : ${data.protocol}, Source Ports: ${data.sourcePorts}, Destination Ports: ${data.destinationPorts}`];
      const dto = {
        modalTitle,
        modalBody,
      };
      this.subscribeToObjectInfoModal();
      this.ngx.setModalData(dto, 'firewallRuleObjectInfoModal');
      this.ngx.getModal('firewallRuleObjectInfoModal').open();
    });
  }

  handleServiceObjectGroup(property, objectId) {
    this.serviceObjectGroupService.getOneServiceObjectGroup({ id: objectId, join: ['serviceObjects'] }).subscribe(data => {
      const members = data.serviceObjects;
      const memberDetails = members.map(member => {
        let returnValue = `Name: ${member.name} ---`;

        /* eslint-disable-next-line */
        returnValue += `Protocol: ${member.protocol}, Source Ports: ${member.sourcePorts}, Destination Ports: ${member.destinationPorts}`;

        return returnValue;
      });
      const modalBody = memberDetails;
      const objectName = data.name;
      const modalTitle = `${property} : ${objectName}`;
      const dto = {
        modalTitle,
        modalBody,
      };
      this.subscribeToObjectInfoModal();
      this.ngx.setModalData(dto, 'firewallRuleObjectInfoModal');
      this.ngx.getModal('firewallRuleObjectInfoModal').open();
    });
  }

  subscribeToObjectInfoModal() {
    this.objectInfoSubscription = this.ngx.getModal('firewallRuleObjectInfoModal').onCloseFinished.subscribe(() => {
      this.ngx.resetModalData('firewallRuleObjectInfoModal');
    });
  }

  checkUndeployedChanges(rule: FirewallRule): boolean {
    if (!this.FirewallRuleGroup.provisionedAt || !rule.updatedAt) {
      return false;
    }

    return rule.updatedAt > this.FirewallRuleGroup.provisionedAt;
  }

  checkUndeployedChangesGroup(group: FirewallRuleGroup): boolean {
    return UndeployedChangesUtil.hasUndeployedChanges(group);
  }

  refreshHitcount(): void {
    this.isRefreshingRuntimeData = true;
    this.hitcountService
      .createRuntimeDataJobHitcount({
        hitcountJobCreateDto: {
          type: HitcountJobCreateDtoTypeEnum.FirewallRule,
          groupId: this.FirewallRuleGroup.id,
          datacenterId: this.datacenterService.currentDatacenterValue.id,
        },
      })
      .subscribe(
        job => {
          let status = '';
          this.runtimeDataService.pollJobStatus(job.id).subscribe({
            next: towerJobDto => {
              status = towerJobDto.status;
            },
            error: () => {
              status = 'error';
              this.isRefreshingRuntimeData = false;
              this.jobStatus = status;
            },
            complete: () => {
              this.isRefreshingRuntimeData = false;
              if (status === 'successful') {
                this.getFirewallRuleGroup();
                this.getFirewallRules();
              }
              this.jobStatus = status;
            },
          });
        },
        () => {
          this.isRefreshingRuntimeData = false;
        },
      );
  }

  isRecentlyRefreshed(): boolean {
    return this.runtimeDataService.isRecentlyRefreshed(this.FirewallRuleGroup.runtimeDataLastRefreshed);
  }

  calculateTimeDifference(timestamp: string): string {
    return this.runtimeDataService.calculateTimeDifference(timestamp);
  }
}
