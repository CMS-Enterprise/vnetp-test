import { Component, Input, OnDestroy, OnInit, TemplateRef, ViewChild, AfterViewInit } from '@angular/core';
import { LoadBalancerPool, LoadBalancerPoolBulkImportDto, Tier, V1LoadBalancerPoolsService } from 'api_client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { TableConfig } from 'src/app/common/table/table.component';
import { methodsLookup } from 'src/app/lookups/load-balancing-method.lookup';
import { EntityService } from 'src/app/services/entity.service';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { PoolModalDto } from '../pool-modal/pool-modal.dto';

interface PoolView extends LoadBalancerPool {
  methodName: string;
  totalHealthMonitors: number;
  totalNodes: number;
  provisionedState: string;
}

@Component({
  selector: 'app-pool-list',
  templateUrl: './pool-list.component.html',
})
export class PoolListComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() currentTier: Tier;
  @Input() datacenterId: string;
  @Input() tiers: Tier[] = [];

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

  public config: TableConfig<PoolView> = {
    description: 'Pools in the currently selected Tier',
    columns: [
      { name: 'Name', property: 'name' },
      { name: 'Load Balancing Method', property: 'methodName' },
      { name: 'Nodes', property: 'totalNodes' },
      { name: 'Health Monitors', property: 'totalHealthMonitors' },
      { name: 'State', property: 'provisionedState' },
      { name: '', template: () => this.actionsTemplate },
    ],
  };
  public pools: PoolView[] = [];
  public isLoading = false;

  private poolChanges: Subscription;

  constructor(private entityService: EntityService, private poolsService: V1LoadBalancerPoolsService, private ngx: NgxSmartModalService) {}

  ngOnInit() {
    this.loadPools();
  }

  ngAfterViewInit() {
    this.poolChanges = this.subscribeToPoolModal();
  }

  ngOnDestroy() {
    SubscriptionUtil.unsubscribe([this.poolChanges]);
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
              methodName: methodsLookup[p.loadBalancingMethod],
              provisionedState: p.provisionedAt ? 'Provisioned' : 'Not Provisioned',
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
    this.ngx.getModal('poolModal').open();
  }

  public restore(pool: PoolView): void {
    if (!pool.deletedAt) {
      return;
    }
    this.poolsService.v1LoadBalancerPoolsIdRestorePatch({ id: pool.id }).subscribe(() => this.loadPools());
  }

  private subscribeToPoolModal(): Subscription {
    return this.ngx.getModal('poolModal').onCloseFinished.subscribe(() => {
      this.loadPools();
      this.ngx.resetModalData('poolModal');
    });
  }
}
