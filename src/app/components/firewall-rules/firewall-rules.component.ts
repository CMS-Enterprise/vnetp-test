import { Component, OnInit, OnDestroy } from '@angular/core';
import { Tier, V1TiersService, FirewallRuleGroup, V1NetworkSecurityFirewallRuleGroupsService } from 'client';
import { Subscription } from 'rxjs';
import { TierContextService } from 'src/app/services/tier-context.service';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import UndeployedChangesUtil from '../../utils/UndeployedChangesUtil';

@Component({
  selector: 'app-firewall-rules',
  templateUrl: './firewall-rules.component.html',
})
export class FirewallRulesComponent implements OnInit, OnDestroy {
  public currentFirewallRulePage = 1;
  public firewallRuleGroups: FirewallRuleGroup[] = [];
  public perPage = 50;
  public currentTier: Tier;

  private currentTierSubscription: Subscription;

  constructor(private tierService: V1TiersService, public tierContextService: TierContextService) {}

  public getTiers(): void {
    this.tierService
      .getOneTier({
        id: this.currentTier.id,
        join: ['firewallRuleGroups'],
      })
      .subscribe(data => {
        this.firewallRuleGroups = data.firewallRuleGroups;
      });
  }

  public filterFirewallRuleGroup = (firewallRuleGroup: FirewallRuleGroup): boolean => firewallRuleGroup.name !== 'Intravrf';

  public getTierName(tierId: string): string {
    return ObjectUtil.getObjectName(tierId, [this.currentTier], 'Error Resolving Name');
  }

  public importFirewallRuleGroupsConfig(): void {
    return console.log('method not implemented');
  }

  ngOnInit(): void {
    this.currentTierSubscription = this.tierContextService.currentTier.subscribe(ct => {
      if (ct) {
        this.currentTier = ct;
        this.getTiers();
      }
    });
  }

  ngOnDestroy(): void {
    SubscriptionUtil.unsubscribe([this.currentTierSubscription]);
  }

  checkUndeployedChanges(object) {
    return UndeployedChangesUtil.hasUndeployedChanges(object);
  }
}
