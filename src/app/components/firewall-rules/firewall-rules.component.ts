import { Component, OnInit } from '@angular/core';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { Vrf } from 'src/app/models/d42/vrf';
import { HelpersService } from 'src/app/services/helpers.service';
import { FirewallRulesHelpText } from 'src/app/helptext/help-text-networking';

@Component({
  selector: 'app-firewall-rules',
  templateUrl: './firewall-rules.component.html'
})
export class FirewallRulesComponent implements OnInit {
  navIndex = 0;

  vrfs: Array<Vrf>;

  constructor(private automationApiService: AutomationApiService, private hs: HelpersService,
              public helpText: FirewallRulesHelpText) {
  }

  ngOnInit() {
    this.getVrfs();
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
