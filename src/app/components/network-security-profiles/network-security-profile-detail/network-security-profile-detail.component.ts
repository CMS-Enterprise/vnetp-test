import { Component, OnInit } from '@angular/core';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { ActivatedRoute } from '@angular/router';
import { NetworkSecurityProfileRule } from 'src/app/models/network-security-profile-rule';
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

@Component({
  selector: 'app-network-security-profile-detail',
  templateUrl: './network-security-profile-detail.component.html',
  styleUrls: ['./network-security-profile-detail.component.css']
})
export class NetworkSecurityProfileDetailComponent implements OnInit {
  Id = '';
  subnet: Subnet;
  dirty: boolean;
  deployedState: boolean;
  firewall_rules: any;

  networkObjects: Array<NetworkObject>;
  networkObjectGroups: Array<NetworkObjectGroup>;
  serviceObjects: Array<ServiceObject>;
  serviceObjectGroups: Array<ServiceObjectGroup>;


  editFirewallRuleIndex: number;
  networkObjectModalMode: ModalMode;
  networkObjectModalSubscription: Subscription;

  constructor(private route: ActivatedRoute, private automationApiService: AutomationApiService, private messageService: MessageService,
              private papa: Papa, private hs: HelpersService, private ngx: NgxSmartModalService) {
    this.subnet = new Subnet();
    this.firewall_rules = [];
   }

  ngOnInit() {
    this.Id += this.route.snapshot.paramMap.get('id');
    this.getSubnet();
  }

  moveFirewallRule(value: number, rule) {
    const ruleIndex = this.firewall_rules.indexOf(rule);

    // If the rule isn't in the array, is at the start of the array and requested to move up
    // or if the rule is at the end of the array, return.
    if (ruleIndex === -1 || ruleIndex === 0 && value === -1 || ruleIndex + value === this.firewall_rules.length) { return; }

    const nextRule = this.firewall_rules[ruleIndex + value];

    // If the next rule doesn't exist, return.
    if (nextRule === null) { return; }

    const nextRuleIndex = this.firewall_rules.indexOf(nextRule);

    [this.firewall_rules[ruleIndex], this.firewall_rules[nextRuleIndex]] =
    [this.firewall_rules[nextRuleIndex], this.firewall_rules[ruleIndex]];
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
    this.firewall_rules = JSON.parse(firewallrules.value) as Array<NetworkSecurityProfileRule>;
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

  addFirewallRule() {
    if (this.firewall_rules == null) { this.firewall_rules = []; }

    const nspr = new NetworkSecurityProfileRule();
    nspr.Edit = true;
    nspr.Deleted = false;
    nspr.Updated = true;
    nspr.Action =  0;
    this.firewall_rules.push(nspr);
  }

  duplicateFirewallRule(rule) {
    const ruleIndex = this.firewall_rules.indexOf(rule);

    if (ruleIndex === -1) { return; }

    const dupRule = Object.assign({}, rule);
    dupRule.Deleted = false;

    this.firewall_rules.splice(ruleIndex, 0, dupRule);
  }

  createFirewallRule() {
    this.subscribeToFirewallRuleModal();
    this.networkObjectModalMode = ModalMode.Create;
    this.ngx.getModal('firewallRuleModal').open();
  }

  editFirewallRule(firewallRule: NetworkSecurityProfileRule) {
    this.subscribeToFirewallRuleModal();
    this.networkObjectModalMode = ModalMode.Edit;

    const dto = new FirewallRuleModalDto();
    dto.FirewallRule = firewallRule;
    dto.VrfId = this.subnet.vrf_group_id;

    this.ngx.setModalData(Object.assign({}, dto), 'firewallRuleModal');
    this.editFirewallRuleIndex = this.firewall_rules.indexOf(firewallRule);
    this.ngx.getModal('firewallRuleModal').open();
  }

  subscribeToFirewallRuleModal() {
    this.networkObjectModalSubscription =
    this.ngx.getModal('firewallRuleModal').onAnyCloseEvent.subscribe((modal: NgxSmartModalComponent) => {
      let data = modal.getData() as FirewallRuleModalDto;

      if (data !== undefined) {
        data = Object.assign({}, data);
        this.saveFirewallRule(data.FirewallRule);
      }
      this.ngx.resetModalData('firewallRuleModal');
      this.networkObjectModalSubscription.unsubscribe();
    });
  }

  saveFirewallRule(firewallRule: NetworkSecurityProfileRule) {
    if (this.networkObjectModalMode === ModalMode.Create) {
      this.firewall_rules.push(firewallRule);
    } else {
      this.firewall_rules[this.editFirewallRuleIndex] = firewallRule;
    }
    this.dirty = true;
  }

  updateFirewallRules() {
    const firewallRules = this.firewall_rules.filter(r => !r.Deleted);

    var extra_vars: {[k: string]: any} = {};
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

  handleFileSelect(evt) {
    let files = evt.target.files; // FileList object
    let file = files[0];
    let reader = new FileReader();
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
    if (this.firewall_rules == null) { this.firewall_rules = []; }
    rules.forEach(rule => {
      if (rule.Name !== '') {
        this.firewall_rules.push(rule);
      }
    });
  }
}
