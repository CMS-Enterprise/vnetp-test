import { AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { LoadBalancerHealthMonitor, Tier, V1LoadBalancerHealthMonitorsService } from 'api_client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { combineLatest, Subscription } from 'rxjs';
import { TableConfig } from 'src/app/common/table/table.component';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { EntityService } from 'src/app/services/entity.service';
import { TierContextService } from 'src/app/services/tier-context.service';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { HealthMonitorModalDto } from '../health-monitor-modal/health-monitor-modal.dto';

export interface HealthMonitorView extends LoadBalancerHealthMonitor {
  state: string;
}

@Component({
  selector: 'app-health-monitor-list',
  templateUrl: './health-monitor-list.component.html',
})
export class HealthMonitorListComponent implements OnInit, OnDestroy, AfterViewInit {
  public currentTier: Tier;
  public tiers: Tier[] = [];

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
  public healthMonitors: HealthMonitorView[] = [];
  public isLoading = false;

  private healthMonitorChanges: Subscription;
  private dataChanges: Subscription;

  constructor(
    private datacenterContextService: DatacenterContextService,
    private entityService: EntityService,
    private healthMonitorsService: V1LoadBalancerHealthMonitorsService,
    private ngx: NgxSmartModalService,
    private tierContextService: TierContextService,
  ) {}

  ngOnInit() {
    this.dataChanges = this.subscribeToDataChanges();
  }

  ngAfterViewInit() {
    this.healthMonitorChanges = this.subscribeToHealthMonitorModal();
  }

  ngOnDestroy() {
    SubscriptionUtil.unsubscribe([this.healthMonitorChanges, this.dataChanges]);
  }

  public delete(healthMonitor: LoadBalancerHealthMonitor): void {
    this.entityService.deleteEntity(healthMonitor, {
      entityName: 'Health Monitor',
      delete$: this.healthMonitorsService.v1LoadBalancerHealthMonitorsIdDelete({ id: healthMonitor.id }),
      softDelete$: this.healthMonitorsService.v1LoadBalancerHealthMonitorsIdSoftDelete({ id: healthMonitor.id }),
      onSuccess: () => this.loadHealthMonitors(),
    });
  }

  public loadHealthMonitors(): void {
    this.isLoading = true;
    this.healthMonitorsService
      .v1LoadBalancerHealthMonitorsGet({
        filter: `tierId||eq||${this.currentTier.id}`,
      })
      .subscribe(
        healthMonitors => {
          this.healthMonitors = healthMonitors.map(h => {
            return {
              ...h,
              state: h.provisionedAt ? 'Provisioned' : 'Not Provisioned',
            };
          });
        },
        () => {
          this.healthMonitors = [];
        },
        () => {
          this.isLoading = false;
        },
      );
  }

  public import(healthMonitors: ImportHealthMonitor[]): void {
    const bulk = healthMonitors.map(healthMonitor => {
      const { vrfName } = healthMonitor;
      if (!vrfName) {
        return healthMonitor;
      }

      const tierId = ObjectUtil.getObjectId(vrfName, this.tiers);
      return {
        ...healthMonitor,
        tierId,
      };
    });

    this.healthMonitorsService
      .v1LoadBalancerHealthMonitorsBulkPost({
        generatedLoadBalancerHealthMonitorBulkDto: { bulk },
      })
      .subscribe(() => this.loadHealthMonitors());
  }

  public openModal(healthMonitor?: LoadBalancerHealthMonitor): void {
    const dto: HealthMonitorModalDto = {
      tierId: this.currentTier.id,
      healthMonitor,
    };
    this.ngx.setModalData(dto, 'healthMonitorModal');
    this.ngx.open('healthMonitorModal');
  }

  public restore(healthMonitor: LoadBalancerHealthMonitor): void {
    if (!healthMonitor.deletedAt) {
      return;
    }
    this.healthMonitorsService
      .v1LoadBalancerHealthMonitorsIdRestorePatch({ id: healthMonitor.id })
      .subscribe(() => this.loadHealthMonitors());
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

  private subscribeToHealthMonitorModal(): Subscription {
    return this.ngx.getModal('healthMonitorModal').onCloseFinished.subscribe(() => {
      this.loadHealthMonitors();
      this.ngx.resetModalData('healthMonitorModal');
    });
  }
}

export interface ImportHealthMonitor extends LoadBalancerHealthMonitor {
  vrfName?: string;
}
