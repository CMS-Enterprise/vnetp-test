import { Injectable } from '@angular/core';
import { Observable, Subscription, interval } from 'rxjs';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class RuntimeDataService {
  constructor() {}

  calculateTimeDifference(timestamp: string): string {
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

  refreshRuntimeData(
    createJobRequest: Observable<any>,
    pollFunction: () => void,
    timeBetweenPolls: number = 1000,
    maxPollAttempts: number = 120,
  ): Subscription {
    let pollingSubscription: Subscription;

    createJobRequest.subscribe(() => {
      let pollAttempts = 0;
      pollingSubscription = interval(timeBetweenPolls)
        .pipe(take(maxPollAttempts))
        .subscribe(() => {
          pollAttempts++;
          console.log(`Polling attempt ${pollAttempts}`);
          pollFunction();
          if (pollAttempts >= maxPollAttempts) {
            pollingSubscription.unsubscribe();
          }
        });
    });

    return pollingSubscription;
  }
}
