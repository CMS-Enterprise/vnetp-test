import { Component, OnInit, OnDestroy } from '@angular/core';
import { NatRule, NatRuleGroup, NatRuleGroupType, Tier, V1TiersService } from 'api_client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { Subscription, of, Observable } from 'rxjs';
import { NgxSmartModalService } from 'ngx-smart-modal';
import SubscriptionUtil from '../../../utils/SubscriptionUtil';
import { NatRuleModalDto } from '../models/nat-rule-modal-dto';
import { Tab } from '../../../common/tabs/tabs.component';
import ObjectUtil from '../../../utils/ObjectUtil';
import { DatacenterContextService } from '../../../services/datacenter-context.service';
import { NatRulesHelpText } from '../../../helptext/help-text-networking';

@Component({
  selector: 'app-nat-rule-list',
  templateUrl: './nat-rule-list.component.html',
})
export class NatRuleListComponent implements OnInit, OnDestroy {
  public DatacenterId: string;
  public currentNatRulePage = 1;
  public currentTier: Tier;
  public perPage = 20;
  public ModalMode = ModalMode;
  public natRules: NatRule[] = [];
  public natRuleGroups: NatRuleGroup[] = [];
  public currentTab = NatRuleGroupType.External;
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
      .v1DatacentersDatacenterIdTiersGet({
        datacenterId: this.DatacenterId,
        join: 'natRuleGroups',
      })
      .subscribe(data => {
        this.tiers = data;
        this.natRuleGroups = [];
        this.tiers.forEach(tier => {
          this.natRuleGroups = this.natRuleGroups.concat(tier.natRuleGroups);
        });
      });
  }

  public handleTabChange(tab: Tab): void {
    this.currentTab = tab.name === 'External' ? NatRuleGroupType.External : NatRuleGroupType.Intervrf;
  }

  public ngOnDestroy(): void {
    SubscriptionUtil.unsubscribe([this.currentDatacenterSubscription]);
  }

  public deleteNatRule(natRule: NatRule): void {
    // TODO: Implement
  }

  public restoreNatRule(natRule: NatRule): void {
    // TODO: Implement
  }

  // public openNatRuleModal(modalMode: ModalMode, natRule?: NatRule): void {
  //   const modalName = 'natRuleModal';
  //   const dto: NatRuleModalDto = {
  //     tierId: this.currentTier.id,
  //     modalMode,
  //     natRule,
  //   };
  //   this.ngx.setModalData(dto, modalName);
  //   this.ngx.open(modalName);
  // }

  private loadNatRules(tier: Tier): Observable<NatRule[]> {
    const hasCurrentTier = tier && !!tier.id;
    if (!hasCurrentTier) {
      return of([]);
    }
    return of([]);
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
