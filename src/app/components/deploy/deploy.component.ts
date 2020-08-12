import { Component, OnInit } from '@angular/core';
import { V1TiersService, Tier, Datacenter, V1TierGroupsService, TierGroup, V1JobsService, Job, FirewallRuleGroupType } from 'api_client';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { Subscription } from 'rxjs';
import { TableRowWrapper } from 'src/app/models/other/table-row-wrapper';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';

@Component({
  selector: 'app-deploy',
  templateUrl: './deploy.component.html',
})
export class DeployComponent implements OnInit {
  currentDatacenterSubscription: Subscription;
  currentDatacenter: Datacenter;

  navIndex = 0;
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
    const modalDto = new YesNoModalDto('Deploy Tiers', `Are you sure you would like to deploy ${tierCount}?`);

    this.ngx.setModalData(modalDto, 'yesNoModal');

    const confirmationModal = this.ngx.getModal('yesNoModal');
    confirmationModal.open();
    const yesNoModalSubscription = confirmationModal.onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
      const modalData = modal.getData() as YesNoModalDto;
      modal.removeData();
      if (modalData && modalData.modalYes) {
        this.launchTierProvisioningJobs(tiersToDeploy);
      }
      yesNoModalSubscription.unsubscribe();
    });
  }

  public getTierGroupName = (id: string): string => {
    return this.getObjectName(id, this.tierGroups);
    // tslint:disable-next-line: semicolon
  };

  private getObjectName(id: string, objects: { name: string; id?: string }[]): string {
    if (!objects) {
      return 'N/A';
    }
    const object = objects.find(o => o.id === id);
    return object ? object.name : 'N/A';
  }

  private getTierGroups(loadTiers = false): void {
    this.tierGroupService
      .v1TierGroupsGet({
        filter: `datacenterId||eq||${this.currentDatacenter.id}`,
      })
      .subscribe(data => {
        this.tierGroups = data;

        if (loadTiers) {
          this.getTiers();
        }
      });
  }

  private getTiers(): void {
    this.tierService
      .v1DatacentersDatacenterIdTiersGet({
        datacenterId: this.currentDatacenter.id,
        join: 'firewallRuleGroups',
      })
      .subscribe(data => {
        this.tiers = data.map(tier => new TableRowWrapper(tier));
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

      this.jobService.v1JobsPost({ job: tierProvisionJob }).subscribe(data => {});

      const tierNetworkSecurityJob = {} as Job;

      tierNetworkSecurityJob.datacenterId = this.currentDatacenter.id;
      tierNetworkSecurityJob.jobType = 'provision-tier-network-security';
      tierNetworkSecurityJob.definition = {
        tierId: tier.id,
        intervrfFirewallRuleGroupId: tier.firewallRuleGroups.find(f => f.type === FirewallRuleGroupType.Intervrf).id,
        externalFirewallRuleGroupId: tier.firewallRuleGroups.find(f => f.type === FirewallRuleGroupType.External).id,
      };

      this.jobService.v1JobsPost({ job: tierNetworkSecurityJob }).subscribe(data => {});
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
