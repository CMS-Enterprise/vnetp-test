import { Component, OnInit, OnDestroy } from '@angular/core';
import { Tier, V1TiersService, FirewallRuleGroup } from 'client';
import { Subscription } from 'rxjs';
import { NgxSmartModalService } from 'ngx-smart-modal';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

@Component({
  selector: 'app-firewall-rule-group',
  templateUrl: './firewall-rule-group.component.html',
})
export class FirewallRuleGroupComponent implements OnInit, OnDestroy {
  public currentFirewallRulePage = 1;
  public perPage = 50;
  public currentTier: Tier;
  tiers;
  firewallRuleGroups = [];
  public fwRuleGroupModalSubscription: Subscription;

  private currentTierSubscription: Subscription;

  constructor(private ngx: NgxSmartModalService, private tierService: V1TiersService) {}

  public getTiers(): void {
    this.firewallRuleGroups = [];
    this.tierService
      .getManyTier({
        join: ['firewallRuleGroups'],
      })
      .subscribe(data => {
        this.tiers = data;
        this.tiers.map(tier => {
          tier.firewallRuleGroups.map(group => {
            this.firewallRuleGroups.push(group);
          });
        });
      });
  }

  public subscribeToFirewallRuleGroupModal(): void {
    this.fwRuleGroupModalSubscription = this.ngx.getModal('firewallRuleGroupModal').onCloseFinished.subscribe(() => {
      this.ngx.resetModalData('firewallRuleGroupModal');
      this.fwRuleGroupModalSubscription.unsubscribe();
      this.getTiers();
    });
  }

  public openFWRuleGroupModal(modalMode?): void {
    const dto: any = {};
    dto.ModalMode = modalMode;
    this.subscribeToFirewallRuleGroupModal();
    this.ngx.setModalData(dto, 'firewallRuleGroupModal');
    this.ngx.getModal('firewallRuleGroupModal').open();
  }

  public filterFirewallRuleGroup = (firewallRuleGroup: FirewallRuleGroup): boolean => firewallRuleGroup.name !== 'Intravrf';

  public getTierName(tierId: string): string {
    return ObjectUtil.getObjectName(tierId, this.tiers, 'Error Resolving Name');
  }

  // public importFirewallRuleGroupsConfig(event): void {
  //   const modalDto = new YesNoModalDto(
  //     'Import Firewall Rule Groups',
  //     `Are you sure you would like to import ${event.length} firewall rule group${event.length > 1 ? 's' : ''}?`,
  //   );

  //   const onConfirm = () => {
  //     const dto = this.sanitizeData(event);
  //     this.firewallRuleGroupService
  //       .createManyFirewallRuleGroup({
  //         createManyFirewallRuleGroupDto: { bulk: dto },
  //       })
  //       .subscribe(() => {
  //         this.getTiers();
  //       });
  //   };

  //   SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm);
  // }

  // private sanitizeData(entities: any[]): any[] {
  //   return entities.map(entity => {
  //     this.mapToCsv(entity);
  //     return entity;
  //   });
  // }

  // private mapToCsv(obj: any): any {
  //   Object.entries(obj).forEach(([key, val]) => {
  //     if (val === null || val === '') {
  //       delete obj[key];
  //     }
  //     if (key === 'ipAddress') {
  //       obj[key] = String(val).trim();
  //     }
  //     if (key === 'vrf_name' || key === 'vrfName') {
  //       obj[key] = ObjectUtil.getObjectId(val as string, [this.currentTier]);
  //       obj.tierId = obj[key];
  //       delete obj[key];
  //     }
  //   });
  //   return obj;
  // }

  ngOnInit(): void {
    this.getTiers();
  }

  ngOnDestroy(): void {
    SubscriptionUtil.unsubscribe([this.currentTierSubscription]);
  }
}
