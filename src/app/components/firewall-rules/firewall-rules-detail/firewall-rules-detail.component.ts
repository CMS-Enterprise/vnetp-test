import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { Subscription, Observable, forkJoin } from 'rxjs';
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
} from 'api_client';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { BulkUploadService } from 'src/app/services/bulk-upload.service';

@Component({
  selector: 'app-firewall-rules-detail',
  templateUrl: './firewall-rules-detail.component.html',
})
export class FirewallRulesDetailComponent implements OnInit, OnDestroy {
  Id = '';
  TierName = '';
  currentTierIds: Array<string>;
  tiers: Tier[];

  firewallRuleGroup: FirewallRuleGroup;
  firewallRules: Array<FirewallRule>;

  totalFirewallRules = 0;
  currentFirewallRulePage = 1;
  perPage = 50;
  ModalMode = ModalMode;

  networkObjects: Array<NetworkObject>;
  networkObjectGroups: Array<NetworkObjectGroup>;
  serviceObjects: Array<ServiceObject>;
  serviceObjectGroups: Array<ServiceObjectGroup>;

  firewallRuleModalSubscription: Subscription;

  scope: FirewallRuleScope;
  TierId: string;
  FirewallRuleGroup: FirewallRuleGroup;
  currentDatacenterSubscription: Subscription;

  get scopeString() {
    return this.scope;
  }

  constructor(
    private route: ActivatedRoute,
    private ngx: NgxSmartModalService,
    private firewallRuleService: V1NetworkSecurityFirewallRulesService,
    private firewallRuleGroupService: V1NetworkSecurityFirewallRuleGroupsService,
    private tierService: V1TiersService,
    private networkObjectService: V1NetworkSecurityNetworkObjectsService,
    private networkObjectGroupService: V1NetworkSecurityNetworkObjectGroupsService,
    private serviceObjectService: V1NetworkSecurityServiceObjectsService,
    private serviceObjectGroupService: V1NetworkSecurityServiceObjectGroupsService,
    private datacenterService: DatacenterContextService,
    private bulkUploadService: BulkUploadService,
  ) {}

