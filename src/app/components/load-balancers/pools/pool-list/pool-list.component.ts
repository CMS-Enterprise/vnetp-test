import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, AfterViewInit } from '@angular/core';
import {
  GetManyLoadBalancerPoolResponseDto,
  LoadBalancerPool,
  LoadBalancerPoolBulkImportDto,
  Tier,
  V1LoadBalancerPoolsService,
} from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { combineLatest, Subscription } from 'rxjs';
import { TableConfig } from 'src/app/common/table/table.component';
import { methodsLookup } from 'src/app/lookups/load-balancing-method.lookup';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { EntityService } from 'src/app/services/entity.service';
import { TierContextService } from 'src/app/services/tier-context.service';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { SearchColumnConfig } from '../../../../common/search-bar/search-bar.component';
import { PoolModalDto } from '../pool-modal/pool-modal.dto';

export interface PoolView extends LoadBalancerPool {
  nameView: string;
  methodName: string;
  totalHealthMonitors: number;
  totalNodes: number;
  state: string;
}

@Component({
  selector: 'app-pool-list',
  templateUrl: './pool-list.component.html',
})
export class PoolListComponent implements OnInit, OnDestroy, AfterViewInit {
  public currentTier: Tier;
  public datacenterId: string;
  public tiers: Tier[] = [];
  public searchColumns: SearchColumnConfig[] = [];

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

  public config: TableConfig<PoolView> = {
    description: 'Pools in the currently selected Tier',
    columns: [
      { name: 'Name', property: 'nameView' },
      { name: 'Load Balancing Method', property: 'methodName' },
      { name: 'Nodes', property: 'totalNodes' },
      { name: 'Health Monitors', property: 'totalHealthMonitors' },
      { name: 'State', property: 'state' },
      { name: '', template: () => this.actionsTemplate },
    ],
  };
  public pools: GetManyLoadBalancerPoolResponseDto;
  public tableComponentDto = new TableComponentDto();
  public perPage = 20;
  public isLoading = false;

  private dataChanges: Subscription;
  private poolChanges: Subscription;

  constructor(
    private datacenterContextService: DatacenterContextService,
    private entityService: EntityService,
    private poolsService: V1LoadBalancerPoolsService,
    private ngx: NgxSmartModalService,
    private tierContextService: TierContextService,
  ) {}

  ngOnInit(): void {
    this.dataChanges = this.subscribeToDataChanges();
  }

  ngAfterViewInit(): void {
    this.poolChanges = this.subscribeToPoolModal();
  }

  ngOnDestroy(): void {
    SubscriptionUtil.unsubscribe([this.poolChanges, this.dataChanges]);
  }

  public delete(pool: PoolView): void {
    this.entityService.deleteEntity(pool, {
      entityName: 'Pool',
      delete$: this.poolsService.deleteOneLoadBalancerPool({ id: pool.id }),
      softDelete$: this.poolsService.softDeleteOneLoadBalancerPool({ id: pool.id }),
      onSuccess: () => this.loadPools(),
    });
  }

  public onTableEvent(event: TableComponentDto) {
    this.tableComponentDto = event;
    this.loadPools();
  }

  public loadPools(): void {
    this.isLoading = true;
    this.poolsService
      .getPoolsLoadBalancerPool({
        id: this.currentTier.id,
        page: this.tableComponentDto.page,
        limit: this.tableComponentDto.perPage,
      })
      .subscribe(
        response => {
          const getTotal = <T>(array: T[]) => (array ? array.length : 0);
          this.pools = response;
          this.pools.data = this.pools.data.map(p => ({
            ...p,
            nameView: p.name.length >= 20 ? p.name.slice(0, 19) + '...' : p.name,
            methodName: methodsLookup[p.loadBalancingMethod],
            state: p.provisionedAt ? 'Provisioned' : 'Not Provisioned',
            totalNodes: getTotal(p.nodes),
            totalHealthMonitors: getTotal(p.healthMonitors) + getTotal(p.defaultHealthMonitors),
          }));
        },
        () => {
          this.pools = null;
        },
        () => {
          this.isLoading = false;
        },
      );
  }

  public import(pools: LoadBalancerPoolBulkImportDto[] = []): void {
    this.poolsService
      .bulkImportPoolsLoadBalancerPool({
        poolImportCollectionDto: {
          datacenterId: this.datacenterId,
          pools,
        },
      })
      .subscribe(() => this.loadPools());
  }

  public openModal(pool?: PoolView): void {
    const dto: PoolModalDto = {
      tierId: this.currentTier.id,
      pool,
    };
    this.ngx.setModalData(dto, 'poolModal');
    this.ngx.open('poolModal');
  }

  public restore(pool: PoolView): void {
    if (!pool.deletedAt) {
      return;
    }
    this.poolsService.restoreOneLoadBalancerPool({ id: pool.id }).subscribe(() => this.loadPools());
  }

  private subscribeToDataChanges(): Subscription {
    const datacenter$ = this.datacenterContextService.currentDatacenter;
    const tier$ = this.tierContextService.currentTier;

    return combineLatest([datacenter$, tier$]).subscribe(data => {
      const [datacenter, tier] = data;
      this.currentTier = tier;
      this.datacenterId = datacenter.id;
      this.tiers = datacenter.tiers;
      this.loadPools();
    });
  }

  private subscribeToPoolModal(): Subscription {
    return this.ngx.getModal('poolModal').onCloseFinished.subscribe(() => {
      this.loadPools();
      this.ngx.resetModalData('poolModal');
    });
  }
}
