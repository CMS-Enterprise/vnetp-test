import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, AfterViewInit } from '@angular/core';
import { LoadBalancerPool, LoadBalancerPoolBulkImportDto, Tier, V1LoadBalancerPoolsService } from 'api_client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { combineLatest, Subscription } from 'rxjs';
import { TableConfig } from 'src/app/common/table/table.component';
import { methodsLookup } from 'src/app/lookups/load-balancing-method.lookup';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { EntityService } from 'src/app/services/entity.service';
import { TierContextService } from 'src/app/services/tier-context.service';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
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
  public pools: PoolView[] = [];
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

  ngOnInit() {
    this.dataChanges = this.subscribeToDataChanges();
  }

  ngAfterViewInit() {
    this.poolChanges = this.subscribeToPoolModal();
  }

  ngOnDestroy() {
    SubscriptionUtil.unsubscribe([this.poolChanges, this.dataChanges]);
  }

  public delete(pool: PoolView): void {
    this.entityService.deleteEntity(pool, {
      entityName: 'Pool',
      delete$: this.poolsService.v1LoadBalancerPoolsIdDelete({ id: pool.id }),
      softDelete$: this.poolsService.v1LoadBalancerPoolsIdSoftDelete({ id: pool.id }),
      onSuccess: () => this.loadPools(),
    });
  }

  public loadPools(): void {
    this.isLoading = true;
    this.poolsService
      .v1LoadBalancerPoolsIdTierIdGet({
        id: this.currentTier.id,
      })
      .subscribe(
        (pools: LoadBalancerPool[]) => {
          const getTotal = <T>(array: T[]) => {
            return array ? array.length : 0;
          };

          this.pools = pools.map(p => {
            return {
              ...p,
              nameView: p.name.length >= 20 ? p.name.slice(0, 19) + '...' : p.name,
              methodName: methodsLookup[p.loadBalancingMethod],
              state: p.provisionedAt ? 'Provisioned' : 'Not Provisioned',
              totalNodes: getTotal(p.nodes),
              totalHealthMonitors: getTotal(p.healthMonitors) + getTotal(p.defaultHealthMonitors),
            };
          });
        },
        () => {
          this.pools = [];
        },
        () => {
          this.isLoading = false;
        },
      );
  }

  public import(pools: LoadBalancerPoolBulkImportDto[] = []): void {
    this.poolsService
      .v1LoadBalancerPoolsBulkImportPost({
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
    this.poolsService.v1LoadBalancerPoolsIdRestorePatch({ id: pool.id }).subscribe(() => this.loadPools());
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
