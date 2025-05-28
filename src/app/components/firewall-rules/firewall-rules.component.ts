import { Component, OnInit, OnDestroy } from '@angular/core';
import { Tier, V1TiersService, FirewallRuleGroup, V1NetworkSecurityFirewallRuleGroupsService } from 'client';
import { Subscription } from 'rxjs';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { TierContextService } from 'src/app/services/tier-context.service';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import UndeployedChangesUtil from '../../utils/UndeployedChangesUtil';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

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

  private appIdEnabled: boolean;

  constructor(
    private ngx: NgxSmartModalService,
    private tierService: V1TiersService,
    public tierContextService: TierContextService,
    private firewallRuleGroupService: V1NetworkSecurityFirewallRuleGroupsService,
    private router: Router,
  ) {}

  navigateToEdit(firewallRuleGroup: any): void {
    this.router.navigate(['/netcentric/firewall-rules/edit', firewallRuleGroup.id], {
      state: { appIdEnabled: this.appIdEnabled },
      queryParamsHandling: 'merge',
    });
  }

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
        obj[key] = ObjectUtil.getObjectId(val as string, [this.currentTier]);
        obj.tierId = obj[key];
        delete obj[key];
      }
    });
    return obj;
  }

  ngOnInit(): void {
    this.currentTierSubscription = this.tierContextService.currentTier.subscribe(ct => {
      if (ct) {
        const appIdEnabledEnv = environment?.dynamic?.appIdEnabled;
        const appIdEnabledTier = ct.appIdEnabled;
        console.log('appIdEnabledEnv', appIdEnabledEnv);
        console.log('appIdEnabledTier', appIdEnabledTier);
        this.appIdEnabled = appIdEnabledEnv && appIdEnabledTier;
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
