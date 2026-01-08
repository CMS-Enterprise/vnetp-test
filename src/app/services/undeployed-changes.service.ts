import { Injectable } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Datacenter, V1TiersService } from '../../../client';
import { DatacenterContextService } from './datacenter-context.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ApplicationMode } from '../models/other/application-mode-enum';
import { RouteDataUtil } from '../utils/route-data.util';

@Injectable({
  providedIn: 'root',
})
export class UndeployedChangesService {
  currentDatacenter: Datacenter;

  private undeployedChangeObjectsSubject = new BehaviorSubject<any | null>(null);
  public undeployedChangeObjects: Observable<any | null> = this.undeployedChangeObjectsSubject.asObservable();

  private undeployedChangesSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  public undeployedChanges: Observable<boolean> = this.undeployedChangesSubject.asObservable();

  public applicationMode: ApplicationMode;

  constructor(
    private datacenterContextService: DatacenterContextService,
    private tierService: V1TiersService,
    private router: Router,
  ) {
    this.setupRouteModeListener();
    this.setupSubscriptions();
    // Get undeployed changes every 30 seconds.
    setInterval(() => {
      this.getUndeployedChanges();
    }, 30 * 1000);
  }

  getUndeployedChanges() {
    if (this.applicationMode === ApplicationMode.APPCENTRIC) {
      return;
    }

    if (this.applicationMode === ApplicationMode.ADMINPORTAL) {
      return;
    }

    if (this.applicationMode === ApplicationMode.TENANTV2) {
      return;
    }

    if (this.applicationMode === ApplicationMode.NETCENTRIC) {
      this.getNetcentricChanges();
    }
  }

  setupSubscriptions() {
    this.datacenterContextService.currentDatacenter.subscribe(datacenterContext => {
      this.currentDatacenter = datacenterContext;
      // Get undeployed changes on datacenter change.
      this.getUndeployedChanges();
    });
  }

  private setupRouteModeListener(): void {
    // Set initial mode
    this.setApplicationModeFromRouter();
    // Update on navigation end
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      this.setApplicationModeFromRouter();
    });
  }

  private setApplicationModeFromRouter(): void {
    // For root-level services, we need to traverse from router state root
    // to find the deepest active route, then traverse up to find mode data
    const deepestRoute = this.getDeepestActiveRoute(this.router.routerState.root);
    this.applicationMode = RouteDataUtil.getApplicationModeFromRoute(deepestRoute);
  }

  /**
   * Traverses down the route tree to find the deepest active route.
   * This is needed for root-level services that don't have access to component-level ActivatedRoute.
   */
  private getDeepestActiveRoute(route: ActivatedRoute): ActivatedRoute {
    let deepestRoute = route;
    while (deepestRoute.firstChild) {
      deepestRoute = deepestRoute.firstChild;
    }
    return deepestRoute;
  }

  getNetcentricChanges(): void {
    if (!this.currentDatacenter) {
      return;
    }

    this.tierService
      .getManyTier({
        filter: [`datacenterId||eq||${this.currentDatacenter.id}`, 'version||gt_prop||provisionedVersion', 'deletedAt||isnull'],
        sort: ['updatedAt,DESC'],
        fields: ['id', 'name'],
        page: 1,
        perPage: 1000,
      })
      .subscribe(response => {
        this.undeployedChangeObjectsSubject.next(response.data);
        this.undeployedChangesSubject.next(response.data.length > 0);
      });
  }

  getAppCentricChanges(): void {
    throw new Error('Not implemented');
  }
}
