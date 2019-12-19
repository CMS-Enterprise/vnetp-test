import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { Subscription, Observable } from 'rxjs';
import { FirewallRuleModalDto } from 'src/app/models/firewall/firewall-rule-modal-dto';
import { PendingChangesGuard } from 'src/app/guards/pending-changes.guard';
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
} from 'api_client';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';

@Component({
  selector: 'app-firewall-rules-detail',
  templateUrl: './firewall-rules-detail.component.html',
})
export class FirewallRulesDetailComponent
  implements OnInit, OnDestroy, PendingChangesGuard {
  Id = '';
  TierName = '';

  dirty: boolean;

  firewallRuleGroup: FirewallRuleGroup;
  firewallRules: Array<FirewallRule>;

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

  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    return !this.dirty;
  }

  constructor(
    private route: ActivatedRoute,
    private ngx: NgxSmartModalService,
    private firewallRuleService: V1NetworkSecurityFirewallRulesService,
    private firewallRuleGroupService: V1NetworkSecurityFirewallRuleGroupsService,
    private tierService: V1TiersService,
    private datacenterService: DatacenterContextService,
  ) {}

  ngOnInit() {
    this.currentDatacenterSubscription = this.datacenterService.currentDatacenter.subscribe(
      cd => {
        if (cd) {
          // This component locks the datacenter for the entire edit lifecycle.
          this.datacenterService.lockDatacenter();
          this.Id += this.route.snapshot.paramMap.get('id');
          this.getFirewallRules();
        }
      },
    );
  }

  ngOnDestroy() {
    this.currentDatacenterSubscription.unsubscribe();
    this.datacenterService.unlockDatacenter();
  }

  refresh() {
    this.getFirewallRules();
  }

  getFirewallRules() {
    this.firewallRuleGroupService
      .v1NetworkSecurityFirewallRuleGroupsIdGet({
        id: this.Id,
        join: 'firewallRules',
      })
      .subscribe(data => {
        this.FirewallRuleGroup = {
          name: data.name,
          type: data.type,
        } as FirewallRuleGroup;

        const sortedFirewallRules = data.firewallRules.sort(
          (a, b) => a.ruleIndex - b.ruleIndex,
        );
        this.TierId = data.tierId;

        this.getObjects(sortedFirewallRules);
      });
  }

  getObjects(sortedFirewallRules: Array<FirewallRule>) {
    this.tierService
      .v1TiersIdGet({
        id: this.TierId,
        join:
          'networkObjects,networkObjectGroups,serviceObjects,serviceObjectGroups',
      })
      .subscribe(data => {
        this.networkObjects = data.networkObjects;
        this.networkObjectGroups = data.networkObjectGroups;
        this.serviceObjects = data.serviceObjects;
        this.serviceObjectGroups = data.serviceObjectGroups;
        this.TierName = data.name;

        // Only set the firewall rules after object arrays
        // have been populated, this allows us to use a pure
        // pipe to resolve id's to names.
        this.firewallRules = sortedFirewallRules;
      });
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
        this.getFirewallRules();
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
        this.firewallRuleService
          .v1NetworkSecurityFirewallRulesIdSoftDelete({ id: firewallRule.id })
          .subscribe(data => {
            this.getFirewallRules();
          });
      } else {
        this.firewallRuleService
          .v1NetworkSecurityFirewallRulesIdDelete({ id: firewallRule.id })
          .subscribe(data => {
            this.getFirewallRules();
          });
      }
    };

    this.confirmDeleteObject(
      new YesNoModalDto(
        `${deleteDescription} Firewall Rule`,
        `Do you want to ${deleteDescription} the firewall rule "${firewallRule.name}"?
        The firewall rule will be removed from the infrastructure on the next provisioning cycle.`,
      ),
      deleteFunction,
    );
  }

  restoreFirewallRule(firewallRule: FirewallRule) {
    if (firewallRule.deletedAt) {
      this.firewallRuleService
        .v1NetworkSecurityFirewallRulesIdRestorePatch({ id: firewallRule.id })
        .subscribe(data => {
          this.getFirewallRules();
        });
    }
  }

  private confirmDeleteObject(
    modalDto: YesNoModalDto,
    deleteFunction: () => void,
  ) {
    this.ngx.setModalData(modalDto, 'yesNoModal');
    this.ngx.getModal('yesNoModal').open();
    const yesNoModalSubscription = this.ngx
      .getModal('yesNoModal')
      .onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
        const data = modal.getData() as YesNoModalDto;
        modal.removeData();
        if (data && data.modalYes) {
          deleteFunction();
        }
        yesNoModalSubscription.unsubscribe();
      });
  }

  insertFirewallRules(rules) {
    // if (this.firewallRules == null) {
    //   this.firewallRules = new Array<FirewallRule>();
    // }
    // rules.forEach(rule => {
    //   if (rule.Name !== '') {
    //     this.firewallRules.push(rule);
    //   }
    // });
    // this.dirty = true;
  }
}
