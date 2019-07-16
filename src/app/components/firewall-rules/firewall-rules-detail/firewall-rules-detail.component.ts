import { Component, OnInit, HostListener } from '@angular/core';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { ActivatedRoute } from '@angular/router';
import { Subnet } from 'src/app/models/d42/subnet';
import { HelpersService } from 'src/app/services/helpers.service';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { Subscription, Observable } from 'rxjs';
import { NetworkObjectDto } from 'src/app/models/network-objects/network-object-dto';
import { NetworkObject } from 'src/app/models/network-objects/network-object';
import { NetworkObjectGroup } from 'src/app/models/network-objects/network-object-group';
import { ServiceObject } from 'src/app/models/service-objects/service-object';
import { ServiceObjectGroup } from 'src/app/models/service-objects/service-object-group';
import { ServiceObjectDto } from 'src/app/models/service-objects/service-object-dto';
import { FirewallRuleModalDto } from 'src/app/models/firewall/firewall-rule-modal-dto';
import { PendingChangesGuard } from 'src/app/guards/pending-changes.guard';
import { FirewallRule } from 'src/app/models/firewall/firewall-rule';
import { FirewallRuleScope } from 'src/app/models/other/firewall-rule-scope';
import { Vrf } from 'src/app/models/d42/vrf';
import { CustomFieldsObject } from 'src/app/models/interfaces/custom-fields-object.interface';

@Component({
  selector: 'app-firewall-rules-detail',
  templateUrl: './firewall-rules-detail.component.html',
  styleUrls: ['./firewall-rules-detail.component.css']
})
export class FirewallRulesDetailComponent implements OnInit, PendingChangesGuard {
  Id = '';

  subnet: Subnet;
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

