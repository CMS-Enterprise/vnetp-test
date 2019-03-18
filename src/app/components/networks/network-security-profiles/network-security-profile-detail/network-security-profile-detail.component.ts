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

  firewall_rules = [];

  Id = '';

  constructor(private route: ActivatedRoute, private automationApiService: AutomationApiService, private papa: Papa) { }

  ngOnInit() {
    this.Id += this.route.snapshot.paramMap.get('id');
    this.getNetworkSecurityProfile();
  }

  moveRule(value: number, rule) {

    const ruleIndex = this.firewall_rules.indexOf(rule);

    if (ruleIndex === -1 || ruleIndex === 0 && value === -1 || ruleIndex + value === this.firewall_rules.length) { return; }

    const nextRule = this.firewall_rules[ruleIndex + value];

    if (nextRule === null) { return; }

    const nextRuleIndex = this.firewall_rules.indexOf(nextRule);

    [this.firewall_rules[ruleIndex], this.firewall_rules[nextRuleIndex]] =
    [this.firewall_rules[nextRuleIndex], this.firewall_rules[ruleIndex]];
  }

  getNetworkSecurityProfile() {
    this.automationApiService.getSubnet(this.Id).subscribe(
      data => this.subnet = data,
      error => console.error(error),
      () => this.getFirewallRules()
    );
  }

  getFirewallRules(){
    const firewallrules = this.subnet.custom_fields.find(c => c.key === 'firewall_rules');

    if (firewallrules) {
    this.firewall_rules = JSON.parse(firewallrules.value);
    }
  }

  addNetworkSecurityProfileRule() {
    if (this.firewall_rules == null) { this.firewall_rules = []; }

    const nspr = new NetworkSecurityProfileRule();
    nspr.Edit = true;
    nspr.Action =  0;
    this.firewall_rules.push(nspr);
  }


  deleteNetworkSecurityProfileRule(rule){
    this.firewall_rules.splice(this.firewall_rules.indexOf(rule), 1);
  }

  updateNetworkSecurityProfile() {

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
    var files = evt.target.files; // FileList object
    var file = files[0];
    var reader = new FileReader();
    reader.readAsText(file);
    reader.onload = (event) => {
      var csv = event.target.result; // Content of CSV file
      this.parseCsv(csv);
    };
  }

  parseCsv(csv) {
    let options = {
      header: true,
      complete: (results, file) => {
        this.insertFirewallRules(results.data);
      }
    };

    this.papa.parse(csv, options);
  }

  insertFirewallRules(rules){
    console.log(rules);

    rules.forEach(rule => {
      this.firewall_rules.push(rule);
    });
  }
}
