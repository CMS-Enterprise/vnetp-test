import { Component, OnInit, OnDestroy } from '@angular/core';
import { NatRule, NatRuleGroup, Tier, V1TiersService } from 'client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { Subscription, of, Observable } from 'rxjs';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Tab } from '../../common/tabs/tabs.component';
import { NatRulesHelpText } from '../../helptext/help-text-networking';
import { DatacenterContextService } from '../../services/datacenter-context.service';
import ObjectUtil from '../../utils/ObjectUtil';
import SubscriptionUtil from '../../utils/SubscriptionUtil';
import { NatRuleGroupTypeEnum } from 'client';

@Component({
  selector: 'app-nat-rules',
  templateUrl: './nat-rules.component.html',
})
export class NatRulesComponent implements OnInit, OnDestroy {
  public DatacenterId: string;
  public currentNatRulePage = 1;
  public currentTier: Tier;
  public perPage = 20;
  public ModalMode = ModalMode;
  public natRules: NatRule[] = [];
  public natRuleGroups: NatRuleGroup[] = [];
  public currentTab = NatRuleGroupTypeEnum.External;
  public tiers: Tier[] = [];
  public tabs: Tab[] = [
    {
      name: 'External',
      tooltip: this.helpText.External,
    },
    {
      name: 'Intervrf',
      tooltip: this.helpText.InterVrf,
    },
  ];

  private currentDatacenterSubscription: Subscription;

  constructor(
    public helpText: NatRulesHelpText,
    private ngx: NgxSmartModalService,
    private datacenterContextService: DatacenterContextService,
    private tierService: V1TiersService,
  ) {}

  public ngOnInit(): void {
    this.currentDatacenterSubscription = this.datacenterContextService.currentDatacenter.subscribe(cd => {
      if (cd) {
        this.DatacenterId = cd.id;
        this.getTiers();
      }
    });
  }

  public getTiers(): void {
    this.tierService
      .getManyDatacenterTier({
        datacenterId: this.DatacenterId,
        join: ['natRuleGroups'],
      })
      .subscribe((data: unknown) => {
        this.tiers = data as Tier[];
        console.log(this.tiers);
        this.natRuleGroups = [];
        this.tiers.forEach(tier => {
          this.natRuleGroups = this.natRuleGroups.concat(tier.natRuleGroups);
        });
      });
  }

  public handleTabChange(tab: Tab): void {
    this.currentTab = tab.name === 'External' ? NatRuleGroupTypeEnum.External : NatRuleGroupTypeEnum.Intervrf;
  }

  public ngOnDestroy(): void {
    SubscriptionUtil.unsubscribe([this.currentDatacenterSubscription]);
  }

  public getTierName(tierId: string): string {
    return ObjectUtil.getObjectName(tierId, this.tiers, 'Error Resolving Name');
  }

  public filterNatRuleGroup = (natRuleGroup: NatRuleGroup): boolean => {
    if (!natRuleGroup) {
      return false;
    }
    return natRuleGroup.type === this.currentTab;
  };
}
