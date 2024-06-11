import { Injectable, OnDestroy } from '@angular/core';
import { Router, NavigationStart, UrlTree } from '@angular/router';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NavigationInterceptorService implements OnDestroy {
  private config: { [key: string]: string[] } = {
    'wan-form': ['tenantId'], // Remove tenantId if the URL does not include 'wan-form'
    netcentric: ['datacenter'], // Remove datacenterId if the URL does not include 'netcentric'
    // Add more configurations as needed
  };

  private subscription: Subscription;

  constructor(private router: Router) {
    this.subscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.handleNavigationStart(event);
      }
    });
  }

  private handleNavigationStart(event: NavigationStart): void {
    const urlTree: UrlTree = this.router.parseUrl(event.url);
    const queryParams = { ...urlTree.queryParams };
    let modified = false;

    for (const pattern in this.config) {
      if (!event.url.includes(pattern)) {
        this.config[pattern].forEach(param => {
          if (param in queryParams) {
            delete queryParams[param];
            modified = true;
          }
        });
      }
    }

    if (!modified) {
      return;
    }

    // Create a new URL tree with the updated query parameters
    const newUrlTree = this.router.createUrlTree([event.url.split('?')[0]], {
      queryParams,
      fragment: urlTree.fragment,
      preserveFragment: true,
    });

    this.router.navigateByUrl(newUrlTree, { replaceUrl: true });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
