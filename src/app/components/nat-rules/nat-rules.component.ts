import { Component, OnInit, OnDestroy } from '@angular/core';
import { NatRule, NatRuleGroup, Tier, V1TiersService } from 'client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { Subscription } from 'rxjs';
import { NatRulesHelpText } from '../../helptext/help-text-networking';
import { TierContextService } from 'src/app/services/tier-context.service';
import ObjectUtil from '../../utils/ObjectUtil';
import SubscriptionUtil from '../../utils/SubscriptionUtil';
import UndeployedChangesUtil from '../../utils/UndeployedChangesUtil';

@Component({
  selector: 'app-nat-rules',
  templateUrl: './nat-rules.component.html',
})
export class NatRulesComponent implements OnInit, OnDestroy {
  public DatacenterId: string;
  public currentNatRulePage = 1;
  public currentTier: Tier;
  public perPage = 50;
  public ModalMode = ModalMode;
  public natRules: NatRule[] = [];
  public natRuleGroups: NatRuleGroup[] = [];
  public tiers: Tier[] = [];

  private currentTierSubscription: Subscription;

  constructor(public helpText: NatRulesHelpText, private tierContextService: TierContextService, private tierService: V1TiersService) {}

  public ngOnInit(): void {
    this.currentTierSubscription = this.tierContextService.currentTier.subscribe(ct => {
      if (ct) {
        this.currentTier = ct;
        this.getTiers();
      }
    });
  }

  public getTiers(): void {
    this.tierService
      .getOneTier({
        id: this.currentTier.id,
        join: ['natRuleGroups'],
      })
      .subscribe(data => {
        this.natRuleGroups = data.natRuleGroups;
      });
  }

  public ngOnDestroy(): void {
    SubscriptionUtil.unsubscribe([this.currentTierSubscription]);
  }

  public getTierName(tierId: string): string {
    return ObjectUtil.getObjectName(tierId, [this.currentTier], 'Error Resolving Name');
  }

  checkUndeployedChangesGroup(group: NatRuleGroup): boolean {
    return UndeployedChangesUtil.hasUndeployedChanges(group);
  }
}
