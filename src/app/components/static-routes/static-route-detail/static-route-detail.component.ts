import { Component, OnInit, OnDestroy, ViewChild, TemplateRef, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Tier, V1TiersService, StaticRoute, V1NetworkStaticRoutesService, GetManyStaticRouteResponseDto } from 'client';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { StaticRouteModalDto } from 'src/app/models/network/static-route-modal-dto';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { EntityService } from 'src/app/services/entity.service';
import { TableConfig } from '../../../common/table/table.component';
import { SearchColumnConfig } from 'src/app/common/search-bar/search-bar.component';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';

@Component({
  selector: 'app-static-route-detail',
  templateUrl: './static-route-detail.component.html',
})
export class StaticRouteDetailComponent implements OnInit, OnDestroy {
  public ModalMode = ModalMode;
  public Id = '';
  public tier: Tier;
  public staticRoutes = {} as GetManyStaticRouteResponseDto;
  public searchColumns: SearchColumnConfig[] = [];
  public perPage = 20;
  public tableComponentDto = new TableComponentDto();
  objectType = 'Static Route';

  private currentDatacenterSubscription: Subscription;
  private staticRouteModalSubscription: Subscription;

  public isLoading = false;

  @Output() formFields = ['destinationNetwork', 'nextHop', 'metric'];

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;
  @ViewChild('stateTemplate') stateTemplate: TemplateRef<any>;

  public config: TableConfig<any> = {
    description: 'Static Routes for the currently selected Tier',
    columns: [
      { name: 'Name', property: 'name' },
      { name: 'Destination Network', property: 'destinationNetwork' },
      { name: 'Next Hop', property: 'nextHop' },
      { name: 'Metric', property: 'metric' },
      { name: 'State', template: () => this.stateTemplate },
      { name: '', template: () => this.actionsTemplate },
    ],
  };

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
    this.ngx.setModalData(dto, 'standardFormModal');
    this.ngx.getModal('standardFormModal').open();
  }

  subscribeToStaticRouteModal() {
    this.staticRouteModalSubscription = this.ngx.getModal('standardFormModal').onCloseFinished.subscribe(() => {
      this.getStaticRoutes();
      this.ngx.resetModalData('standardFormModal');
      this.staticRouteModalSubscription.unsubscribe();
    });
  }

  // subscribeToStaticRouteModal() {
  //   this.staticRouteModalSubscription = this.ngx.getModal('staticRouteModal').onCloseFinished.subscribe(() => {
  //     this.getStaticRoutes();
  //     this.ngx.resetModalData('staticRouteModal');
  //     this.staticRouteModalSubscription.unsubscribe();
  //   });
  // }

  public deleteStaticRoute(staticRoute: StaticRoute): void {
    this.entityService.deleteEntity(staticRoute, {
      entityName: 'Static Route',
      delete$: this.staticRouteService.deleteOneStaticRoute({ id: staticRoute.id }),
      softDelete$: this.staticRouteService.softDeleteOneStaticRoute({ id: staticRoute.id }),
      onSuccess: () => this.getStaticRoutes(),
    });
  }

  public restoreStaticRoute(staticRoute: StaticRoute): void {
    if (!staticRoute.deletedAt) {
      return;
    }
    this.staticRouteService.restoreOneStaticRoute({ id: staticRoute.id }).subscribe(() => {
      this.getStaticRoutes();
    });
  }

  getStaticRoutes() {
    this.isLoading = true;
    this.tierService.getOneTier({ id: this.Id, join: ['staticRoutes'] }).subscribe(
      data => {
        this.tier = data;
        this.staticRoutes.data = data.staticRoutes;
      },
      () => {
        this.staticRoutes = null;
      },
      () => {
        this.isLoading = false;
      },
    );
  }

  public onTableEvent(event: TableComponentDto) {
    this.tableComponentDto = event;
    this.getStaticRoutes();
  }

  ngOnInit() {
    this.currentDatacenterSubscription = this.datacenterContextService.currentDatacenter.subscribe(cd => {
      if (cd) {
        this.Id = this.route.snapshot.paramMap.get('id');
        // TODO: Ensure Tier is in selected datacenter tiers.
        this.getStaticRoutes();
      }
    });
  }

  ngOnDestroy() {
    SubscriptionUtil.unsubscribe([this.currentDatacenterSubscription, this.staticRouteModalSubscription]);
  }
}
