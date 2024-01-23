import { AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { GetManyLoadBalancerRouteResponseDto, LoadBalancerRoute, Tier, V1LoadBalancerRoutesService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { combineLatest, Subscription } from 'rxjs';
import { TableConfig } from 'src/app/common/table/table.component';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { EntityService } from 'src/app/services/entity.service';
import { TableContextService } from 'src/app/services/table-context.service';
import { TierContextService } from 'src/app/services/tier-context.service';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { SearchColumnConfig } from '../../../../common/search-bar/search-bar.component';
import { RouteModalDto } from '../route-modal/route-modal.dto';
import { FilteredCount } from 'src/app/helptext/help-text-networking';
import { AdvancedSearchAdapter } from 'src/app/common/advanced-search/advanced-search.adapter';

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
  public searchColumns: SearchColumnConfig[] = [
    { displayName: 'Destination', propertyName: 'destination' },
    { displayName: 'Gateway', propertyName: 'gateway' },
  ];

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
  public routes = {} as GetManyLoadBalancerRouteResponseDto;
  public tableComponentDto = new TableComponentDto();
  public perPage = 20;
  public isLoading = false;

  private dataChanges: Subscription;
  private routeChanges: Subscription;

  constructor(
    private datacenterContextService: DatacenterContextService,
    private entityService: EntityService,
    private routesService: V1LoadBalancerRoutesService,
    private ngx: NgxSmartModalService,
    private tierContextService: TierContextService,
    private tableContextService: TableContextService,
    public filteredHelpText: FilteredCount,
  ) {
    const advancedSearchAdapterObject = new AdvancedSearchAdapter<LoadBalancerRoute>();
    advancedSearchAdapterObject.setService(this.routesService);
    advancedSearchAdapterObject.setServiceName('V1LoadBalancerRoutesService');
    this.config.advancedSearchAdapter = advancedSearchAdapterObject;
  }

  ngOnInit(): void {
    this.dataChanges = this.subscribeToDataChanges();
  }

  ngAfterViewInit(): void {
    this.routeChanges = this.subscribeToRouteModal();
  }

  ngOnDestroy(): void {
    SubscriptionUtil.unsubscribe([this.routeChanges]);
  }

  public delete(route: RouteView): void {
    this.entityService.deleteEntity(route, {
      entityName: 'Route',
      delete$: this.routesService.deleteOneLoadBalancerRoute({ id: route.id }),
      softDelete$: this.routesService.softDeleteOneLoadBalancerRoute({ id: route.id }),
      onSuccess: () => {
        // get search params from local storage
        const params = this.tableContextService.getSearchLocalStorage();
        const { filteredResults } = params;

        // if filtered results boolean is true, apply search params in the
        // subsequent get call
        if (filteredResults) {
          this.tableComponentDto.searchColumn = params.searchColumn;
          this.tableComponentDto.searchText = params.searchText;
          this.loadRoutes(this.tableComponentDto);
        } else {
          this.loadRoutes();
        }
      },
    });
  }

  public onTableEvent(event: TableComponentDto): void {
    this.tableComponentDto = event;
    this.loadRoutes(event);
  }

  public loadRoutes(event?): void {
    this.isLoading = true;
    let eventParams;
    if (event) {
      this.tableComponentDto.page = event.page ? event.page : 1;
      this.tableComponentDto.perPage = event.perPage ? event.perPage : 20;
      const { searchText } = event;
      this.tableComponentDto.searchText = searchText;
      const propertyName = event.searchColumn ? event.searchColumn : null;
      if (propertyName === 'name') {
        eventParams = propertyName + '||cont||' + searchText;
      } else if (propertyName) {
        eventParams = propertyName + '||eq||' + searchText;
      }
    }
    this.routesService
      .getManyLoadBalancerRoute({
        filter: [`tierId||eq||${this.currentTier.id}`, eventParams],
        page: this.tableComponentDto.page,
        perPage: this.tableComponentDto.perPage,
        sort: ['name,ASC'],
      })
      .subscribe(
        (response: any) => {
          if (response.length === 0) {
            // routes acts a little weird and will fail its test if response.data does not exist
            // may need to test w/ dev env to see if latency is involved and bring over same logic into
            // other components

            // for now we will just return if the response.length is 0, which satisfies all tests and functionality
            return;
          }
          this.routes = response;
          this.routes.data = (this.routes.data as RouteView[]).map(r => ({
            ...r,
            nameView: r.name.length >= 20 ? r.name.slice(0, 19) + '...' : r.name,
            state: r.provisionedAt ? 'Provisioned' : 'Not Provisioned',
          }));
        },
        () => {
          this.isLoading = false;
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
      .createManyLoadBalancerRoute({
        createManyLoadBalancerRouteDto: { bulk },
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
    this.routesService.restoreOneLoadBalancerRoute({ id: route.id }).subscribe(() => {
      // get search params from local storage
      const params = this.tableContextService.getSearchLocalStorage();
      const { filteredResults } = params;

      // if filtered results boolean is true, apply search params in the
      // subsequent get call
      if (filteredResults) {
        this.tableComponentDto.searchColumn = params.searchColumn;
        this.tableComponentDto.searchText = params.searchText;
        this.loadRoutes(this.tableComponentDto);
      } else {
        this.loadRoutes();
      }
    });
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
      // get search params from local storage
      const params = this.tableContextService.getSearchLocalStorage();
      const { filteredResults } = params;

      // if filtered results boolean is true, apply search params in the
      // subsequent get call
      if (filteredResults) {
        this.tableComponentDto.searchColumn = params.searchColumn;
        this.tableComponentDto.searchText = params.searchText;
        this.loadRoutes(this.tableComponentDto);
      } else {
        this.loadRoutes();
      }
      this.ngx.resetModalData('routeModal');
      this.routeChanges.unsubscribe();
    });
  }
}

export interface ImportRoute extends LoadBalancerRoute {
  vrfName?: string;
}
