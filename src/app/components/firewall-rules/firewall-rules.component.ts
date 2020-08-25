import { Component, OnInit } from '@angular/core';
import { FirewallRulesHelpText } from 'src/app/helptext/help-text-networking';
import { Tier, V1TiersService, FirewallRuleGroup, FirewallRuleGroupType, V1NetworkSecurityFirewallRuleGroupsService } from 'api_client';
import { Subscription } from 'rxjs';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { NgxSmartModalComponent, NgxSmartModalService } from 'ngx-smart-modal';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { Tab } from 'src/app/common/tabs/tabs.component';
import ObjectUtil from 'src/app/utils/object.util';

@Component({
  selector: 'app-firewall-rules',
  templateUrl: './firewall-rules.component.html',
})
export class FirewallRulesComponent implements OnInit {
  navIndex = FirewallRuleGroupType.External;
  currentFirewallRulePage = 1;

  tiers: Array<Tier>;
  currentDatacenterSubscription: Subscription;
  firewallRuleGroups: Array<FirewallRuleGroup>;
  DatacenterId: string;

  perPage = 20;

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

  constructor(
    public helpText: FirewallRulesHelpText,
    private ngx: NgxSmartModalService,
    private datacenterContextService: DatacenterContextService,
    private tierService: V1TiersService,
    private firewallRuleGroupService: V1NetworkSecurityFirewallRuleGroupsService,
  ) {}

  public handleTabChange(tab: Tab): void {
    this.navIndex = tab.name === 'External' ? FirewallRuleGroupType.External : FirewallRuleGroupType.Intervrf;
  }

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
          this.firewallRuleGroups = this.firewallRuleGroups.concat(tier.firewallRuleGroups);
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

  importFirewallRuleGroupsConfig(event) {
    const modalDto = new YesNoModalDto(
      'Import Firewall Rule Groups',
      `Are you sure you would like to import ${event.length} firewall rule group${event.length > 1 ? 's' : ''}?`,
    );
    this.ngx.setModalData(modalDto, 'yesNoModal');
    this.ngx.getModal('yesNoModal').open();

    const yesNoModalSubscription = this.ngx.getModal('yesNoModal').onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
      const modalData = modal.getData() as YesNoModalDto;
      modal.removeData();
      if (modalData && modalData.modalYes) {
        const dto = this.sanitizeData(event);
        this.firewallRuleGroupService
          .v1NetworkSecurityFirewallRuleGroupsBulkPost({
            generatedFirewallRuleGroupBulkDto: { bulk: dto },
          })
          .subscribe(data => {
            this.getTiers();
          });
      }
      yesNoModalSubscription.unsubscribe();
    });
  }

  sanitizeData(entities: any) {
    return entities.map(entity => {
      this.mapToCsv(entity);
      return entity;
    });
  }

  mapToCsv = obj => {
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
    // tslint:disable-next-line: semicolon
  };

  ngOnInit() {
    this.currentDatacenterSubscription = this.datacenterContextService.currentDatacenter.subscribe(cd => {
      if (cd) {
        this.DatacenterId = cd.id;
        this.getTiers();
      }
    });
  }
}
