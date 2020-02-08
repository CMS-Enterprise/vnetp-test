import { Component, OnInit, OnDestroy } from '@angular/core';
import { V1TiersService, Tier, Datacenter } from 'api_client';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-deploy',
  templateUrl: './deploy.component.html',
})
export class DeployComponent implements OnInit, OnDestroy {
  currentDatacenterSubscription: Subscription;
  currentDatacenter: Datacenter;

  navIndex = 0;
  tiers: Tier[];

  constructor(
    private datacenterTiersService: V1TiersService,
    private datacenterService: DatacenterContextService,
  ) {}

  getTiers() {
    this.datacenterTiersService
      .v1DatacentersDatacenterIdTiersGet({
        datacenterId: this.currentDatacenter.id,
      })
      .subscribe(data => {
        this.tiers = data;
      });
  }

  ngOnInit() {
    this.currentDatacenterSubscription = this.datacenterService.currentDatacenter.subscribe(
      cd => {
        if (cd) {
          this.currentDatacenter = cd;
          this.getTiers();
        }
      },
    );
  }

  deployTiers() {
    // TODO: Launch Provisioning Jobs for each Selected Tier.
  }

  ngOnDestroy() {}
}
