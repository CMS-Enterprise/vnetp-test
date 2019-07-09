import { Component, OnInit } from '@angular/core';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { Vrf } from 'src/app/models/d42/vrf';

@Component({
  selector: 'app-firewall-rules',
  templateUrl: './firewall-rules.component.html',
  styleUrls: ['./firewall-rules.component.css']
})
export class FirewallRulesComponent implements OnInit {
  navIndex = 0;

  subnets: any;
  vrfs: Array<Vrf>;

  constructor(private automationApiService: AutomationApiService) {
    this.subnets = [];
  }

  ngOnInit() {
    this.getVrfs();
    this.getNetworks();
  }

  getNetworks() {
    this.automationApiService.getSubnets().subscribe(
      data => this.subnets = data,
      error => {}
      );
  }

  getVrfs() {
    this.automationApiService.getVrfs().subscribe(
      data => this.vrfs = data
    );
  }

  getFirewallRulesCount(object) {
    const jsonFirewallRules = object.custom_fields.find(c => c.key === 'firewall_rules');

    const firewallRules = JSON.parse(jsonFirewallRules.value);

    return firewallRules ? firewallRules.length : 0;
  }
}
