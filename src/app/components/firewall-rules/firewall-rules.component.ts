import { Component, OnInit } from '@angular/core';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { Vrf } from 'src/app/models/d42/vrf';
import { HelpersService } from 'src/app/services/helpers.service';

@Component({
  selector: 'app-firewall-rules',
  templateUrl: './firewall-rules.component.html',
  styleUrls: ['./firewall-rules.component.css']
})
export class FirewallRulesComponent implements OnInit {
  navIndex = 0;

  subnets: any;
  vrfs: Array<Vrf>;

  constructor(private automationApiService: AutomationApiService, private hs: HelpersService) {
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

  getFirewallRulesCount(object, type) {
    if (type === 'external') {
     const firewallRules =  this.hs.getJsonCustomField(object, 'external_firewall_rules');
     return firewallRules ? firewallRules.length : 0;
    } else if (type === 'intervrf') {
      const firewallRules =  this.hs.getJsonCustomField(object, 'firewall_rules');
      return firewallRules ? firewallRules.length : 0;
    } else if (type === 'intravrf') {
      const contracts = this.hs.getJsonCustomField(object, 'intravrf_contracts');
      return contracts ? contracts.length : 0;
    }
  }
}
