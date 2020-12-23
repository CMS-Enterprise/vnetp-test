import { AfterViewInit, Component, Input, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { LoadBalancerRoute, Tier, V1LoadBalancerRoutesService } from 'api_client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { TableConfig } from 'src/app/common/table/table.component';
import { EntityService } from 'src/app/services/entity.service';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { RouteModalDto } from '../route-modal/route-modal.dto';

export interface RouteView extends LoadBalancerRoute {
  state: string;
}

@Component({
  selector: 'app-route-list',
  templateUrl: './route-list.component.html',
})
export class RouteListComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() currentTier: Tier;
  @Input() tiers: Tier[] = [];

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

  public config: TableConfig<RouteView> = {
    description: 'Routes in the currently selected Tier',
    columns: [
      { name: 'Name', property: 'name' },
      { name: 'Destination', property: 'destination' },
      { name: 'Gateway', property: 'gateway' },
      { name: 'State', property: 'state' },
      { name: '', template: () => this.actionsTemplate },
    ],
  };
  public routes: RouteView[] = [];
  public isLoading = false;

  private routeChanges: Subscription;

  constructor(
    private entityService: EntityService,
    private routesService: V1LoadBalancerRoutesService,
    private ngx: NgxSmartModalService,
  ) {}

  ngOnInit() {
    this.loadRoutes();
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
    this.ngx.getModal('routeModal').open();
  }

  public restore(route: RouteView): void {
    if (!route.deletedAt) {
      return;
    }
    this.routesService.v1LoadBalancerRoutesIdRestorePatch({ id: route.id }).subscribe(() => this.loadRoutes());
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
