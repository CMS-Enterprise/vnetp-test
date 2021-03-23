import { AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { LoadBalancerRoute, Tier, V1LoadBalancerRoutesService } from 'api_client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { combineLatest, Subscription } from 'rxjs';
import { TableConfig } from 'src/app/common/table/table.component';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { EntityService } from 'src/app/services/entity.service';
import { TierContextService } from 'src/app/services/tier-context.service';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { RouteModalDto } from '../route-modal/route-modal.dto';

export interface RouteView extends LoadBalancerRoute {
  nameView: string;
  state: string;
}

@Component({
  selector: 'app-route-list',
  templateUrl: './route-list.component.html',
})
export class RouteListComponent implements OnInit, OnDestroy, AfterViewInit {
  public currentTier: Tier;
  public tiers: Tier[] = [];

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

  public config: TableConfig<RouteView> = {
    description: 'Routes in the currently selected Tier',
    columns: [
      { name: 'Name', property: 'nameView' },
      { name: 'Destination', property: 'destination' },
      { name: 'Gateway', property: 'gateway' },
      { name: 'State', property: 'state' },
      { name: '', template: () => this.actionsTemplate },
    ],
  };
  public routes: RouteView[] = [];
  public isLoading = false;

  private dataChanges: Subscription;
  private routeChanges: Subscription;

  constructor(
    private datacenterContextService: DatacenterContextService,
    private entityService: EntityService,
    private routesService: V1LoadBalancerRoutesService,
    private ngx: NgxSmartModalService,
    private tierContextService: TierContextService,
  ) {}

  ngOnInit() {
    this.dataChanges = this.subscribeToDataChanges();
  }

  ngAfterViewInit() {
    this.routeChanges = this.subscribeToRouteModal();
  }

  ngOnDestroy() {
    SubscriptionUtil.unsubscribe([this.routeChanges]);
  }

  public delete(route: RouteView): void {
    this.entityService.deleteEntity(route, {
      entityName: 'Route',
      delete$: this.routesService.v1LoadBalancerRoutesIdDelete({ id: route.id }),
      softDelete$: this.routesService.v1LoadBalancerRoutesIdSoftDelete({ id: route.id }),
      onSuccess: () => this.loadRoutes(),
    });
  }

  public loadRoutes(): void {
    this.isLoading = true;

    this.routesService
      .v1LoadBalancerRoutesGet({
        filter: `tierId||eq||${this.currentTier.id}`,
      })
      .subscribe(
        routes => {
          this.routes = routes.map(r => {
            return {
              ...r,
              nameView: r.name.length >= 20 ? r.name.slice(0, 19) + '...' : r.name,
              state: r.provisionedAt ? 'Provisioned' : 'Not Provisioned',
            };
          });
        },
        () => {
          this.routes = [];
        },
        () => {
          this.isLoading = false;
        },
      );
  }

  public import(routes: ImportRoute[]): void {
    const bulk = routes.map(route => {
      const { vrfName } = route;
      if (!vrfName) {
        return route;
      }

      const tierId = ObjectUtil.getObjectId(vrfName, this.tiers);
      return {
        ...route,
        tierId,
      };
    });

    this.routesService
      .v1LoadBalancerRoutesBulkPost({
        generatedLoadBalancerRouteBulkDto: { bulk },
      })
      .subscribe(() => this.loadRoutes());
  }

  public openModal(route?: RouteView): void {
    const dto: RouteModalDto = {
      tierId: this.currentTier.id,
      route,
    };
    this.ngx.setModalData(dto, 'routeModal');
    this.ngx.open('routeModal');
  }

  public restore(route: RouteView): void {
    if (!route.deletedAt) {
      return;
    }
    this.routesService.v1LoadBalancerRoutesIdRestorePatch({ id: route.id }).subscribe(() => this.loadRoutes());
  }

  private subscribeToDataChanges(): Subscription {
    const datacenter$ = this.datacenterContextService.currentDatacenter;
    const tier$ = this.tierContextService.currentTier;

    return combineLatest([datacenter$, tier$]).subscribe(data => {
      const [datacenter, tier] = data;
      this.currentTier = tier;
      this.tiers = datacenter.tiers;
      this.loadRoutes();
    });
  }

  private subscribeToRouteModal(): Subscription {
    return this.ngx.getModal('routeModal').onCloseFinished.subscribe(() => {
      this.loadRoutes();
      this.ngx.resetModalData('routeModal');
    });
  }
}

export interface ImportRoute extends LoadBalancerRoute {
  vrfName?: string;
}
