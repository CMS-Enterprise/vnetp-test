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
} from 'client';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { PreviewModalDto } from 'src/app/models/other/preview-modal-dto';
import { TableConfig } from 'src/app/common/table/table.component';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import { EntityService } from 'src/app/services/entity.service';

@Component({
  selector: 'app-firewall-rules-detail',
  templateUrl: './firewall-rules-detail.component.html',
})
export class FirewallRulesDetailComponent implements OnInit, OnDestroy {
  Id = '';
  TierName = '';
  currentTierIds: string[];
  ModalMode = ModalMode;

  firewallRuleGroup: FirewallRuleGroup;
  firewallRules: FirewallRule[];

  // Pagination
  totalFirewallRules = 0;
  currentFirewallRulePage = 1;
  perPage = 50;

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

  // Templates
  @ViewChild('sourceAddress') sourceAddressTemplate: TemplateRef<any>;
  @ViewChild('destinationAddress') destinationAddressTemplate: TemplateRef<any>;
  @ViewChild('serviceType') serviceTemplate: TemplateRef<any>;

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
      });
  }

  getFirewallRules(): void {
    this.firewallRuleService
      .getManyFirewallRule({
        filter: [`firewallRuleGroupId||eq||${this.FirewallRuleGroup.id}`],
        limit: this.perPage,
        page: this.currentFirewallRulePage,
      })
      .subscribe(result => {
        // TODO: Review this approach, see if we can resolve
        // this in the generated client.
        this.firewallRules = result.data;
        this.totalFirewallRules = result.total;
      });
  }

  getObjects(): void {
    const tierRequest = this.tierService.getOneTier({ id: this.TierId });
    const networkObjectRequest = this.networkObjectService.getManyNetworkObject({
      filter: [`tierId||eq||${this.TierId}`],
      fields: ['id,name'],
    });
    const networkObjectGroupRequest = this.networkObjectGroupService.getManyNetworkObjectGroup({
      filter: [`tierId||eq||${this.TierId}`],
      fields: ['id,name'],
    });
    const serviceObjectRequest = this.serviceObjectService.getManyServiceObject({
      filter: [`tierId||eq||${this.TierId}`],
      fields: ['id,name'],
    });
    const serviceObjectGroupRequest = this.serviceObjectGroupService.getManyServiceObjectGroup({
      filter: [`tierId||eq||${this.TierId}`],
      fields: ['id,name'],
    });

    forkJoin([tierRequest, networkObjectRequest, networkObjectGroupRequest, serviceObjectRequest, serviceObjectGroupRequest]).subscribe(
      (result: unknown) => {
        this.TierName = result[0].name;
        this.networkObjects = (result as NetworkObject)[1];
        this.networkObjectGroups = (result as NetworkObjectGroup)[2];
        this.serviceObjects = (result as ServiceObject)[3];
        this.serviceObjectGroups = (result as ServiceObjectGroup)[4];

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
      onSuccess: () => this.getFirewallRules(),
    });
  }

  restoreFirewallRule(firewallRule: FirewallRule): void {
    if (firewallRule.deletedAt) {
      this.firewallRuleService.restoreOneFirewallRule({ id: firewallRule.id }).subscribe(() => {
        this.getFirewallRules();
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
      rowStyle: (firewallRule: FirewallRule) => (firewallRule.hasOwnProperty('id') ? { background: '#ffeef0' } : { background: '#e6ffed' }),
    };
    const previewModalDto = new PreviewModalDto(tableConfig, [...firewallRulesToBeUploaded, ...firewallRulesToBeDeleted]);
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
