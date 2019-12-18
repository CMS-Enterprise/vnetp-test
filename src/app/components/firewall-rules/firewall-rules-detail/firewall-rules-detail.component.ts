import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { ActivatedRoute } from '@angular/router';
import { HelpersService } from 'src/app/services/helpers.service';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { Subscription, Observable } from 'rxjs';
import { NetworkObjectDto } from 'src/app/models/network-objects/network-object-dto';
import { NetworkObject } from 'src/app/models/network-objects/network-object';
import { NetworkObjectGroup } from 'src/app/models/network-objects/network-object-group';
import { ServiceObject } from 'src/app/models/service-objects/service-object';
import { ServiceObjectGroup } from 'src/app/models/service-objects/service-object-group';
import { FirewallRuleModalDto } from 'src/app/models/firewall/firewall-rule-modal-dto';
import { PendingChangesGuard } from 'src/app/guards/pending-changes.guard';
import { FirewallRuleScope } from 'src/app/models/other/firewall-rule-scope';
import { Vrf } from 'src/app/models/d42/vrf';
import {
  V1NetworkSecurityFirewallRuleGroupsService,
  FirewallRule,
} from 'api_client';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';

@Component({
  selector: 'app-firewall-rules-detail',
  templateUrl: './firewall-rules-detail.component.html',
})
export class FirewallRulesDetailComponent
  implements OnInit, OnDestroy, PendingChangesGuard {
  Id = '';

  vrf: Vrf;

  dirty: boolean;
  deployedState: boolean;
  firewallRules: Array<FirewallRule>;
  deletedFirewallRules: Array<FirewallRule>;

  networkObjects: Array<NetworkObject>;
  networkObjectGroups: Array<NetworkObjectGroup>;
  serviceObjects: Array<ServiceObject>;
  serviceObjectGroups: Array<ServiceObjectGroup>;

  editFirewallRuleIndex: number;
  firewallRuleModalMode: ModalMode;

  firewallRuleModalSubscription: Subscription;

  scope: FirewallRuleScope;
  TierId: string;

  get scopeString() {
    return this.scope;
  }

  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    return !this.dirty;
  }

  constructor(
    private route: ActivatedRoute,
    private automationApiService: AutomationApiService,
    private hs: HelpersService,
    private ngx: NgxSmartModalService,
    private firewallRuleGroupService: V1NetworkSecurityFirewallRuleGroupsService,
    private datacenterService: DatacenterContextService,
  ) {}

  ngOnInit() {
    this.datacenterService.currentDatacenter.subscribe(cd => {
      if (cd) {
        // This component locks the datacenter for the entire edit lifecycle.
        this.datacenterService.lockDatacenter();
        this.Id += this.route.snapshot.paramMap.get('id');
        this.getFirewallRules();
      }
    });
  }

  ngOnDestroy() {
    this.datacenterService.unlockDatacenter();
  }

  refresh() {
    this.getFirewallRules();
  }

  // moveFirewallRule(value: number, rule: FirewallRule) {
  //   const ruleIndex = this.firewallRules.indexOf(rule);

  //   // If the rule isn't in the array, is at the start of the array and requested to move up
  //   // or if the rule is at the end of the array, return.
  //   if (
  //     ruleIndex === -1 ||
  //     (ruleIndex === 0 && value === -1) ||
  //     ruleIndex + value === this.firewallRules.length
  //   ) {
  //     return;
  //   }

  //   const nextRule = this.firewallRules[ruleIndex + value];

  //   // If the next rule doesn't exist, return.
  //   if (nextRule === null) {
  //     return;
  //   }

  //   const nextRuleIndex = this.firewallRules.indexOf(nextRule);

  //   [this.firewallRules[ruleIndex], this.firewallRules[nextRuleIndex]] = [
  //     this.firewallRules[nextRuleIndex],
  //     this.firewallRules[ruleIndex],
  //   ];

  //   this.dirty = true;
  // }

  getFirewallRules() {
    this.firewallRuleGroupService
      .v1NetworkSecurityFirewallRuleGroupsIdGet({
        id: this.Id,
        join: 'firewallRules',
      })
      .subscribe(data => {
        this.firewallRules = data.firewallRules;
        this.TierId = data.tierId;
      });
  }

  // duplicateFirewallRule(rule: FirewallRule) {
  //   const ruleIndex = this.firewallRules.indexOf(rule);

  //   if (ruleIndex === -1) {
  //     return;
  //   }

  //   const dupRule = this.hs.deepCopy(rule) as FirewallRule;
  //   dupRule.Name = `${dupRule.Name}_copy`;

  //   this.firewallRules.splice(ruleIndex, 0, dupRule);
  //   this.dirty = true;
  // }

  createFirewallRule() {
    this.subscribeToFirewallRuleModal();
    this.firewallRuleModalMode = ModalMode.Create;

    const dto = new FirewallRuleModalDto();
    dto.FirewallRuleGroupId = this.Id;

    this.ngx.setModalData(this.hs.deepCopy(dto), 'firewallRuleModal');
    this.firewallRuleModalMode = ModalMode.Create;
    this.ngx.getModal('firewallRuleModal').open();
  }

  editFirewallRule(firewallRule: FirewallRule) {
    this.subscribeToFirewallRuleModal();
    this.firewallRuleModalMode = ModalMode.Edit;

    const dto = new FirewallRuleModalDto();
    dto.FirewallRule = firewallRule;
    dto.TierId = this.TierId;
    dto.FirewallRuleGroupId = this.Id;

    this.ngx.setModalData(dto, 'firewallRuleModal');
    this.ngx.getModal('firewallRuleModal').open();
  }

  subscribeToFirewallRuleModal() {
    this.firewallRuleModalSubscription = this.ngx
      .getModal('firewallRuleModal')
      .onAnyCloseEvent.subscribe((modal: NgxSmartModalComponent) => {
        const data = modal.getData() as FirewallRuleModalDto;
        // if (data && data.FirewallRule !== undefined) {
        //   this.saveFirewallRule(data.FirewallRule);
        // }
        this.ngx.resetModalData('firewallRuleModal');
      });
  }

  saveFirewallRule(firewallRule: FirewallRule) {
    if (!this.firewallRules) {
      this.firewallRules = new Array<FirewallRule>();
    }

    if (this.firewallRuleModalMode === ModalMode.Create) {
      this.firewallRules.push(firewallRule);
    } else {
      this.firewallRules[this.editFirewallRuleIndex] = firewallRule;
    }
    this.dirty = true;
  }

  updateFirewallRules() {
    // TODO: Update Firewall Rule Group
  }

  deleteFirewallRule(firewallRule: FirewallRule) {
    // TODO: Yes/No Modal
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