  get scopeString() { return this.scope; }

  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    return !this.dirty;
  }

  constructor(private route: ActivatedRoute, private automationApiService: AutomationApiService,
              private hs: HelpersService, private ngx: NgxSmartModalService) {}

  ngOnInit() {
    this.subnet = new Subnet();
    this.firewallRules = new Array<FirewallRule>();
    this.deletedFirewallRules = new Array<FirewallRule>();

    this.Id += this.route.snapshot.paramMap.get('id');
    const scopeUrlElement = this.route.snapshot.url[1].path;

    if (scopeUrlElement === 'external') {
      this.scope = FirewallRuleScope.external;
    } else if (scopeUrlElement === 'vrf') {
      this.scope = FirewallRuleScope.vrf;
    } else if (scopeUrlElement === 'subnet') {
      this.scope = FirewallRuleScope.subnet;
    }

    this.getEntity();
  }

  moveFirewallRule(value: number, rule) {
    const ruleIndex = this.firewallRules.indexOf(rule);

    // If the rule isn't in the array, is at the start of the array and requested to move up
    // or if the rule is at the end of the array, return.
    if (ruleIndex === -1 || ruleIndex === 0 && value === -1 || ruleIndex + value === this.firewallRules.length) { return; }

    const nextRule = this.firewallRules[ruleIndex + value];

    // If the next rule doesn't exist, return.
    if (nextRule === null) { return; }

    const nextRuleIndex = this.firewallRules.indexOf(nextRule);

    [this.firewallRules[ruleIndex], this.firewallRules[nextRuleIndex]] =
    [this.firewallRules[nextRuleIndex], this.firewallRules[ruleIndex]];

    this.dirty = true;
  }

  getEntity() {

    if (this.scope === FirewallRuleScope.subnet) {
    this.automationApiService.getSubnet(this.Id).subscribe(
      data => {
        this.subnet = data as Subnet;
        this.deployedState = this.hs.getBooleanCustomField(this.subnet, 'deployed');
        this.getEntityCustomFields(this.subnet, 'firewall_rules');
        this.getSubnetVrf();
      }
      );
    }

    if (this.scope === FirewallRuleScope.vrf) {
      this.automationApiService.getVrf(this.Id).subscribe(
        data => {
          this.vrf = data as Vrf;
          this.getEntityCustomFields(this.vrf, 'firewall_rules');
          this.getVrfCustomFields(this.vrf);
        }
      );
    }

    if (this.scope === FirewallRuleScope.external) {
      this.automationApiService.getVrf(this.Id).subscribe(
        data => {
          this.vrf = data as Vrf;
          this.getEntityCustomFields(this.vrf, 'external_firewall_rules');
          this.getVrfCustomFields(this.vrf);
        }
      );
    }
  }

  getEntityCustomFields(entity: CustomFieldsObject, fieldName: string) {
    const firewallrules = entity.custom_fields.find(c => c.key === fieldName);

    if (firewallrules) {
    this.firewallRules = JSON.parse(firewallrules.value) as Array<FirewallRule>;
    }
  }

  getSubnetVrf() {
    this.automationApiService.getVrfs().subscribe(data => {
      const result = data;
      const vrf = result.find(v => v.id === this.subnet.vrf_group_id);
      this.getVrfCustomFields(vrf);
    }, error => { console.log(error); });
  }

  getVrfCustomFields(vrf) {
    const networkObjectDto = JSON.parse(vrf.custom_fields.find(c => c.key === 'network_objects').value) as NetworkObjectDto;

    if (networkObjectDto) {
      this.networkObjects = networkObjectDto.NetworkObjects;
      this.networkObjectGroups = networkObjectDto.NetworkObjectGroups;
    }

    const serviceObjectDto = JSON.parse(vrf.custom_fields.find(c => c.key === 'service_objects').value) as ServiceObjectDto;

    if (serviceObjectDto) {
      this.serviceObjects = serviceObjectDto.ServiceObjects;
      this.serviceObjectGroups = serviceObjectDto.ServiceObjectGroups;
    }
  }


  duplicateFirewallRule(rule) {
    const ruleIndex = this.firewallRules.indexOf(rule);

    if (ruleIndex === -1) { return; }

    const dupRule = this.hs.deepCopy(rule);
    dupRule.Deleted = false;

    this.firewallRules.splice(ruleIndex, 0, dupRule);
    this.dirty = true;
  }

  createFirewallRule() {
    this.subscribeToFirewallRuleModal();
    this.firewallRuleModalMode = ModalMode.Create;

    const dto = new FirewallRuleModalDto();

    if (this.scope === FirewallRuleScope.subnet) {
    dto.VrfId = this.subnet.vrf_group_id;
    } else {
      dto.VrfId = this.vrf.id;
    }

    this.ngx.setModalData(this.hs.deepCopy(dto), 'firewallRuleModal');
    this.firewallRuleModalMode = ModalMode.Create;
    this.ngx.getModal('firewallRuleModal').open();
  }

  editFirewallRule(firewallRule: FirewallRule) {
    this.subscribeToFirewallRuleModal();
    this.firewallRuleModalMode = ModalMode.Edit;

    const dto = new FirewallRuleModalDto();
    dto.FirewallRule = firewallRule;

    if (this.scope === FirewallRuleScope.subnet) {
    dto.VrfId = this.subnet.vrf_group_id;
    } else {
      dto.VrfId = this.vrf.id;
    }

    this.ngx.setModalData(this.hs.deepCopy(dto), 'firewallRuleModal');
    this.editFirewallRuleIndex = this.firewallRules.indexOf(firewallRule);
    this.ngx.getModal('firewallRuleModal').open();
  }

  subscribeToFirewallRuleModal() {
    this.firewallRuleModalSubscription =
    this.ngx.getModal('firewallRuleModal').onAnyCloseEvent.subscribe((modal: NgxSmartModalComponent) => {
      const data = modal.getData() as FirewallRuleModalDto;

      if (data && data.FirewallRule !== undefined) {
        this.saveFirewallRule(data.FirewallRule);
      }
      this.ngx.resetModalData('firewallRuleModal');
      this.firewallRuleModalSubscription.unsubscribe();
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
    const firewallRules = this.firewallRules.filter(r => !r.Deleted);
    this.dirty = false;

    let extra_vars: {[k: string]: any} = {};

    if (this.scope === FirewallRuleScope.subnet) {
      extra_vars.scope = 'subnet';
      extra_vars.subnet = this.subnet;
      extra_vars.vrf_group_name = this.subnet.vrf_group_name;
      extra_vars.firewall_rules = firewallRules;
    } else if (this.scope === FirewallRuleScope.vrf) {
      extra_vars.scope = 'vrf';
      extra_vars.vrf = this.vrf;
      extra_vars.vrf_group_name = this.vrf.name;
      extra_vars.firewall_rules = firewallRules;
    } else if (this.scope === FirewallRuleScope.external) {
      extra_vars.scope = 'external';
      extra_vars.vrf = this.vrf;
      extra_vars.vrf_group_name = this.vrf.name;
      extra_vars.external_firewall_rules = firewallRules;
    }

    extra_vars.deleted_firewall_rules = this.deletedFirewallRules;

    const body = { extra_vars };

    if (this.scope === FirewallRuleScope.subnet) {
    if (this.deployedState) {
      this.automationApiService.launchTemplate('deploy-acl', body, true).subscribe();
    } else {
      this.automationApiService.launchTemplate('save-acl', body, true).subscribe();
    }
  } else if (this.scope === FirewallRuleScope.vrf || this.scope === FirewallRuleScope.external) {
    this.automationApiService.launchTemplate('deploy-acl', body, true).subscribe();
  }
    this.deletedFirewallRules = new Array<FirewallRule>();
}

  deleteFirewallRule(firewallRule: FirewallRule) {
    const index = this.firewallRules.indexOf(firewallRule);
    if ( index > -1) {
      this.firewallRules.splice(index, 1);
      this.dirty = true;
      this.deletedFirewallRules.push(this.hs.deepCopy(firewallRule));
    }
  }

  insertFirewallRules(rules) {
    if (this.firewallRules == null) { this.firewallRules = new Array<FirewallRule>(); }
    rules.forEach(rule => {
      if (rule.Name !== '') {
        this.firewallRules.push(rule);
      }
    });
    this.dirty = true;
  }
}

