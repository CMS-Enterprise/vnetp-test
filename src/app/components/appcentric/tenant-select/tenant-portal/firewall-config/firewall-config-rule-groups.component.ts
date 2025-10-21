import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirewallConfigResolvedData } from './firewall-config.resolver';
import { FirewallRuleGroup, NatRuleGroup, V1TiersService } from '../../../../../../../client';
import { TableConfig } from '../../../../../common/table/table.component';

type RuleGroupType = 'nat' | 'firewall';
type RuleGroup = NatRuleGroup | FirewallRuleGroup;

@Component({
  selector: 'app-firewall-config-rule-groups',
  templateUrl: './firewall-config-rule-groups.component.html',
})
export class FirewallConfigRuleGroupsComponent implements OnInit {
  public resolvedData: FirewallConfigResolvedData | null = null;
  public ruleGroupType: RuleGroupType = 'nat';
  public ruleGroups: RuleGroup[] = [];
  public ruleGroupsTableData: { data: RuleGroup[]; count: number; total: number; page: number; pageCount: number } = {
    data: [],
    count: 0,
    total: 0,
    page: 1,
    pageCount: 1,
  };
  public firewallName: string;

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;
  public perPage = 20;

  public get hasFirewall(): boolean {
    return !!this.resolvedData?.firewall;
  }

  constructor(private route: ActivatedRoute, private router: Router, private tierService: V1TiersService) {}

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.ruleGroupType = (data?.ruleGroupType as RuleGroupType) || 'firewall';
      this.resolvedData = data?.firewall as FirewallConfigResolvedData;
      this.firewallName = this.resolvedData?.firewall?.name;
      this.updateTableConfig();
      this.getRuleGroups();
    });
  }

  private getRuleGroups(): void {
    const tierId = this.resolvedData?.firewall?.tierId;

    if (!tierId) {
      this.setRuleGroups([]);
      return;
    }

    const join = this.ruleGroupType === 'nat' ? ['natRuleGroups'] : ['firewallRuleGroups'];

    this.tierService
      .getOneTier({
        id: tierId,
        join,
      })
      .subscribe(tierData => {
        const groups = (this.ruleGroupType === 'nat' ? tierData?.natRuleGroups : tierData?.firewallRuleGroups) || [];
        this.setRuleGroups(groups as RuleGroup[]);
      });
  }

  private setRuleGroups(groups: RuleGroup[]): void {
    this.ruleGroups = groups;
    this.ruleGroupsTableData = {
      data: groups,
      count: groups.length,
      total: groups.length,
      page: 1,
      pageCount: 1,
    };
  }

  public ruleGroupConfig: TableConfig<RuleGroup> = {
    description: 'Rule Groups',
    hideSearchBar: true,
    hideAdvancedSearch: true,
    columns: [
      { name: 'Name', property: 'name' },
      { name: 'Type', property: 'type' },
      { name: '', template: () => this.actionsTemplate },
    ],
  };

  public get editActionLabel(): string {
    return this.ruleGroupType === 'nat' ? 'Edit NAT Rule Group' : 'Edit Firewall Rule Group';
  }

  public editRuleGroup(ruleGroup: RuleGroup): void {
    if (!this.resolvedData?.firewall?.id) {
      return;
    }

    const outletPath = [
      'firewall-config',
      this.resolvedData?.firewallType ?? 'external-firewall',
      this.resolvedData.firewall.id,
      this.ruleGroupType === 'nat' ? 'nat' : 'rules',
      'edit',
      ruleGroup.id,
    ];

    this.router.navigate(
      [
        '/tenantv2/tenant-select/edit',
        this.resolvedData?.firewall?.tenantId,
        'home',
        {
          outlets: {
            'tenant-portal': outletPath,
          },
        },
      ],
      { queryParamsHandling: 'merge' },
    );
  }

  private updateTableConfig(): void {
    const description = this.ruleGroupType === 'nat' ? 'NAT Rule Groups' : 'Firewall Rule Groups';
    this.ruleGroupConfig = {
      description,
      hideSearchBar: true,
      hideAdvancedSearch: true,
      columns: [
        { name: 'Name', property: 'name' },
        { name: 'Type', property: 'type' },
        { name: '', template: () => this.actionsTemplate },
      ],
    };
  }
}
