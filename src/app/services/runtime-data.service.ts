import { Injectable } from '@angular/core';
import { Observable, interval } from 'rxjs';
import { switchMap, takeWhile, finalize } from 'rxjs/operators';
import { V1JobsService } from '../../../client';
import { TowerJobDto } from '../../../client/model/towerJobDto';
import { TenantStateService } from './tenant-state.service';

@Injectable({
  providedIn: 'root',
})
export class RuntimeDataService {
  constructor(private jobsService: V1JobsService, private tenantStateService: TenantStateService) {}

  calculateTimeDifference(timestamp: string): string {
    if (timestamp === null || timestamp === undefined) {
      return '-';
    }
    const lastRefreshedDate = new Date(timestamp);
    const now = Date.now();
    const difference = now - lastRefreshedDate.getTime();

    const secondsDifference = Math.floor(difference / 1000);
    const minutes = Math.floor(secondsDifference / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
    if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }
    return `${secondsDifference} second${secondsDifference > 1 ? 's' : ''} ago`;
  }

  isRecentlyRefreshed(lastRefreshedTimestamp: string, thresholdInSeconds = 60): boolean {
    if (!lastRefreshedTimestamp) {
      return false;
    }

    const currentTime = new Date();
    const lastRefreshedTime = new Date(lastRefreshedTimestamp);
    const diffInSeconds = (currentTime.getTime() - lastRefreshedTime.getTime()) / 1000;

    return diffInSeconds <= thresholdInSeconds;
  }

  pollJobStatus(jobId: string, tenant?: string, timeBetweenPolls = 10000, maxPollAttempts = 30): Observable<TowerJobDto> {
    let attempts = 0;

    return interval(timeBetweenPolls).pipe(
      switchMap(() => {
        attempts++;
        if (tenant) {
          this.tenantStateService.setTenant(tenant);
        }
        return this.jobsService.getJobStatusJob({ id: jobId }).pipe(
          finalize(() => {
            if (tenant) {
              this.tenantStateService.clearTenant();
            }
          }),
        );
      }),
      takeWhile((status: TowerJobDto) => (status.status === 'running' || status.status === 'pending') && attempts <= maxPollAttempts, true),
    );
  }
}
