import { Component, OnInit, OnDestroy } from '@angular/core';
import { Tier, V1TiersService } from 'api_client';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { Subscription } from 'rxjs';
import SubscriptionUtil from 'src/app/utils/subscription.util';

@Component({
  selector: 'app-static-routes',
  templateUrl: './static-routes.component.html',
  styleUrls: ['./static-routes.component.scss'],
})
export class StaticRoutesComponent implements OnInit, OnDestroy {
  public DatacenterId: string;
  public tiers: Tier[] = [];

  private currentDatacenterSubscription: Subscription;

  constructor(private datacenterContextService: DatacenterContextService, private tierService: V1TiersService) {}

  public getTiers(): void {
    this.tierService
      .v1TiersGet({
        filter: `datacenterId||eq||${this.DatacenterId}`,
        join: 'staticRoutes',
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
    SubscriptionUtil.unsubscribe([this.currentDatacenterSubscription]);
  }
}
