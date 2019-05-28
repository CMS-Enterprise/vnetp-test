import { Component, OnInit } from '@angular/core';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { ActivatedRoute } from '@angular/router';
import { FirewallRule } from 'src/app/models/firewall-rule';
import { Papa } from 'ngx-papaparse';
import { MessageService } from 'src/app/services/message.service';
import { Subnet } from 'src/app/models/d42/subnet';
import { HelpersService } from 'src/app/services/helpers.service';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { ModalMode } from 'src/app/models/modal-mode';
import { Subscription } from 'rxjs';
import { NetworkObjectDto } from 'src/app/models/network-object-dto';
import { NetworkObject } from 'src/app/models/network-object';
import { NetworkObjectGroup } from 'src/app/models/network-object-group';
import { ServiceObject } from 'src/app/models/service-object';
import { ServiceObjectGroup } from 'src/app/models/service-object-group';
import { ServiceObjectDto } from 'src/app/models/service-object-dto';
import { FirewallRuleModalDto } from 'src/app/models/firewall-rule-modal-dto';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-firewall-rules-detail',
  templateUrl: './firewall-rules-detail.component.html',
  styleUrls: ['./firewall-rules-detail.component.css']
})
export class FirewallRulesDetailComponent implements OnInit {
  Id = '';
  subnet: Subnet;
  dirty: boolean;
  deployedState: boolean;
  firewallRules: Array<FirewallRule>;

  networkObjects: Array<NetworkObject>;
  networkObjectGroups: Array<NetworkObjectGroup>;
  serviceObjects: Array<ServiceObject>;
  serviceObjectGroups: Array<ServiceObjectGroup>;


  editFirewallRuleIndex: number;
  firewallRuleModalMode: ModalMode;
  firewallRuleModalSubscription: Subscription;
  downloadJsonHref: any;
  downloadCsvHref: any;

  constructor(private route: ActivatedRoute, private automationApiService: AutomationApiService, private messageService: MessageService,
              private papa: Papa, private hs: HelpersService, private ngx: NgxSmartModalService, private sanitizer: DomSanitizer) {
    this.subnet = new Subnet();
    this.firewallRules = [];
   }

  ngOnInit() {
    this.Id += this.route.snapshot.paramMap.get('id');
    this.getSubnet();
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
  }

  getSubnet() {
    this.automationApiService.getSubnet(this.Id).subscribe(
      data => {
        this.subnet = data as Subnet;
        this.deployedState = this.hs.getBooleanCustomField(this.subnet, 'deployed');
        this.getSubnetCustomFields();
        this.getVrfCustomFields();
      }
    );
  }

  getSubnetCustomFields() {
    const firewallrules = this.subnet.custom_fields.find(c => c.key === 'firewall_rules');

    if (firewallrules) {
    this.firewallRules = JSON.parse(firewallrules.value) as Array<FirewallRule>;
    }
  }

  getVrfCustomFields() {
    this.automationApiService.getVrfs().subscribe(data => {
      const result = data;
      const vrf = result.find(v => v.id === this.subnet.vrf_group_id);

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

    }, error => { console.log(error); });
  }


  duplicateFirewallRule(rule) {
    const ruleIndex = this.firewallRules.indexOf(rule);

    if (ruleIndex === -1) { return; }

    const dupRule = this.hs.deepCopy(rule);
    dupRule.Deleted = false;

    this.firewallRules.splice(ruleIndex, 0, dupRule);
  }

  createFirewallRule() {
    this.subscribeToFirewallRuleModal();
    this.firewallRuleModalMode = ModalMode.Create;

    const dto = new FirewallRuleModalDto();
    dto.VrfId = this.subnet.vrf_group_id;

    this.ngx.setModalData(this.hs.deepCopy(dto), 'firewallRuleModal');
    this.firewallRuleModalMode = ModalMode.Create;
    this.ngx.getModal('firewallRuleModal').open();
  }

  editFirewallRule(firewallRule: FirewallRule) {
    this.subscribeToFirewallRuleModal();
    this.firewallRuleModalMode = ModalMode.Edit;

    const dto = new FirewallRuleModalDto();
    dto.FirewallRule = firewallRule;
    dto.VrfId = this.subnet.vrf_group_id;

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

    let extra_vars: {[k: string]: any} = {};
    extra_vars.subnet = this.subnet;
    extra_vars.firewall_rules = firewallRules;

    const body = { extra_vars };

    if (this.deployedState) {
      this.automationApiService.launchTemplate('deploy-acl', body).subscribe();
    } else {
      this.automationApiService.launchTemplate('save-acl', body).subscribe();
    }

    this.messageService.filter('Job Launched');
  }

  deleteFirewallRule(firewallRule: FirewallRule) {
    const index = this.firewallRules.indexOf(firewallRule);
    if ( index > -1) {
      this.firewallRules.splice(index, 1);
      this.dirty = true;
    }
  }

  handleFileSelect(evt) {
    const files = evt.target.files; // FileList object
    const file = files[0];
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
      this.parseCsv(reader.result);
    };
  }

  parseCsv(csv) {
    const options = {
      header: true,
      complete: (results) => {
        this.insertFirewallRules(results.data);
      }
    };
    this.papa.parse(csv, options);
  }

  insertFirewallRules(rules) {
    if (this.firewallRules == null) { this.firewallRules = new Array<FirewallRule>(); }
    rules.forEach(rule => {
      if (rule.Name !== '') {
        this.firewallRules.push(rule);
      }
    });
  }

 downloadJson() {
    const fwRulesJson = JSON.stringify(this.firewallRules);
    const uri = this.sanitizer.bypassSecurityTrustUrl('data:text/json;charset=UTF-8,' + encodeURIComponent(fwRulesJson));
    this.downloadJsonHref = uri;
}

downloadCsv() {
  const fwRulesCsv = this.papa.unparse(this.firewallRules);
  const uri = this.sanitizer.bypassSecurityTrustUrl('data:text/csv;charset=UTF-8,' + encodeURIComponent(fwRulesCsv));
  this.downloadCsvHref = uri;
}
}
