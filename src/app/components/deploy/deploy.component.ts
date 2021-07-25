import { Component, OnInit } from '@angular/core';
import { V1TiersService, Tier, Datacenter, V1TierGroupsService, TierGroup, V1JobsService, Job, FirewallRuleGroupTypeEnum } from 'client';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { Subscription } from 'rxjs';
import { TableRowWrapper } from 'src/app/models/other/table-row-wrapper';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

@Component({
  selector: 'app-deploy',
  templateUrl: './deploy.component.html',
})
export class DeployComponent implements OnInit {
  currentDatacenterSubscription: Subscription;
  currentDatacenter: Datacenter;

  tierGroups: TierGroup[] = [];
  tiers: TableRowWrapper<Tier>[] = [];

  constructor(
    private tierService: V1TiersService,
    private tierGroupService: V1TierGroupsService,
    private datacenterService: DatacenterContextService,
    private jobService: V1JobsService,
    private ngx: NgxSmartModalService,
  ) {}

  public deployTiers(): void {
    const tiersToDeploy = this.tiers.filter(t => t.isSelected === true).map(t => t.item);
    if (!tiersToDeploy.length) {
      return;
    }

    const tierCount = tiersToDeploy.length === 1 ? '1 tier' : `${tiersToDeploy.length} tiers`;
    const onConfirm = () => {
      this.launchTierProvisioningJobs(tiersToDeploy);
    };

    SubscriptionUtil.subscribeToYesNoModal(
      new YesNoModalDto('Deploy Tiers', `Are you sure you would like to deploy ${tierCount}?`),
      this.ngx,
      onConfirm,
    );
  }

  public getTierGroupName = (id: string): string => this.getObjectName(id, this.tierGroups);

  private getObjectName(id: string, objects: { name: string; id?: string }[]): string {
    if (!objects) {
      return 'N/A';
    }
    const object = objects.find(o => o.id === id);
    return object ? object.name : 'N/A';
  }

  private getTierGroups(loadTiers = false): void {
    this.tierGroupService
      .getManyTierGroup({
        filter: [`datacenterId||eq||${this.currentDatacenter.id}`],
      })
      .subscribe((data: unknown) => {
        this.tierGroups = data as TierGroup[];

        if (loadTiers) {
          this.getTiers();
        }
      });
  }

  private getTiers(): void {
    this.tierService
      .getManyDatacenterTier({
        datacenterId: this.currentDatacenter.id,
        join: ['firewallRuleGroups'],
      })
      .subscribe((data: unknown) => {
        this.tiers = (data as Tier[]).map(tier => new TableRowWrapper(tier));
      });
  }

  private launchTierProvisioningJobs(tiersToDeploy: Tier[]): void {
    tiersToDeploy.forEach(tier => {
      const tierProvisionJob = {} as Job;

      tierProvisionJob.datacenterId = this.currentDatacenter.id;
      tierProvisionJob.jobType = 'provision-tier';
      tierProvisionJob.definition = {
        tierId: tier.id,
      };

      this.jobService.createOneJob({ job: tierProvisionJob }).subscribe(() => {});

      const tierNetworkSecurityJob = {} as Job;

      tierNetworkSecurityJob.datacenterId = this.currentDatacenter.id;
      tierNetworkSecurityJob.jobType = 'provision-tier-network-security';
      tierNetworkSecurityJob.definition = {
        tierId: tier.id,
        intervrfFirewallRuleGroupId: tier.firewallRuleGroups.find(f => f.type === FirewallRuleGroupTypeEnum.Intervrf).id,
        externalFirewallRuleGroupId: tier.firewallRuleGroups.find(f => f.type === FirewallRuleGroupTypeEnum.External).id,
      };

      this.jobService.createOneJob({ job: tierNetworkSecurityJob }).subscribe(() => {});
    });
  }

  ngOnInit() {
    this.currentDatacenterSubscription = this.datacenterService.currentDatacenter.subscribe(cd => {
      if (cd) {
        this.currentDatacenter = cd;
        this.getTierGroups(true);
      }
    });
  }
}
