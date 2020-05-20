import { Component, OnInit, OnDestroy } from '@angular/core';
import { Tier, V1TiersService } from 'api_client';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-static-routes',
  templateUrl: './static-routes.component.html',
  styleUrls: ['./static-routes.component.scss'],
})
export class StaticRoutesComponent implements OnInit, OnDestroy {
  tiers: Array<Tier>;
  DatacenterId: string;
  currentDatacenterSubscription: Subscription;

  constructor(private datacenterContextService: DatacenterContextService, private tierService: V1TiersService) {}

  getTiers() {
    this.tierService
      .v1DatacentersDatacenterIdTiersGet({
        datacenterId: this.DatacenterId,
      })
      .subscribe(data => {
        this.tiers = data;
      });
  }

  ngOnInit() {
    this.currentDatacenterSubscription = this.datacenterContextService.currentDatacenter.subscribe(cd => {
      if (cd) {
        this.DatacenterId = cd.id;
        this.tiers = [];
        this.getTiers();
      }
    });
  }

  ngOnDestroy() {
    this.currentDatacenterSubscription.unsubscribe();
  }
}
