import { Component, OnInit } from '@angular/core';
import { NetworkSecurityProfile } from 'src/app/models/network-security-profile';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { ActivatedRoute } from '@angular/router';
import { NetworkSecurityProfileRule } from 'src/app/models/network-security-profile-rule';
import { Papa } from 'ngx-papaparse';

@Component({
  selector: 'app-network-security-profile-detail',
  templateUrl: './network-security-profile-detail.component.html',
  styleUrls: ['./network-security-profile-detail.component.css']
})
export class NetworkSecurityProfileDetailComponent implements OnInit {

  subnet: any;

  firewall_rules: any;

  Id = '';

  constructor(private route: ActivatedRoute, private automationApiService: AutomationApiService, private papa: Papa) {
    this.subnet = {};
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
      data => this.subnet = data,
      error => console.error(error),
      () => this.getFirewallRules()
    );
  }

  getFirewallRules() {
    const firewallrules = this.subnet.custom_fields.find(c => c.key === 'firewall_rules');

    if (firewallrules) {
    this.firewall_rules = JSON.parse(firewallrules.value);
    }
  }

  addFirewallRule() {
    if (this.firewall_rules == null) { this.firewall_rules = []; }

    const nspr = new NetworkSecurityProfileRule();
    nspr.Edit = true;
    nspr.Action =  0;
    this.firewall_rules.push(nspr);
  }


  deleteFirewallRule(rule) {
    this.firewall_rules.splice(this.firewall_rules.indexOf(rule), 1);
  }

  updateFirewallRules() {
    const body = {
      extra_vars: `{\"customer_id\": ${this.subnet.name},\"vlan_id\": ${this.subnet.description},
      \"firewall_rules\": ${JSON.stringify(this.firewall_rules)},\"subnet_id\": ${this.subnet.subnet_id}}`
    };

    this.automationApiService.launchTemplate('update_asa_acl', body).subscribe(
      data => {},
      error => console.log(error)
    );
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
    rules.forEach(rule => {
      if (rule.Name !== '') {
        this.firewall_rules.push(rule);
      }
    });
  }
}
