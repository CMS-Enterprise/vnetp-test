import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Environment, V3GlobalEnvironmentsService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription, forkJoin } from 'rxjs';
import { TableConfig } from 'src/app/common/table/table.component';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';

interface EnvironmentTableData extends Environment {
  totalRoutes?: number;
  externalVrfCount?: number;
}

// Define pagination-like structure that the table component expects
interface EnvironmentPaginationData {
  data: EnvironmentTableData[];
  count: number;
  total: number;
  page: number;
  pageCount: number;
}

@Component({
  selector: 'app-environment-management',
  templateUrl: './environment-management.component.html',
  styleUrls: ['./environment-management.component.scss'],
})
export class EnvironmentManagementComponent implements OnInit {
  public environmentModalSubscription: Subscription;

  ModalMode = ModalMode;

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;
  @ViewChild('externalVrfsTemplate') externalVrfsTemplate: TemplateRef<any>;
  @ViewChild('lastSyncTemplate') lastSyncTemplate: TemplateRef<any>;

  public config: TableConfig<EnvironmentTableData> = {
    description: 'environments',
    columns: [
      { name: 'Name', property: 'name' },
      { name: 'Description', property: 'description' },
      { name: 'Last Route Sync', template: () => this.lastSyncTemplate },
      { name: 'Total Routes', property: 'totalRoutes' },
      { name: 'External VRFs', template: () => this.externalVrfsTemplate },
      { name: '', template: () => this.actionsTemplate },
    ],
    hideAdvancedSearch: true,
    hideSearchBar: true,
  };

  perPage = 20;
  environments: EnvironmentPaginationData = {
    data: [],
    count: 0,
    total: 0,
    page: 1,
    pageCount: 1,
  };
  isLoading = false;

  public tableComponentDto = new TableComponentDto();

  constructor(private environmentService: V3GlobalEnvironmentsService, public ngx: NgxSmartModalService) {}

  ngOnInit(): void {
    this.getEnvironments();
  }

  public subscribeToEnvironmentModal(): void {
    this.environmentModalSubscription = this.ngx.getModal('environmentModal').onCloseFinished.subscribe(() => {
      this.ngx.resetModalData('environmentModal');
      this.environmentModalSubscription.unsubscribe();
      this.getEnvironments();
    });
  }

  public openEnvironmentModal(modalMode: ModalMode, environment?: Environment): void {
    const dto: any = {};
    dto.ModalMode = modalMode;
    if (environment) {
      dto.environment = environment;
    }
    this.subscribeToEnvironmentModal();
    this.ngx.setModalData(dto, 'environmentModal');
    this.ngx.getModal('environmentModal').open();
  }

  public getEnvironments(): void {
    this.isLoading = true;

    // Get both environments and summaries to combine the data
    forkJoin({
      environments: this.environmentService.getManyEnvironments(),
      summaries: this.environmentService.getManyEnvironmentSummaries(),
    }).subscribe({
      next: data => {
        // Merge environment data with summary data
        const mergedData = data.environments.map(env => {
          const summary = data.summaries.find(s => s.id === env.id);
          return {
            ...env,
            totalRoutes: summary?.totalRoutes || 0,
            externalVrfCount: env.externalVrfs?.length || 0,
          } as EnvironmentTableData;
        });

        // Wrap in pagination structure that table component expects
        this.environments = {
          data: mergedData,
          count: mergedData.length,
          total: mergedData.length,
          page: 1,
          pageCount: 1,
        };

        this.isLoading = false;
      },
      error: error => {
        console.error('Error loading environments:', error);
        this.isLoading = false;
      },
    });
  }

  public onTableEvent(event: TableComponentDto): void {
    this.tableComponentDto = event;
    // For now, we don't have pagination on the backend for these endpoints
    // so we'll just reload all data
    this.getEnvironments();
  }

  public editEnvironment(environment: Environment): void {
    this.openEnvironmentModal(ModalMode.Edit, environment);
  }

  public getExternalVrfDisplayText(vrfs: any[] | null): string {
    if (!vrfs || vrfs.length === 0) {
      return 'None';
    }
    if (vrfs.length === 1) {
      return '1 VRF';
    }
    return `${vrfs.length} VRFs`;
  }
}
