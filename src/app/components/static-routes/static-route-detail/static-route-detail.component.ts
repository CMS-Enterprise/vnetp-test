import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Tier, V1TiersService, StaticRoute, V1NetworkStaticRoutesService } from 'api_client';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { StaticRouteModalDto } from 'src/app/models/network/static-route-modal-dto';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { EntityService } from 'src/app/services/entity.service';

@Component({
  selector: 'app-static-route-detail',
  templateUrl: './static-route-detail.component.html',
})
export class StaticRouteDetailComponent implements OnInit, OnDestroy {
  public ModalMode = ModalMode;
  public Id = '';
  public tier: Tier;
  public staticRoutes: StaticRoute[] = [];

  private currentDatacenterSubscription: Subscription;
  private staticRouteModalSubscription: Subscription;

  constructor(
    private datacenterContextService: DatacenterContextService,
    private entityService: EntityService,
    private ngx: NgxSmartModalService,
    private route: ActivatedRoute,
    private staticRouteService: V1NetworkStaticRoutesService,
    private tierService: V1TiersService,
  ) {}

  createStaticRoute() {
    this.openStaticRouteModal(ModalMode.Create);
  }

  openStaticRouteModal(modalMode: ModalMode, staticRoute?: StaticRoute) {
    if (modalMode === ModalMode.Edit && !staticRoute) {
      throw new Error('Static Route Required');
    }

    const dto = new StaticRouteModalDto();
    dto.TierId = this.tier.id;
    dto.ModalMode = modalMode;

    if (modalMode === ModalMode.Edit) {
      dto.StaticRoute = staticRoute;
    }

    this.subscribeToStaticRouteModal();
    this.ngx.setModalData(dto, 'staticRouteModal');
    this.ngx.getModal('staticRouteModal').open();
  }

  subscribeToStaticRouteModal() {
    this.staticRouteModalSubscription = this.ngx.getModal('staticRouteModal').onCloseFinished.subscribe(() => {
      this.getStaticRoutes();
      this.ngx.resetModalData('staticRouteModal');
      this.staticRouteModalSubscription.unsubscribe();
    });
  }

  public deleteStaticRoute(staticRoute: StaticRoute): void {
    this.entityService.deleteEntity(staticRoute, {
      entityName: 'Static Route',
      delete$: this.staticRouteService.v1NetworkStaticRoutesIdDelete({ id: staticRoute.id }),
      softDelete$: this.staticRouteService.v1NetworkStaticRoutesIdSoftDelete({ id: staticRoute.id }),
      onSuccess: () => this.getStaticRoutes(),
    });
  }

  public restoreStaticRoute(staticRoute: StaticRoute): void {
    if (!staticRoute.deletedAt) {
      return;
    }
    this.staticRouteService.v1NetworkStaticRoutesIdRestorePatch({ id: staticRoute.id }).subscribe(() => {
      this.getStaticRoutes();
    });
  }

  getStaticRoutes() {
    this.tierService.v1TiersIdGet({ id: this.Id, join: 'staticRoutes' }).subscribe(data => {
      this.tier = data;
      this.staticRoutes = data.staticRoutes;
    });
  }

  ngOnInit() {
    this.currentDatacenterSubscription = this.datacenterContextService.currentDatacenter.subscribe(cd => {
      if (cd) {
        this.Id = this.route.snapshot.paramMap.get('id');
        // TODO: Ensure Tier is in selected datacenter tiers.
        this.staticRoutes = [];
        this.getStaticRoutes();
      }
    });
  }

  ngOnDestroy() {
    SubscriptionUtil.unsubscribe([this.currentDatacenterSubscription, this.staticRouteModalSubscription]);
  }
}
