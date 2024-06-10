import { Injectable } from '@angular/core';
import { Router, NavigationStart, UrlTree, DefaultUrlSerializer } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class NavigationInterceptorService {
  private config: { [key: string]: string[] } = {
    'wan-form': ['tenantId'], // Remove tenantId if the URL does not include 'wan-form'
    netcentric: ['datacenter'], // Remove datacenterId if the URL does not include 'netcentric'
    // Add more configurations as needed
  };

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
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

    const newUrl = new DefaultUrlSerializer().serialize(newUrlTree);

    this.router.navigateByUrl(newUrl, { replaceUrl: true });
  }
}
