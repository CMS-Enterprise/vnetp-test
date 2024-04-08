import { Component, ElementRef, Input, OnInit, QueryList, ViewChildren } from '@angular/core';
import { F5ConfigJobCreateDtoTypeEnum, F5Runtime, V1RuntimeDataF5ConfigService } from '../../../../../client';
import { ActivatedRoute, Router } from '@angular/router';
import { F5ConfigService } from '../f5-config.service';
import { RuntimeDataService } from '../../../services/runtime-data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-f5-config-card',
  templateUrl: './f5-config-card.component.html',
  styleUrls: ['./f5-config-card.component.css'],
})
export class F5ConfigCardComponent implements OnInit {
  @Input() f5Config: F5Runtime;
  softwareVersion: string;
  highAvailabilityStatus: string;
  hostName: string;
  lastRefreshed: string;
  pollingSubscription: Subscription;
  isRefreshingRuntimeData = false;
  jobStatus: string;

  @ViewChildren('bootstrapTooltip') tooltips: QueryList<ElementRef>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private f5StateManagementService: F5ConfigService,
    private runtimeDataService: RuntimeDataService,
    private f5ConfigService: V1RuntimeDataF5ConfigService,
  ) {}

  ngOnInit(): void {
    const f5Data = this.f5Config.data as any;
    this.softwareVersion = f5Data?.hostInfo?.softwareVersion;
    this.highAvailabilityStatus = f5Data?.hostInfo?.availability?.status;
    this.hostName = this.f5Config.hostname;
    this.lastRefreshed = this.runtimeDataService.calculateTimeDifference(this.f5Config.runtimeDataLastRefreshed);
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
    if (this.isRecentlyRefreshed() || this.isRefreshingRuntimeData) {
      return;
    }
    this.isRefreshingRuntimeData = true;

    this.f5ConfigService
      .createRuntimeDataJobF5Config({
        f5ConfigJobCreateDto: {
          type: F5ConfigJobCreateDtoTypeEnum.F5Config,
          id: this.f5Config.id,
        },
      })
      .subscribe(job => {
        this.runtimeDataService.pollJobStatus(job.id).subscribe({
          next: towerJobDto => {
            console.log('component status sub: ', towerJobDto);
            if (towerJobDto.status === 'successful') {
              this.jobStatus = towerJobDto.status;
              this.updateF5Config();
            } else if (towerJobDto.status === 'failed') {
              this.jobStatus = towerJobDto.status;
              this.isRefreshingRuntimeData = false;
            } else if (towerJobDto.status === 'running') {
              this.jobStatus = towerJobDto.status;
            }
          },
          error: () => {
            this.jobStatus = 'error';
            this.isRefreshingRuntimeData = false;
          },
          complete: () => {
            this.isRefreshingRuntimeData = false;
          },
        });
      });
  }

  private updateF5Config(): void {
    this.f5ConfigService.getManyF5Config({ filter: [`hostname||eq||${this.f5Config.hostname}`] }).subscribe(data => {
      if (data.length !== 1) {
        return;
      }
      this.f5Config = data[0];
    });
  }

  isRecentlyRefreshed(): boolean {
    return this.runtimeDataService.isRecentlyRefreshed(this.f5Config.runtimeDataLastRefreshed);
  }

  // if active make circle green with text active, if not active make circle grey with status
  getTooltipMessage(status: string): string {
    switch (status) {
      case 'failed':
        return 'Job Status: Failed';
      case 'running':
        return 'Job Status: Timeout';
      case 'error':
        return 'An error occurred during polling';
      default:
        return status;
    }
  }
}
