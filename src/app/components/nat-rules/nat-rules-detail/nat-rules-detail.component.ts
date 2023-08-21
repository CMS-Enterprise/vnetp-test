import { Component, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { Subscription, forkJoin } from 'rxjs';
import {
  V1NetworkSecurityNatRuleGroupsService,
  NatRule,
  NatRuleGroup,
  NetworkObject,
  NetworkObjectGroup,
  ServiceObject,
  V1TiersService,
  V1NetworkSecurityNatRulesService,
  Tier,
  NatRuleImportCollectionDto,
  V1NetworkSecurityNetworkObjectsService,
  V1NetworkSecurityNetworkObjectGroupsService,
  V1NetworkSecurityServiceObjectsService,
  NatRuleImport,
  NatRulePreview,
  GetManyNatRuleResponseDto,
} from 'client';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import { EntityService } from 'src/app/services/entity.service';
import { NatRuleModalDto } from '../../../models/nat/nat-rule-modal-dto';
import { TableConfig } from '../../../common/table/table.component';
import { PreviewModalDto } from '../../../models/other/preview-modal-dto';
import { SearchColumnConfig } from 'src/app/common/search-bar/search-bar.component';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { TableContextService } from 'src/app/services/table-context.service';

@Component({
  selector: 'app-nat-rules-detail',
  templateUrl: './nat-rules-detail.component.html',
})
export class NatRulesDetailComponent implements OnInit, OnDestroy {
  public searchColumns: SearchColumnConfig[] = [];

  public tableComponentDto = new TableComponentDto();

  public isLoading = false;

  Id = '';
  TierName = '';
  currentTierIds: string[];
  ModalMode = ModalMode;
  public currentTier: Tier;

  natRuleGroup: NatRuleGroup;
  natRules = {} as GetManyNatRuleResponseDto;
  latestRuleIndex;
  perPage = 50;

  // Relations
  networkObjects: NetworkObject[];
  networkObjectGroups: NetworkObjectGroup[];
  serviceObjects: ServiceObject[];
  tiers: Tier[];

  natRuleModalSubscription: Subscription;

  TierId: string;
  NatRuleGroup: NatRuleGroup;
  currentDatacenterSubscription: Subscription;

  // Templates
  @ViewChild('originalServiceType') originalServiceTemplate: TemplateRef<any>;
  @ViewChild('originalSourceAddress') originalSourceAddressTemplate: TemplateRef<any>;
  @ViewChild('originalDestinationAddress') originalDestinationAddressTemplate: TemplateRef<any>;
  @ViewChild('translatedServiceType') translatedServiceTemplate: TemplateRef<any>;
  @ViewChild('translatedSourceAddress') translatedSourceAddressTemplate: TemplateRef<any>;
  @ViewChild('translatedDestinationAddress') translatedDestinationAddressTemplate: TemplateRef<any>;
  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

  public config: TableConfig<any> = {
    description: 'NAT Rules for the currently selected Tier',
    columns: [
      { name: 'Name', property: 'name' },
      { name: 'Direction', property: 'direction' },
      { name: 'BiDirectional', property: 'biDirectional' },
      { name: 'Original Service Type', template: () => this.originalServiceTemplate },
      { name: 'Original Source Address', template: () => this.originalSourceAddressTemplate },
      { name: 'Original Destination Address', template: () => this.originalDestinationAddressTemplate },
      { name: 'Translated Service Type', template: () => this.translatedServiceTemplate },
      { name: 'Translated Source Address', template: () => this.translatedSourceAddressTemplate },
      { name: 'Translated Destination Address', template: () => this.translatedDestinationAddressTemplate },
      { name: 'Enabled', property: 'enabled' },
      { name: 'Rule Index', property: 'ruleIndex' },
      { name: '', template: () => this.actionsTemplate },
    ],
  };

  constructor(
    private route: ActivatedRoute,
    private ngx: NgxSmartModalService,
    private entityService: EntityService,
    private natRuleService: V1NetworkSecurityNatRulesService,
    private natRuleGroupService: V1NetworkSecurityNatRuleGroupsService,
    private tierService: V1TiersService,
    private networkObjectService: V1NetworkSecurityNetworkObjectsService,
    private networkObjectGroupService: V1NetworkSecurityNetworkObjectGroupsService,
    private serviceObjectService: V1NetworkSecurityServiceObjectsService,
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
        this.getNatRuleGroup();
      }
    });
  }

  ngOnDestroy(): void {
    this.currentDatacenterSubscription.unsubscribe();
    this.datacenterService.unlockDatacenter();
  }

  refresh(): void {
    this.getNatRuleGroup();
  }

  public onTableEvent(event: TableComponentDto) {
    this.tableComponentDto = event;
    this.getNatRules(event);
  }

  getNatRuleGroup(): void {
    this.natRuleGroupService
      .getOneNatRuleGroup({
        id: this.Id,
      })
      .subscribe(data => {
        this.NatRuleGroup = {
          name: data.name,
          type: data.type,
          id: data.id,
        } as NatRuleGroup;

        this.TierId = data.tierId;

        this.getObjects();
        this.getNatRuleLastIndex();
      });
  }

  getNatRules(event?): void {
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
    this.natRuleService
      .getManyNatRule({
        filter: [`natRuleGroupId||eq||${this.NatRuleGroup.id}`, eventParams],
        page: this.tableComponentDto.page,
        limit: this.tableComponentDto.perPage,
        sort: ['ruleIndex,ASC'],
      })
      .subscribe(
        response => {
          this.natRules = response;
        },
        () => {
          this.natRules = null;
        },
        () => {
          this.isLoading = false;
        },
      );
  }

  getNatRuleLastIndex(): void {
    this.natRuleService
      .getManyNatRule({
        filter: [`natRuleGroupId||eq||${this.NatRuleGroup.id}`],
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

    forkJoin([tierRequest, networkObjectRequest, networkObjectGroupRequest, serviceObjectRequest]).subscribe(result => {
      this.TierName = result[0].name;
      this.networkObjects = result[1].data;
      this.networkObjectGroups = result[2].data;
      this.serviceObjects = result[3].data;

      this.getNatRules();
    });
  }

  createNatRule(): void {
    this.openNatRuleModal(ModalMode.Create);
  }

  public openNatRuleModal(modalMode: ModalMode, natRule?: NatRule): void {
    if (modalMode === ModalMode.Edit && !natRule) {
      throw new Error('Nat Rule Required');
    }

    const dto = new NatRuleModalDto();
    dto.tierId = this.TierId;
    dto.natRuleGroupId = this.Id;
    dto.modalMode = modalMode;
    dto.NetworkObjectGroups = this.networkObjectGroups;
    dto.NetworkObjects = this.networkObjects;
    dto.ServiceObjects = this.serviceObjects;

    if (modalMode === ModalMode.Edit) {
      dto.natRule = natRule;
    } else {
      dto.natRule = {} as NatRule;
      dto.natRule.ruleIndex = this.latestRuleIndex + 1;
    }
    this.subscribeToNatRuleModal();
    this.ngx.setModalData(dto, 'natRuleModal');
    this.ngx.getModal('natRuleModal').open();
  }

  subscribeToNatRuleModal(): void {
    this.natRuleModalSubscription = this.ngx.getModal('natRuleModal').onCloseFinished.subscribe(() => {
      this.getNatRuleGroup();
      this.ngx.resetModalData('natRuleModal');
    });
  }

  public getServiceObjectName = (id: string) => ObjectUtil.getObjectName(id, this.serviceObjects);
  public getNetworkObjectName = (id: string): string => ObjectUtil.getObjectName(id, this.networkObjects);
  public getNetworkObjectGroupName = (id: string): string => ObjectUtil.getObjectName(id, this.networkObjectGroups);

  public deleteNatRule(natRule: NatRule): void {
    this.entityService.deleteEntity(natRule, {
      entityName: 'NAT Rule',
      delete$: this.natRuleService.deleteOneNatRule({ id: natRule.id }),
      softDelete$: this.natRuleService.softDeleteOneNatRule({ id: natRule.id }),
      onSuccess: () => {
        const params = this.tableContextService.getSearchLocalStorage();
        const { filteredResults } = params;
        if (filteredResults) {
          this.tableComponentDto.searchColumn = params.searchColumn;
          this.tableComponentDto.searchText = params.searchText;
          this.getNatRules(this.tableComponentDto);
        } else {
          this.getNatRules();
        }
      },
    });
  }

  restoreNatRule(natRule: NatRule): void {
    if (natRule.deletedAt) {
      this.natRuleService.restoreOneNatRule({ id: natRule.id }).subscribe(() => {
        const params = this.tableContextService.getSearchLocalStorage();
        const { filteredResults } = params;
        if (filteredResults) {
          this.tableComponentDto.searchColumn = params.searchColumn;
          this.tableComponentDto.searchText = params.searchText;
          this.getNatRules(this.tableComponentDto);
        } else {
          this.getNatRules();
        }
      });
    }
  }

  importNatRulesConfig(event: NatRuleImport[]): void {
    const nrDto: NatRuleImportCollectionDto = {
      dryRun: true,
      datacenterId: this.datacenterService.currentDatacenterValue.id,
      natRules: this.sanitizeData(event),
    };

    this.natRuleService
      .bulkImportNatRulesNatRule({
        natRuleImportCollectionDto: nrDto,
      })
      .subscribe(data => {
        this.createPreview(data, event);
      });
  }

  private sanitizeData(entities: NatRuleImport[]): NatRuleImport[] {
    return entities.map((entity: NatRuleImport) => {
      entity.ruleIndex = Number(entity.ruleIndex);
      this.mapCsv(entity);
      return entity;
    });
  }

  private mapCsv(entity: NatRuleImport): NatRuleImport {
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

  private createPreview(data: NatRulePreview, natRules: NatRuleImport[]): void {
    const { natRulesToBeUploaded } = data;
    const natData = { data: natRulesToBeUploaded };
    const tableConfig: TableConfig<NatRule> = {
      description: 'Nat Rules Import Preview',
      columns: [
        { name: 'Name', property: 'name' },
        { name: 'Direction', property: 'direction' },
        { name: 'BiDirectional', property: 'biDirectional' },
        { name: 'Original Service (Type)', template: () => this.originalServiceTemplate },
        { name: 'Original Source Address', template: () => this.originalSourceAddressTemplate },
        { name: 'Original Destination Address', template: () => this.originalDestinationAddressTemplate },
        { name: 'Translation Type', property: 'translationType' },
        { name: 'Translated Service (Type)', template: () => this.translatedServiceTemplate },
        { name: 'Translated Source Address', template: () => this.translatedSourceAddressTemplate },
        { name: 'Translated Destination Address', template: () => this.translatedDestinationAddressTemplate },
        // { name: 'Enabled', property: 'enabled' },
        { name: 'Rule Index', property: 'ruleIndex' },
      ],
      rowStyle: (natRule: NatRule) => (natRule.hasOwnProperty('id') ? { background: '#e6ffed' } : { background: '#e6ffed' }),
    };
    const previewModalDto = new PreviewModalDto(tableConfig, natData as any);
    this.ngx.setModalData(previewModalDto, 'previewModal');
    this.ngx.getModal('previewModal').open();

    const previewImportSubscription = this.ngx.getModal('previewModal').onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
      const modalData: PreviewModalDto<NatRule> = modal.getData();
      modal.removeData();
      if (modalData && modalData.confirm) {
        const natConfirmDto: NatRuleImportCollectionDto = {
          datacenterId: this.datacenterService.currentDatacenterValue.id,
          natRules: this.sanitizeData(natRules),
          dryRun: false,
        };

        this.natRuleService
          .bulkImportNatRulesNatRule({
            natRuleImportCollectionDto: natConfirmDto,
          })
          .subscribe(() => {
            this.getNatRuleGroup();
          });
      }
      previewImportSubscription.unsubscribe();
    });
  }
}
