import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd, PRIMARY_OUTLET } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss'],
})
export class BreadcrumbComponent implements OnInit, OnDestroy {
  public breadcrumbs: Breadcrumb[] = [];
  public render = true;

  private routesNotToRender = ['/unauthorized', '/logout', '/login'];
  private routeChanges: Subscription;

  public currentMode = '';

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    const path = window.location.pathname;

    if (path.split('/').some(c => c === 'appcentric')) {
      this.currentMode = 'appcentric';
    } else {
      this.currentMode = 'netcentric';
    }

    const dashboardBreadcrumb: Breadcrumb = {
      label: 'Dashboard',
      url: `/${this.currentMode}/dashboard`,
    };

    this.breadcrumbs.push(dashboardBreadcrumb);
    const root = this.route.root;
    const newBreadCrumbs = this.getBreadcrumbs(root);
    this.breadcrumbs = [dashboardBreadcrumb, ...newBreadCrumbs];

    this.routeChanges = this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      const root: ActivatedRoute = this.route.root;
      const currentRoute = this.router.url.split('?')[0];

      this.render = !this.routesNotToRender.some(r => r.includes(currentRoute));

      const breadcrumbs = this.getBreadcrumbs(root);
      this.breadcrumbs = [dashboardBreadcrumb, ...breadcrumbs];
    });
  }

  ngOnDestroy(): void {
    SubscriptionUtil.unsubscribe([this.routeChanges]);
  }

  private getBreadcrumbs(route: ActivatedRoute, url: string = '', breadcrumbs: Breadcrumb[] = []): Breadcrumb[] {
    const ROUTE_DATA_BREADCRUMB = 'breadcrumb';
    const children: ActivatedRoute[] = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      if (child.outlet !== PRIMARY_OUTLET) {
        continue;
      }

      if (!child.snapshot.data.hasOwnProperty(ROUTE_DATA_BREADCRUMB)) {
        return this.getBreadcrumbs(child, url, breadcrumbs);
      }

      const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');

      url += `/${this.currentMode}/${routeURL}`;

      const breadcrumb: Breadcrumb = {
        label: child.snapshot.data[ROUTE_DATA_BREADCRUMB],
        url,
      };

      const existingBreadcrumbLabels = breadcrumbs.map(b => b.label);
      if (!existingBreadcrumbLabels.includes(breadcrumb.label)) {
        breadcrumbs.push(breadcrumb);
      }
      return this.getBreadcrumbs(child, url, breadcrumbs);
    }
    return breadcrumbs;
  }
}

export interface Breadcrumb {
  label: string;
  url: string;
}
