import { Component, Input, OnInit } from '@angular/core';
import { Datacenter, F5ConfigJobCreateDtoTypeEnum, F5Runtime, V1RuntimeDataF5ConfigService } from '../../../../../client';
import { ActivatedRoute, Router } from '@angular/router';
import { F5ConfigService } from '../f5-config.service';
import { RuntimeDataService } from '../../../services/runtime-data.service';
import { Subscription } from 'rxjs';
import { DatacenterContextService } from '../../../services/datacenter-context.service';

@Component({
  selector: 'app-f5-config-card',
  templateUrl: './f5-config-card.component.html',
  styleUrls: ['./f5-config-card.component.css'],
})
export class F5ConfigCardComponent implements OnInit {
  @Input() f5Config: F5Runtime;
  softwareVersion: number;
  highAvailabilityStatus: string;
  hostName: string;
  lastRefreshed: string;
  pollingSubscription: Subscription;
  isRefreshingRuntimeData = false;
  currentDatacenter: Datacenter;
  currentDatacenterSubscription: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private f5StateManagementService: F5ConfigService,
    private runtimeDataService: RuntimeDataService,
    private f5ConfigService: V1RuntimeDataF5ConfigService,
    private datacenterContextService: DatacenterContextService,
  ) {}

  ngOnInit(): void {
    const f5Data = this.f5Config.data as any;
    this.softwareVersion = f5Data?.hostInfo?.softwareVersion;
    this.highAvailabilityStatus = f5Data?.hostInfo?.highAvailabilityStatus;
    this.hostName = this.f5Config.hostname;
    this.lastRefreshed = this.runtimeDataService.calculateTimeDifference(this.f5Config.runtimeDataLastRefreshed);
    this.currentDatacenterSubscription = this.datacenterContextService.currentDatacenter.subscribe(cd => {
      if (cd) {
        this.currentDatacenter = cd;
      }
    });
  }

  navigateToDetails(): void {
    const currentQueryParams = this.route.snapshot.queryParams;
    this.f5StateManagementService.changeF5Config(this.f5Config);

    this.router.navigate(['/netcentric/f5-config/partitions', this.f5Config.hostname], {
      relativeTo: this.route,
      queryParams: currentQueryParams,
    });
  }

  refreshF5Config(): void {
    if (this.isRecentlyRefreshed()) {
      return;
    }
    this.isRefreshingRuntimeData = true;
    const createJobRequest = this.f5ConfigService.createRuntimeDataJobF5Config({
      f5ConfigJobCreateDto: {
        type: F5ConfigJobCreateDtoTypeEnum.F5Config,
        datacenterId: this.currentDatacenter.id,
        hostname: this.f5Config.hostname,
      },
    });

    this.pollingSubscription = this.runtimeDataService.refreshRuntimeData(createJobRequest, () => this.pollRuntimeData());
  }

  pollRuntimeData(): void {
    this.f5ConfigService.getManyF5Config({ filter: [`hostname||eq||${this.f5Config.hostname}`] }).subscribe(data => {
      if (data.length !== 1) {
        return;
      }
      const newF5Config = data[0];
      if (newF5Config.runtimeDataLastRefreshed !== this.f5Config.runtimeDataLastRefreshed) {
        this.f5Config = newF5Config;
        this.isRefreshingRuntimeData = false;
        this.pollingSubscription.unsubscribe();
      }
    });
  }

  isRecentlyRefreshed(): boolean {
    return this.runtimeDataService.isRecentlyRefreshed(this.f5Config.runtimeDataLastRefreshed);
  }
}