  ngOnInit() {
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

  ngOnDestroy() {
    this.currentDatacenterSubscription.unsubscribe();
    this.datacenterService.unlockDatacenter();
  }

  refresh() {
    this.getFirewallRuleGroup();
  }

  getFirewallRuleGroup() {
    this.firewallRuleGroupService
      .v1NetworkSecurityFirewallRuleGroupsIdGet({
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

  getFirewallRules() {
    this.firewallRuleService
      .v1NetworkSecurityFirewallRulesGet({
        filter: `firewallRuleGroupId||eq||${this.FirewallRuleGroup.id}`,
        perPage: this.perPage,
        page: this.currentFirewallRulePage,
      })
      .subscribe(data => {
        // TODO: Review this approach, see if we can resolve
        // this in the generated client.
        const result = data as any;
        this.firewallRules = result.data;
        this.totalFirewallRules = result.total;
      });
  }

  getObjects() {
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
    const serviceObjectGroupRequest = this.serviceObjectGroupService.v1NetworkSecurityServiceObjectGroupsGet({
      filter: `tierId||eq||${this.TierId}`,
      fields: 'id,name',
    });

    forkJoin([tierRequest, networkObjectRequest, networkObjectGroupRequest, serviceObjectRequest, serviceObjectGroupRequest]).subscribe(
      result => {
        this.TierName = result[0].name;
        this.networkObjects = result[1];
        this.networkObjectGroups = result[2];
        this.serviceObjects = result[3];
        this.serviceObjectGroups = result[4];

        this.getFirewallRules();
      },
    );
  }

  createFirewallRule() {
    this.openFirewallRuleModal(ModalMode.Create);
  }

  openFirewallRuleModal(modalMode: ModalMode, firewallRule?: FirewallRule) {
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

  subscribeToFirewallRuleModal() {
    this.firewallRuleModalSubscription = this.ngx
      .getModal('firewallRuleModal')
      .onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
        this.getFirewallRuleGroup();
        this.ngx.resetModalData('firewallRuleModal');
      });
  }

  getServiceObjectName = (id: string) => {
    return this.getObjectName(id, this.serviceObjects);
    // tslint:disable-next-line: semicolon
  };

  getServiceObjectGroupName = (id: string) => {
    return this.getObjectName(id, this.serviceObjectGroups);
    // tslint:disable-next-line: semicolon
  };

  getNetworkObjectName = (id: string) => {
    return this.getObjectName(id, this.networkObjects);
    // tslint:disable-next-line: semicolon
  };

  getNetworkObjectGroupName = (id: string) => {
    return this.getObjectName(id, this.networkObjectGroups);
    // tslint:disable-next-line: semicolon
  };

  private getObjectName(id: string, objects: { name: string; id?: string }[]) {
    if (objects && objects.length) {
      return objects.find(o => o.id === id).name || 'N/A';
    }
  }

  updateFirewallRuleGroup() {
    // TODO: Update Firewall Rule Group
  }

  deleteFirewallRule(firewallRule: FirewallRule) {
    const deleteDescription = firewallRule.deletedAt ? 'Delete' : 'Soft-Delete';

    const deleteFunction = () => {
      if (!firewallRule.deletedAt) {
        this.firewallRuleService.v1NetworkSecurityFirewallRulesIdSoftDelete({ id: firewallRule.id }).subscribe(data => {
          this.getFirewallRules();
        });
      } else {
        this.firewallRuleService.v1NetworkSecurityFirewallRulesIdDelete({ id: firewallRule.id }).subscribe(data => {
          this.getFirewallRules();
        });
      }
    };

    this.confirmDeleteObject(
      new YesNoModalDto(
        `${deleteDescription} Firewall Rule`,
        `Do you want to ${deleteDescription} the firewall rule "${firewallRule.name}"?`,
      ),
      deleteFunction,
    );
  }

  restoreFirewallRule(firewallRule: FirewallRule) {
    if (firewallRule.deletedAt) {
      this.firewallRuleService.v1NetworkSecurityFirewallRulesIdRestorePatch({ id: firewallRule.id }).subscribe(data => {
        this.getFirewallRules();
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

  importFirewallRulesConfig(event) {
    const modalDto = new YesNoModalDto(
      'Import Firewall Rule',
      `Are you sure you would like to import ${event.length} firewall rule${event.length > 1 ? 's' : ''}?`,
    );
    this.ngx.setModalData(modalDto, 'yesNoModal');
    this.ngx.getModal('yesNoModal').open();

    const yesNoModalSubscription = this.ngx.getModal('yesNoModal').onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
      const modalData = modal.getData() as YesNoModalDto;
      modal.removeData();
      if (modalData && modalData.modalYes) {
        const fwDto = {} as FirewallRuleImportCollectionDto;
        fwDto.datacenterId = this.datacenterService.currentDatacenterValue.id;
        fwDto.firewallRules = this.sanitizeData(event);

        this.firewallRuleService
          .v1NetworkSecurityFirewallRulesBulkImportPost({
            firewallRuleImportCollectionDto: fwDto,
          })
          .subscribe(data => {
            this.getFirewallRuleGroup();
          });
      }
      yesNoModalSubscription.unsubscribe();
    });
  }

  sanitizeData(entities: any) {
    return entities.map(entity => {
      entity.ruleIndex = Number(entity.ruleIndex);
      this.mapCsv(entity);
      return entity;
    });
  }

  mapCsv = obj => {
    Object.entries(obj).forEach(([key, val]) => {
      if (val === 'FALSE' || val === 'false' || val === 'f' || val === 'F') {
        obj[key] = false;
      }
      if (val === 'TRUE' || val === 'true' || val === 't' || val === 'T') {
        obj[key] = true;
      }
      if (val === null || val === '') {
        delete obj[key];
      }
    });
    return obj;
    // tslint:disable-next-line: semicolon
  };
}
