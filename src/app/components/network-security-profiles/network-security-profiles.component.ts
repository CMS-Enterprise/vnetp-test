import { Component, OnInit } from '@angular/core';
import { AutomationApiService } from 'src/app/services/automation-api.service';

@Component({
  selector: 'app-network-security-profiles',
  templateUrl: './network-security-profiles.component.html',
  styleUrls: ['./network-security-profiles.component.css']
})
export class NetworkSecurityProfilesComponent implements OnInit {

  subnets: any;

  constructor(private automationApiService: AutomationApiService) { 
    this.subnets = [];
  }

  ngOnInit() {
    this.getNetworks();
  }

  getNetworks() {
    this.automationApiService.getSubnets().subscribe(
      data => this.subnets = data,
      error => {}
      );
  }

  getFirewallRulesCount(subnet) {
    const jsonFirewallRules = subnet.custom_fields.find(c => c.key === 'firewall_rules');

    const firewallRules = JSON.parse(jsonFirewallRules.value);

    if (firewallRules) { return firewallRules.length; } else { return 0; }
  }
}
