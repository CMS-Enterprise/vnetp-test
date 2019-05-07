import { Component, OnInit } from '@angular/core';
import { AutomationApiService } from 'src/app/services/automation-api.service';

@Component({
  selector: 'app-firewall-rules',
  templateUrl: './firewall-rules.component.html',
  styleUrls: ['./firewall-rules.component.css']
})
export class FirewallRulesComponent implements OnInit {

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

    return firewallRules ? firewallRules.length : 0;
  }
}
