import { Component, Input, OnDestroy, OnInit, TemplateRef, Type, ViewChild } from '@angular/core';
import { LoadBalancerHealthMonitor, Tier, V1LoadBalancerHealthMonitorsService } from 'api_client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { TableConfig } from 'src/app/common/table/table.component';
import { EntityService } from 'src/app/services/entity.service';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { HealthMonitorModalDto } from '../health-monitor-modal/health-monitor-modal.dto';

interface HealthMonitorView extends LoadBalancerHealthMonitor {
  provisionedState: string;
}

@Component({
  selector: 'app-health-monitor-list',
  templateUrl: './health-monitor-list.component.html',
})
export class HealthMonitorListComponent implements OnInit, OnDestroy {
  @Input() currentTier: Tier;
  @Input() tiers: Tier[] = [];

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

  public config: TableConfig<HealthMonitorView> = {
    description: 'Health Monitors in the currently selected Tier',
    columns: [
      { name: 'Name', property: 'name' },
      { name: 'Type', property: 'type' },
      { name: 'Service Port', property: 'servicePort' },
      { name: 'Interval', property: 'interval' },
      { name: 'Timeout', property: 'timeout' },
      { name: 'Provisioned', property: 'provisionedState' },
      { name: '', template: () => this.actionsTemplate },
    ],
  };
  public healthMonitors: HealthMonitorView[] = [];
  public isLoading = false;

  private healthMonitorChanges: Subscription;

  constructor(
    private entityService: EntityService,
    private healthMonitorsService: V1LoadBalancerHealthMonitorsService,
    private ngx: NgxSmartModalService,
  ) {}

  ngOnInit() {
    this.loadHealthMonitors();
    this.healthMonitorChanges = this.subscribeToHealthMonitorModal();
  }

  ngOnDestroy() {
    SubscriptionUtil.unsubscribe([this.healthMonitorChanges]);
  }

  public deleteHealthMonitor(healthMonitor: LoadBalancerHealthMonitor): void {
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
              provisionedState: h.provisionedAt ? 'Provisioned' : 'Not Provisioned',
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

  public importHealthMonitors(healthMonitors: ImportHealthMonitor[]): void {
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

  public openHealthMonitorModal(healthMonitor?: LoadBalancerHealthMonitor): void {
    const dto: HealthMonitorModalDto = {
      tierId: this.currentTier.id,
      healthMonitor,
    };
    this.ngx.setModalData(dto, 'healthMonitorModal');
    this.ngx.getModal('healthMonitorModal').open();
  }

  public restoreHealthMonitor(healthMonitor: LoadBalancerHealthMonitor): void {
    if (!healthMonitor.deletedAt) {
      return;
    }
    this.healthMonitorsService
      .v1LoadBalancerHealthMonitorsIdRestorePatch({ id: healthMonitor.id })
      .subscribe(() => this.loadHealthMonitors());
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
