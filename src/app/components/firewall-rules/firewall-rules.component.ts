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
  navIndex = 0;

  tiers: Array<Tier>;
  currentDatacenterSubscription: Subscription;
  firewallRuleGroups: Array<FirewallRuleGroup>;

  constructor(
    public helpText: FirewallRulesHelpText,
    private datacenterContextService: DatacenterContextService,
    private tierService: V1TiersService,
  ) {}

  getTiers(dcId: string) {
    this.tierService
      .v1DatacentersDatacenterIdTiersGet({
        datacenterId: dcId,
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

  ngOnInit() {
    this.currentDatacenterSubscription = this.datacenterContextService.currentDatacenter.subscribe(
      cd => {
        if (cd) {
          this.getTiers(cd.id);
        }
      },
    );
  }
}
