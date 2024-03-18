import { AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import {
  GetManyLoadBalancerHealthMonitorResponseDto,
  LoadBalancerHealthMonitor,
  LoadBalancerHealthMonitorTypeEnum,
  Tier,
  V1LoadBalancerHealthMonitorsService,
} from 'client';
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
import { HealthMonitorModalDto } from '../health-monitor-modal/health-monitor-modal.dto';
import { FilteredCount } from 'src/app/helptext/help-text-networking';
import { AdvancedSearchAdapter } from 'src/app/common/advanced-search/advanced-search.adapter';

export interface HealthMonitorView extends LoadBalancerHealthMonitor {
  nameView: string;
  state: string;
}

@Component({
  selector: 'app-health-monitor-list',
  templateUrl: './health-monitor-list.component.html',
})
export class HealthMonitorListComponent implements OnInit, OnDestroy {
  public currentTier: Tier;
  public tiers: Tier[] = [];
  public searchColumns: SearchColumnConfig[] = [
    { displayName: 'Type', propertyName: 'type', propertyType: LoadBalancerHealthMonitorTypeEnum },
    { displayName: 'Service Port', propertyName: 'servicePort' },
    { displayName: 'Interval', propertyName: 'interval' },
    { displayName: 'Timeout', propertyName: 'timeout' },
  ];

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

  public config: TableConfig<HealthMonitorView> = {
    description: 'Health Monitors in the currently selected Tier',
    columns: [
      { name: 'Name', property: 'name' },
      { name: 'Type', property: 'type' },
      { name: 'Service Port', property: 'servicePort' },
      { name: 'Interval', property: 'interval' },
      { name: 'Timeout', property: 'timeout' },
      { name: 'State', property: 'state' },
      { name: '', template: () => this.actionsTemplate },
    ],
  };
  public healthMonitors = {} as GetManyLoadBalancerHealthMonitorResponseDto;
  public tableComponentDto = new TableComponentDto();
  public perPage = 20;
  public isLoading = false;

  private healthMonitorChanges: Subscription;
  private dataChanges: Subscription;

  objectType = 'Health Monitor';

  constructor(
    private datacenterContextService: DatacenterContextService,
    private entityService: EntityService,
    private healthMonitorsService: V1LoadBalancerHealthMonitorsService,
    private ngx: NgxSmartModalService,
    private tierContextService: TierContextService,
    private tableContextService: TableContextService,
    public filteredHelpText: FilteredCount,
  ) {
    const advancedSearchAdapterObject = new AdvancedSearchAdapter<LoadBalancerHealthMonitor>();
    advancedSearchAdapterObject.setService(this.healthMonitorsService);
    advancedSearchAdapterObject.setServiceName('V1LoadBalancerHealthMonitorsService');
    this.config.advancedSearchAdapter = advancedSearchAdapterObject;
  }

  ngOnInit() {
    this.dataChanges = this.subscribeToDataChanges();
  }

  ngOnDestroy() {
    SubscriptionUtil.unsubscribe([this.healthMonitorChanges, this.dataChanges]);
  }

  public delete(healthMonitor: LoadBalancerHealthMonitor): void {
    this.entityService.deleteEntity(healthMonitor, {
      entityName: 'Health Monitor',
      delete$: this.healthMonitorsService.deleteOneLoadBalancerHealthMonitor({ id: healthMonitor.id }),
      softDelete$: this.healthMonitorsService.softDeleteOneLoadBalancerHealthMonitor({ id: healthMonitor.id }),
      onSuccess: () => {
        // get search params from local storage
        const params = this.tableContextService.getSearchLocalStorage();
        const { filteredResults } = params;

        // if filtered results boolean is true, apply search params in the
        // subsequent get call
        if (filteredResults) {
          this.tableComponentDto.searchColumn = params.searchColumn;
          this.tableComponentDto.searchText = params.searchText;
          this.loadHealthMonitors(this.tableComponentDto);
        } else {
          this.loadHealthMonitors();
        }
      },
    });
  }

  public onTableEvent(event: TableComponentDto): void {
    this.tableComponentDto = event;
    this.loadHealthMonitors(event);
  }

  public loadHealthMonitors(event?): void {
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
    this.healthMonitorsService
      .getManyLoadBalancerHealthMonitor({
        filter: [`tierId||eq||${this.currentTier.id}`, eventParams],
        page: this.tableComponentDto.page,
        perPage: this.tableComponentDto.perPage,
        sort: ['name,ASC'],
      })
      .subscribe(
        response => {
          this.healthMonitors = response;
          this.healthMonitors.data = (this.healthMonitors.data as HealthMonitorView[]).map(h => ({
            ...h,
            nameView: h.name.length >= 20 ? h.name.slice(0, 19) + '...' : h.name,
            state: h.provisionedAt ? 'Provisioned' : 'Not Provisioned',
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

  public import(healthMonitors: ImportHealthMonitor[]): void {
    const bulk = healthMonitors.map(healthMonitor => {
      const { tierName } = healthMonitor;
      if (!tierName) {
        return healthMonitor;
      }

      const tierId = ObjectUtil.getObjectId(tierName, this.tiers);
      return {
        ...healthMonitor,
        tierId,
      };
    });

    this.healthMonitorsService
      .createManyLoadBalancerHealthMonitor({
        createManyLoadBalancerHealthMonitorDto: { bulk },
      })
      .subscribe(() => this.loadHealthMonitors());
  }

  public openModal(healthMonitor?: LoadBalancerHealthMonitor): void {
    const dto: HealthMonitorModalDto = {
      tierId: this.currentTier.id,
      healthMonitor,
    };
    this.subscribeToHealthMonitorModal();
    this.ngx.setModalData(dto, 'healthMonitorModal');
    this.ngx.open('healthMonitorModal');
  }

  public restore(healthMonitor: LoadBalancerHealthMonitor): void {
    if (!healthMonitor.deletedAt) {
      return;
    }
    this.healthMonitorsService.restoreOneLoadBalancerHealthMonitor({ id: healthMonitor.id }).subscribe(() => {
      // get search params from local storage
      const params = this.tableContextService.getSearchLocalStorage();
      const { filteredResults } = params;

      // if filtered results boolean is true, apply search params in the
      // subsequent get call
      if (filteredResults) {
        this.tableComponentDto.searchColumn = params.searchColumn;
        this.tableComponentDto.searchText = params.searchText;
        this.loadHealthMonitors(this.tableComponentDto);
      } else {
        this.loadHealthMonitors();
      }
    });
  }

  private subscribeToDataChanges(): Subscription {
    const datacenter$ = this.datacenterContextService.currentDatacenter;
    const tier$ = this.tierContextService.currentTier;

    return combineLatest([datacenter$, tier$]).subscribe(data => {
      const [datacenter, tier] = data;
      this.tiers = datacenter.tiers;
      this.currentTier = tier;
      this.loadHealthMonitors();
    });
  }

  private subscribeToHealthMonitorModal(): void {
    this.healthMonitorChanges = this.ngx.getModal('healthMonitorModal').onCloseFinished.subscribe(() => {
      // get search params from local storage
      const params = this.tableContextService.getSearchLocalStorage();
      const { filteredResults } = params;

      // if filtered results boolean is true, apply search params in the
      // subsequent get call
      if (filteredResults) {
        this.tableComponentDto.searchColumn = params.searchColumn;
        this.tableComponentDto.searchText = params.searchText;
        this.loadHealthMonitors(this.tableComponentDto);
      } else {
        this.loadHealthMonitors();
      }
      this.ngx.resetModalData('healthMonitorModal');
      this.healthMonitorChanges.unsubscribe();
    });
  }
}

export interface ImportHealthMonitor extends LoadBalancerHealthMonitor {
  tierName?: string;
}
