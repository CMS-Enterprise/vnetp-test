import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  V1TiersService,
  Tier,
  Datacenter,
  V1TierGroupsService,
  TierGroup,
  V1JobsService,
  Job,
} from 'api_client';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { Subscription } from 'rxjs';
import { TableRowWrapper } from 'src/app/models/other/table-row-wrapper';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';

@Component({
  selector: 'app-deploy',
  templateUrl: './deploy.component.html',
})
export class DeployComponent implements OnInit, OnDestroy {
  currentDatacenterSubscription: Subscription;
  currentDatacenter: Datacenter;

  navIndex = 0;
  tierGroups = Array<TierGroup>();
  tiers = Array<TableRowWrapper<Tier>>();

  constructor(
    private tierService: V1TiersService,
    private tierGroupService: V1TierGroupsService,
    private datacenterService: DatacenterContextService,
    private jobService: V1JobsService,
    private ngxSmartModal: NgxSmartModalService,
  ) {}

  getTierGroups(getTiers = false) {
    this.tierGroupService
      .v1TierGroupsGet({
        filter: `datacenterId||eq||${this.currentDatacenter.id}`,
      })
      .subscribe(data => {
        this.tierGroups = data;

        if (getTiers) {
          this.getTiers();
        }
      });
  }

  getTiers() {
    this.tierService
      .v1DatacentersDatacenterIdTiersGet({
        datacenterId: this.currentDatacenter.id,
      })
      .subscribe(data => {
        data.forEach(tier => {
          const row = new TableRowWrapper<Tier>(tier);
          this.tiers.push(row);
        });
      });
  }

  getTierGroupName = (id: string) => {
    return this.getObjectName(id, this.tierGroups);
    // tslint:disable-next-line: semicolon
  };

  private getObjectName(id: string, objects: { name: string; id?: string }[]) {
    if (objects && objects.length) {
      return objects.find(o => o.id === id).name || 'N/A';
    }
  }

  ngOnInit() {
    this.currentDatacenterSubscription = this.datacenterService.currentDatacenter.subscribe(
      cd => {
        if (cd) {
          this.currentDatacenter = cd;
          this.getTierGroups(true);
        }
      },
    );
  }

  deployTiers() {
    const tiersToDeploy = this.tiers
      .filter(t => t.isSelected === true)
      .map(t => t.item);

    if (!tiersToDeploy.length) {
      return;
    }

    const modalDto = new YesNoModalDto(
      'Deploy Tiers',
      `Are you sure you would like to deploy ${tiersToDeploy.length} Tiers?`,
    );

    this.ngxSmartModal.setModalData(modalDto, 'yesNoModal');
    this.ngxSmartModal.getModal('yesNoModal').open();
    const yesNoModalSubscription = this.ngxSmartModal
      .getModal('yesNoModal')
      .onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
        const modalData = modal.getData() as YesNoModalDto;
        modal.removeData();
        if (modalData && modalData.modalYes) {
          this.launchTierProvisioningJobs(tiersToDeploy);
        }
        yesNoModalSubscription.unsubscribe();
      });
  }

  launchTierProvisioningJobs(tiersToDeploy: Array<Tier>) {
    tiersToDeploy.forEach(tier => {
      const tierProvisionJob = {} as Job;

      tierProvisionJob.jobType = 'provision-tier';
      tierProvisionJob.definition = {
        datacenterId: this.currentDatacenter.id,
        tierId: tier.id,
      };

      this.jobService
        .v1JobsPost({ job: tierProvisionJob })
        .subscribe(data => {});
    });
  }

  ngOnDestroy() {}
}
