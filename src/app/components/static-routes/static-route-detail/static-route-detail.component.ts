import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { StaticRoute } from 'src/app/models/network/static-route';
import { HelpersService } from 'src/app/services/helpers.service';
import { Observable } from 'rxjs';
import { PendingChangesGuard } from 'src/app/guards/pending-changes.guard';
import { Vrf } from 'src/app/models/d42/vrf';

@Component({
  selector: 'app-static-route-detail',
  templateUrl: './static-route-detail.component.html',
  styleUrls: ['./static-route-detail.component.css']
})
export class StaticRouteDetailComponent implements OnInit, PendingChangesGuard {

  constructor(private route: ActivatedRoute, private automationApiService: AutomationApiService,
              private hs: HelpersService) {}

  Id = '';
  vrf: Vrf;
  staticRoutes: Array<StaticRoute>;
  deletedStaticRoutes: Array<StaticRoute>;
  dirty: boolean;

  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    return !this.dirty;
  }

  ngOnInit() {
    this.Id  += this.route.snapshot.paramMap.get('id');
    this.getNetwork();
  }

  getNetwork() {
    this.automationApiService.getVrf(this.Id).subscribe(
      data => {
        this.vrf = data;
        this.getStaticRoutes();
      }
    );
  }

  addStaticRoute() {
    if (this.staticRoutes == null) { this.staticRoutes = new Array<StaticRoute>(); }

    const staticRoute = new StaticRoute();
    staticRoute.Interface = this.vrf.name;
    staticRoute.Edit = true;

    this.staticRoutes.push(staticRoute);
    this.dirty = true;
  }

  deleteStaticRoute(staticRoute: StaticRoute) {
    const index = this.staticRoutes.indexOf(staticRoute);

    if (index > -1) {
      this.staticRoutes.splice(index, 1);
      if (!this.deletedStaticRoutes) { this.deletedStaticRoutes = new Array<StaticRoute>(); }
      this.deletedStaticRoutes.push(staticRoute);
      this.dirty = true;
    }
  }

  updateStaticRoutes() {
    let extra_vars: {[k: string]: any} = {};
    extra_vars.vrf = this.vrf;
    extra_vars.static_routes = this.staticRoutes;

    var body = { extra_vars };

    extra_vars.deleted_static_routes = this.deletedStaticRoutes;
    this.automationApiService.launchTemplate('deploy-static-route', body, true).subscribe();

    this.dirty = false;
    this.deletedStaticRoutes = new Array<StaticRoute>();
  }

  getStaticRoutes() {
    const staticRoutes = this.vrf.custom_fields.find(c => c.key === 'static_routes');

    if (staticRoutes) {
      this.staticRoutes = JSON.parse(staticRoutes.value) as Array<StaticRoute>;
    }
  }

  insertStaticRoutes(routes){
    if (!this.staticRoutes) { this.staticRoutes = new Array<StaticRoute>(); }
    routes.forEach(route => {
      if (routes.Name !== '') {
        this.staticRoutes.push(route);
      }
    });
    this.dirty = true;
  }
}
