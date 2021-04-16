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
  V1NetworkSecurityServiceObjectGroupsService,
  NatRuleImport,
} from 'api_client';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import { EntityService } from 'src/app/services/entity.service';
import { NatRuleModalDto } from '../models/nat-rule-modal-dto';
import { TableConfig } from '../../../common/table/table.component';
import { PreviewModalDto } from '../../../models/other/preview-modal-dto';
import { NatRulePreview } from '../models/nat-rule-preview';

@Component({
  selector: 'app-nat-rule-detail',
  templateUrl: './nat-rule-detail.component.html',
})
export class NatRuleDetailComponent implements OnInit, OnDestroy {
  Id = '';
  TierName = '';
  currentTierIds: string[];
  ModalMode = ModalMode;
  public currentTier: Tier;

  natRuleGroup: NatRuleGroup;
  natRules: NatRule[];
  description: string;

  // Pagination
  totalNatRules = 0;
  currentNatRulePage = 1;
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

  tableHeaders: string[] = [
    'Name',
    'Direction',
    'BiDirectional',
    'Original Service Type',
    'Original Source Address',
    'Original Destination Address',
    'Translation Type',
    'Translated Source Address',
    'Translated Destination Address',
    'Translated Service Type',
    'Enabled',
    'Rule Index',
    '',
  ];

  // Templates
  @ViewChild('originalServiceType') originalServiceTemplate: TemplateRef<any>;
  @ViewChild('originalSourceAddress') originalSourceAddressTemplate: TemplateRef<any>;
  @ViewChild('originalDestinationAddress') originalDestinationAddressTemplate: TemplateRef<any>;

  @ViewChild('translatedSourceAddress') translatedSourceAddressTemplate: TemplateRef<any>;
  @ViewChild('translatedDestinationAddress') translatedDestinationAddressTemplate: TemplateRef<any>;
  @ViewChild('translatedServiceType') translatedServiceTemplate: TemplateRef<any>;

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

  getNatRuleGroup(): void {
    this.natRuleGroupService
      .v1NetworkSecurityNatRuleGroupsIdGet({
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
      });
  }

  getNatRules(): void {
    this.natRuleService
      .v1NetworkSecurityNatRulesGet({
        filter: `natRuleGroupId||eq||${this.NatRuleGroup.id}`,
        perPage: this.perPage,
        page: this.currentNatRulePage,
      })
      .subscribe(data => {
        // TODO: Review this approach, see if we can resolve
        // this in the generated client.
        const result = data as any;
        this.natRules = result.data;
        this.totalNatRules = result.total;
      });
  }

  getObjects(): void {
    const tierRequest = this.tierService.v1TiersIdGet({ id: this.TierId });
    const networkObjectRequest = this.networkObjectService.v1NetworkSecurityNetworkObjectsGet({
      filter: `tierId||eq||${this.TierId}`,
      fields: 'id,name',
    });
    const networkObjectGroupRequest = this.networkObjectGroupService.v1NetworkSecurityNetworkObjectGroupsGet({
      filter: `tierId||eq||${this.TierId}`,
      fields: 'id,name',
    });
    const serviceObjectRequest = this.serviceObjectService.v1NetworkSecurityServiceObjectsGet({
      filter: `tierId||eq||${this.TierId}`,
      fields: 'id,name',
    });

    forkJoin([tierRequest, networkObjectRequest, networkObjectGroupRequest, serviceObjectRequest]).subscribe(result => {
      this.TierName = result[0].name;
      this.networkObjects = result[1];
      this.networkObjectGroups = result[2];
      this.serviceObjects = result[3];
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
      entityName: 'Nat Rule',
      delete$: this.natRuleService.v1NetworkSecurityNatRulesIdDelete({ id: natRule.id }),
      softDelete$: this.natRuleService.v1NetworkSecurityNatRulesIdSoftDelete({ id: natRule.id }),
      onSuccess: () => this.getNatRules(),
    });
  }

  restoreNatRule(natRule: NatRule): void {
    if (natRule.deletedAt) {
      this.natRuleService.v1NetworkSecurityNatRulesIdRestorePatch({ id: natRule.id }).subscribe(() => {
        this.getNatRules();
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
      .v1NetworkSecurityNatRulesBulkImportPost({
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
    const { natRulesToBeDeleted, natRulesToBeUploaded } = data;
    const tableConfig: TableConfig<NatRule> = {
      description: 'Nat Rules Import Preview',
      columns: [
        { name: 'Name', property: 'name' },
        { name: 'Direction', property: 'direction' },
        { name: 'BiDirectional', property: 'biDirectional' },
        { name: 'Original Service Type', template: () => this.originalServiceTemplate },
        { name: 'Original Source Address', template: () => this.originalSourceAddressTemplate },
        { name: 'Original Source Address', template: () => this.originalDestinationAddressTemplate },
        { name: 'Translation Type', property: 'translationType' },
        { name: 'Original Source Address', template: () => this.translatedSourceAddressTemplate },
        { name: 'Original Destination Address', template: () => this.translatedDestinationAddressTemplate },
        { name: 'Destination Address', template: () => this.translatedServiceTemplate },
        { name: 'Enabled', property: 'enabled' },
        { name: 'Rule Index', property: 'ruleIndex' },
      ],
      rowStyle: (natRule: NatRule) => (natRule.hasOwnProperty('id') ? { background: '#ffeef0' } : { background: '#e6ffed' }),
    };
    const previewModalDto = new PreviewModalDto(tableConfig, [...natRulesToBeDeleted, ...natRulesToBeUploaded]);
    this.ngx.setModalData(previewModalDto, 'previewModal');
    this.ngx.getModal('previewModal').open();

    const previewImportSubscription = this.ngx.getModal('previewModal').onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
      const modalData: PreviewModalDto<NatRule> = modal.getData();
      modal.removeData();
      if (modalData && modalData.confirm) {
        const natConfirmDto: NatRuleImportCollectionDto = {
          datacenterId: this.datacenterService.currentDatacenterValue.id,
          natRules: this.sanitizeData(natRules),
          dryRun: true,
        };

        this.natRuleService
          .v1NetworkSecurityNatRulesBulkImportPost({
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
