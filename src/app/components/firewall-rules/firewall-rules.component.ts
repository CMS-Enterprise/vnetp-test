import { Component, OnInit } from '@angular/core';
import { FirewallRulesHelpText } from 'src/app/helptext/help-text-networking';
import {
  Tier,
  V1TiersService,
  V1DatacentersService,
  FirewallRuleGroup,
  FirewallRuleGroupType,
} from 'api_client';
import { Subscription } from 'rxjs';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';

@Component({
  selector: 'app-firewall-rules',
  templateUrl: './firewall-rules.component.html',
})
export class FirewallRulesComponent implements OnInit {
  navIndex = FirewallRuleGroupType.External;

  tiers: Array<Tier>;
  currentDatacenterSubscription: Subscription;
  firewallRuleGroups: Array<FirewallRuleGroup>;
  DatacenterId: string;

  constructor(
    public helpText: FirewallRulesHelpText,
    private datacenterContextService: DatacenterContextService,
    private tierService: V1TiersService,
  ) {}

  getTiers() {
    this.tierService
      .v1DatacentersDatacenterIdTiersGet({
        datacenterId: this.DatacenterId,
        join: 'firewallRuleGroups',
      })
      .subscribe(data => {
        this.tiers = data;

        this.firewallRuleGroups = new Array<FirewallRuleGroup>();

        this.tiers.forEach(tier => {
          this.firewallRuleGroups = this.firewallRuleGroups.concat(
            tier.firewallRuleGroups,
          );
        });
      });
  }

  filterFirewallRuleGroup = (firewallRuleGroup: FirewallRuleGroup) => {
    return firewallRuleGroup.type === this.navIndex;
    // Using arrow function to pass execution context.
    // tslint:disable-next-line: semicolon
  };

  getTierName(tierId: string) {
    return this.tiers.find(t => t.id === tierId).name || 'Error Resolving Name';
  }

  ngOnInit() {
    this.currentDatacenterSubscription = this.datacenterContextService.currentDatacenter.subscribe(
      cd => {
        if (cd) {
          this.DatacenterId = cd.id;
          this.getTiers();
        }
      },
    );
  }
}
