import { AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import {
  GetManyLoadBalancerVirtualServerResponseDto,
  LoadBalancerVirtualServer,
  Tier,
  V1LoadBalancerVirtualServersService,
  VirtualServerImportDto,
} from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { combineLatest, Subscription } from 'rxjs';
import { TableConfig } from 'src/app/common/table/table.component';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { EntityService } from 'src/app/services/entity.service';
import { TableContextService } from 'src/app/services/table-context.service';
import { TierContextService } from 'src/app/services/tier-context.service';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { SearchColumnConfig } from '../../../../common/search-bar/search-bar.component';
import { VirtualServerModalDto } from '../virtual-server-modal/virtual-server-modal.dto';
import { FilteredCount } from 'src/app/helptext/help-text-networking';
import { AdvancedSearchAdapter } from 'src/app/common/advanced-search/advanced-search.adapter';

export interface VirtualServerView extends LoadBalancerVirtualServer {
  nameView: string;
  defaultPoolName: string;
  state: string;
}

@Component({
  selector: 'app-virtual-server-list',
  templateUrl: './virtual-server-list.component.html',
})
export class VirtualServerListComponent implements OnInit, OnDestroy, AfterViewInit {
  public currentTier: Tier;
  public datacenterId: string;
  public tiers: Tier[] = [];
  public searchColumns: SearchColumnConfig[] = [
    { displayName: 'Destination Address', propertyName: 'destinationIpAddress' },
    { displayName: 'Service Port', propertyName: 'servicePort' },
  ];

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;
  @ViewChild('defaultPoolTemplate') defaultPoolTemplate: TemplateRef<any>;

  public config: TableConfig<VirtualServerView> = {
    description: 'Virtual Servers in the currently selected Tier',
    columns: [
      { name: 'Name', property: 'name' },
      { name: 'Type', property: 'type' },
      { name: 'Destination Address', property: 'destinationIpAddress' },
      { name: 'Service Port', property: 'servicePort' },
      { name: 'Pool', property: 'defaultPoolName' },
      { name: 'State', property: 'state' },
      { name: '', template: () => this.actionsTemplate },
    ],
  };
  public virtualServers = {} as GetManyLoadBalancerVirtualServerResponseDto;
  public tableComponentDto = new TableComponentDto();
  public perPage = 20;
  public isLoading = false;

  private dataChanges: Subscription;
  private virtualServerChanges: Subscription;

  constructor(
    private datacenterContextService: DatacenterContextService,
    private entityService: EntityService,
    private virtualServersService: V1LoadBalancerVirtualServersService,
    private ngx: NgxSmartModalService,
    private tierContextService: TierContextService,
    private tableContextService: TableContextService,
    public filteredHelpText: FilteredCount,
  ) {
    const advancedSearchAdapterObject = new AdvancedSearchAdapter<LoadBalancerVirtualServer>();
    advancedSearchAdapterObject.setService(this.virtualServersService);
    advancedSearchAdapterObject.setServiceName('V1LoadBalancerVirutalServersService');
    this.config.advancedSearchAdapter = advancedSearchAdapterObject;
  }

  ngOnInit(): void {
    this.dataChanges = this.subscribeToDataChanges();
  }

  ngAfterViewInit(): void {
    this.virtualServerChanges = this.subscribeToVirtualServerModal();
  }

  ngOnDestroy(): void {
    SubscriptionUtil.unsubscribe([this.virtualServerChanges, this.dataChanges]);
  }

  public delete(virtualServer: VirtualServerView): void {
    this.entityService.deleteEntity(virtualServer, {
      entityName: 'Virtual Server',
      delete$: this.virtualServersService.deleteOneLoadBalancerVirtualServer({ id: virtualServer.id }),
      softDelete$: this.virtualServersService.softDeleteOneLoadBalancerVirtualServer({ id: virtualServer.id }),
      onSuccess: () => {
        // get search params from local storage
        const params = this.tableContextService.getSearchLocalStorage();
        const { filteredResults } = params;

        // if filtered results boolean is true, apply search params in the
        // subsequent get call
        if (filteredResults) {
          this.tableComponentDto.searchColumn = params.searchColumn;
          this.tableComponentDto.searchText = params.searchText;
          this.loadVirtualServers(this.tableComponentDto);
        } else {
          this.loadVirtualServers();
        }
      },
    });
  }

  public onTableEvent(event: TableComponentDto): void {
    this.tableComponentDto = event;
    this.loadVirtualServers(event);
  }

  public loadVirtualServers(event?): void {
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
    this.virtualServersService
      .getManyLoadBalancerVirtualServer({
        join: ['irules,defaultPool'],
        filter: [`tierId||eq||${this.currentTier.id}`, eventParams],
        page: this.tableComponentDto.page,
        limit: this.tableComponentDto.perPage,
        sort: ['name,ASC'],
      })
      .subscribe(
        response => {
          this.virtualServers = response;
          this.virtualServers.data = (this.virtualServers.data as VirtualServerView[]).map(v => ({
            ...v,
            nameView: v.name.length >= 20 ? v.name.slice(0, 19) + '...' : v.name,
            defaultPoolName: v.defaultPool
              ? v.defaultPool.name.length >= 20
                ? v.defaultPool.name.slice(0, 19) + '...'
                : v.defaultPool.name
              : undefined,
            state: v.provisionedAt ? 'Provisioned' : 'Not Provisioned',
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

  public import(virtualServers: VirtualServerImportDto[]): void {
    this.virtualServersService
      .bulkImportVirtualServersLoadBalancerVirtualServer({
        virtualServerImportCollectionDto: { datacenterId: this.datacenterId, virtualServers },
      })
      .subscribe(() => this.loadVirtualServers());
  }

  public openModal(virtualServer?: VirtualServerView): void {
    const dto: VirtualServerModalDto = {
      tierId: this.currentTier.id,
      virtualServer,
    };
    this.ngx.setModalData(dto, 'virtualServerModal');
    this.ngx.open('virtualServerModal');
  }

  public restore(virtualServer: VirtualServerView): void {
    if (!virtualServer.deletedAt) {
      return;
    }
    this.virtualServersService.restoreOneLoadBalancerVirtualServer({ id: virtualServer.id }).subscribe(() => {
      // get search params from local storage
      const params = this.tableContextService.getSearchLocalStorage();
      const { filteredResults } = params;

      // if filtered results boolean is true, apply search params in the
      // subsequent get call
      if (filteredResults) {
        this.tableComponentDto.searchColumn = params.searchColumn;
        this.tableComponentDto.searchText = params.searchText;
        this.loadVirtualServers(this.tableComponentDto);
      } else {
        this.loadVirtualServers();
      }
    });
  }

  private subscribeToDataChanges(): Subscription {
    const datacenter$ = this.datacenterContextService.currentDatacenter;
    const tier$ = this.tierContextService.currentTier;

    return combineLatest([datacenter$, tier$]).subscribe(data => {
      const [datacenter, tier] = data;
      this.currentTier = tier;
      this.datacenterId = datacenter.id;
      this.tiers = datacenter.tiers;
      this.loadVirtualServers();
    });
  }

  private subscribeToVirtualServerModal(): Subscription {
    return this.ngx.getModal('virtualServerModal').onCloseFinished.subscribe(() => {
      // get search params from local storage
      const params = this.tableContextService.getSearchLocalStorage();
      const { filteredResults } = params;

      // if filtered results boolean is true, apply search params in the
      // subsequent get call
      if (filteredResults) {
        this.tableComponentDto.searchColumn = params.searchColumn;
        this.tableComponentDto.searchText = params.searchText;
        this.loadVirtualServers(this.tableComponentDto);
      } else {
        this.loadVirtualServers();
      }
      this.ngx.resetModalData('virtualServerModal');
    });
  }
}
