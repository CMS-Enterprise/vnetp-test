import { Component, OnInit, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { Tier, V1TiersService } from 'client';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { Subscription } from 'rxjs';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { TableConfig } from '../../common/table/table.component';

@Component({
  selector: 'app-static-routes',
  templateUrl: './static-routes.component.html',
  styleUrls: ['./static-routes.component.scss'],
})
export class StaticRoutesComponent implements OnInit, OnDestroy {
  public DatacenterId: string;
  public tiers: Tier[] = [];

  private currentDatacenterSubscription: Subscription;

  public isLoading = false;

  @ViewChild('nameTemplate') nameTemplate: TemplateRef<any>;
  @ViewChild('staticRouteTemplate') staticRouteTemplate: TemplateRef<any>;

  public config: TableConfig<any> = {
    description: 'Static Routes listed by Tier',
    columns: [
      { name: 'Tier', template: () => this.nameTemplate },
      { name: 'Static Routes', template: () => this.staticRouteTemplate },
    ],
  };

  constructor(private datacenterContextService: DatacenterContextService, private tierService: V1TiersService) {}

  public getTiers(): void {
    this.isLoading = true;
    this.tierService
      .getManyTier({
        filter: [`datacenterId||eq||${this.DatacenterId}`],
        join: ['staticRoutes'],
        page: 1,
        perPage: 1000,
      })
      .subscribe(
        (data: unknown) => {
          this.tiers = data as Tier[];
        },
        () => {
          this.tiers = [];
        },
        () => {
          this.isLoading = false;
        },
      );
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
