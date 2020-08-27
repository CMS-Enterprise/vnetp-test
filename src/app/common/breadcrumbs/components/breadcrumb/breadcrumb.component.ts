import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd, PRIMARY_OUTLET } from '@angular/router';
import { filter } from 'rxjs/operators';
import { User } from 'src/app/models/user/user';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss'],
})
export class BreadcrumbComponent implements OnInit {
  public breadcrumbs: Breadcrumb[] = [];
  public currentUser: User;

  constructor(private router: Router, private route: ActivatedRoute, private auth: AuthService) {}

  ngOnInit() {
    const breadcrumb: Breadcrumb = {
      label: 'Dashboard',
      url: '/dashboard',
    };

    this.auth.currentUser.subscribe(u => (this.currentUser = u));

    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      const root: ActivatedRoute = this.route.root;
      this.breadcrumbs = this.getBreadcrumbs(root);
      this.breadcrumbs = [breadcrumb, ...this.breadcrumbs];
    });
  }

  private getBreadcrumbs(route: ActivatedRoute, url: string = '', breadcrumbs: Breadcrumb[] = []): Breadcrumb[] {
    const ROUTE_DATA_BREADCRUMB = 'breadcrumb';
    const children: ActivatedRoute[] = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      if (child.outlet !== PRIMARY_OUTLET || child.snapshot.url.length === 0) {
        continue;
      }

      if (!child.snapshot.data.hasOwnProperty(ROUTE_DATA_BREADCRUMB)) {
        return this.getBreadcrumbs(child, url, breadcrumbs);
      }

      const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');

      url += `/${routeURL}`;

      const breadcrumb: Breadcrumb = {
        label: child.snapshot.data[ROUTE_DATA_BREADCRUMB],
        url,
      };
      breadcrumbs.push(breadcrumb);
      return this.getBreadcrumbs(child, url, breadcrumbs);
    }
    return breadcrumbs;
  }
}

export interface Breadcrumb {
  label: string;
  url: string;
}
