import { Component, OnInit, OnDestroy } from '@angular/core';
import { FirewallRulesHelpText } from 'src/app/helptext/help-text-networking';
import { Tier, V1TiersService, FirewallRuleGroup, FirewallRuleGroupTypeEnum, V1NetworkSecurityFirewallRuleGroupsService } from 'client';
import { Subscription } from 'rxjs';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { Tab } from 'src/app/common/tabs/tabs.component';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

@Component({
  selector: 'app-firewall-rules',
  templateUrl: './firewall-rules.component.html',
})
export class FirewallRulesComponent implements OnInit, OnDestroy {
  public DatacenterId: string;
  public currentFirewallRulePage = 1;
  public firewallRuleGroups: FirewallRuleGroup[] = [];
  public currentTab = FirewallRuleGroupTypeEnum.External;
  public perPage = 20;
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
    public helpText: FirewallRulesHelpText,
    private ngx: NgxSmartModalService,
    private datacenterContextService: DatacenterContextService,
    private tierService: V1TiersService,
    private firewallRuleGroupService: V1NetworkSecurityFirewallRuleGroupsService,
  ) {}

  public handleTabChange(tab: Tab): void {
    this.currentTab = tab.name === 'External' ? FirewallRuleGroupTypeEnum.External : FirewallRuleGroupTypeEnum.Intervrf;
  }

  public getTiers(): void {
    this.tierService
      .getManyDatacenterTier({
        datacenterId: this.DatacenterId,
        join: ['firewallRuleGroups'],
      })
      .subscribe((data: unknown) => {
        this.tiers = data as Tier[];
        this.firewallRuleGroups = [];
        this.tiers.forEach(tier => {
          this.firewallRuleGroups = this.firewallRuleGroups.concat(tier.firewallRuleGroups);
        });
      });
  }

  public filterFirewallRuleGroup = (firewallRuleGroup: FirewallRuleGroup): boolean => {
    return firewallRuleGroup.type === this.currentTab;
    // tslint:disable-next-line: semicolon
  };

  public getTierName(tierId: string): string {
    return ObjectUtil.getObjectName(tierId, this.tiers, 'Error Resolving Name');
  }

  public importFirewallRuleGroupsConfig(event): void {
    const modalDto = new YesNoModalDto(
      'Import Firewall Rule Groups',
      `Are you sure you would like to import ${event.length} firewall rule group${event.length > 1 ? 's' : ''}?`,
    );

    const onConfirm = () => {
      const dto = this.sanitizeData(event);
      this.firewallRuleGroupService
        .createManyFirewallRuleGroup({
          createManyFirewallRuleGroupDto: { bulk: dto },
        })
        .subscribe(() => {
          this.getTiers();
        });
    };

    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm);
  }

  private sanitizeData(entities: any[]): any[] {
    return entities.map(entity => {
      this.mapToCsv(entity);
      return entity;
    });
  }

  private mapToCsv(obj: any): any {
    Object.entries(obj).forEach(([key, val]) => {
      if (val === null || val === '') {
        delete obj[key];
      }
      if (key === 'ipAddress') {
        obj[key] = String(val).trim();
      }
      if (key === 'vrf_name' || key === 'vrfName') {
        obj[key] = ObjectUtil.getObjectId(val as string, this.tiers);
        obj.tierId = obj[key];
        delete obj[key];
      }
    });
    return obj;
  }

  ngOnInit(): void {
    this.currentDatacenterSubscription = this.datacenterContextService.currentDatacenter.subscribe(cd => {
      if (cd) {
        this.DatacenterId = cd.id;
        this.getTiers();
      }
    });
  }

  ngOnDestroy(): void {
    SubscriptionUtil.unsubscribe([this.currentDatacenterSubscription]);
  }
}
