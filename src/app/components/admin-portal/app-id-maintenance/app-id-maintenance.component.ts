import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { AuthService } from '../../../services/auth.service';
import { TenantStateService } from '../../../services/tenant-state.service';
import { Tier, V1RuntimeDataAppIdRuntimeService, V1TiersService } from '../../../../../client';
import { forkJoin, of } from 'rxjs';
import { mergeMap, finalize, tap, map, catchError } from 'rxjs/operators';
import { YesNoModalDto } from '../../../models/other/yes-no-modal-dto';
import { NgxSmartModalService } from 'ngx-smart-modal';
import SubscriptionUtil from '../../../utils/SubscriptionUtil';
import { RuntimeDataService } from '../../../services/runtime-data.service';
import { MatDialog } from '@angular/material/dialog';
import {
  TierManagementModalComponent,
  TierManagementModalData,
  TierManagementSaveChanges,
} from './tier-management-modal/tier-management-modal.component';

interface Tenant {
  tenant: string;
  currentVersion: string | null;
  lastUpdated: string | null;
  appIdEnabled: boolean;
  isRefreshDisabled: boolean;
  isUpdateDisabled: boolean;
  isRefreshingAppIdRuntimeData?: boolean;
  appIdJobStatus?: string | null;
  updateJobStatus?: 'success' | 'error' | null;
  tiers?: Tier[];
  tenantQueryParameter?: string;
}

@Component({
  selector: 'app-app-id-maintenance',
  templateUrl: './app-id-maintenance.component.html',
  styleUrl: './app-id-maintenance.component.css',
})
export class AppIdMaintenanceComponent implements OnInit {
  displayedColumns: string[] = ['select', 'tenant', 'currentVersion', 'lastUpdated', 'actions'];
  dataSource = new MatTableDataSource<Tenant>();
  selection = new SelectionModel<Tenant>(true, []);
  updateCode = '';

  constructor(
    private authService: AuthService,
    private tenantStateService: TenantStateService,
    private tierService: V1TiersService,
    private ngx: NgxSmartModalService,
    private appIdService: V1RuntimeDataAppIdRuntimeService,
    private runtimeDataService: RuntimeDataService,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.getTenants();
  }

  getTenants() {
    this.dataSource.data = [];
    this.authService
      .getTenants(this.authService.currentUserValue.token)
      .pipe(
        mergeMap(tenants => {
          const tenantData: Tenant[] = [];
          if (!tenants || tenants.length === 0) {
            return of(null);
          }
          return forkJoin(
            tenants.map(tenant =>
              of(null).pipe(
                tap(() => this.tenantStateService.setTenant(tenant.tenantQueryParameter)),
                mergeMap(() => this.tierService.getManyTier({ limit: 10000 })),
                tap(tier => {
                  const tiersForTenant = tier as unknown as Tier[];

                  const appIdEnabled = tiersForTenant?.some(t => t.appIdEnabled) || false;
                  const appVersion = tiersForTenant?.find(t => !!t.appVersion)?.appVersion || null;
                  const lastUpdated = tiersForTenant?.find(t => !!t.runtimeDataLastRefreshed)?.runtimeDataLastRefreshed || null;

                  const isRefreshDisabled = !appIdEnabled;
                  const isUpdateDisabled = !appIdEnabled || appVersion === null;

                  tenantData.push({
                    tenant: tenant.tenant,
                    currentVersion: appVersion,
                    lastUpdated,
                    appIdEnabled,
                    isRefreshDisabled,
                    isUpdateDisabled,
                    isRefreshingAppIdRuntimeData: false,
                    appIdJobStatus: null,
                    updateJobStatus: null,
                    tiers: tiersForTenant,
                    tenantQueryParameter: tenant.tenantQueryParameter,
                  });
                }),
                finalize(() => {
                  this.tenantStateService.clearTenant();
                }),
              ),
            ),
          ).pipe(
            tap(() => {
              this.dataSource.data = tenantData;
            }),
          );
        }),
      )
      .subscribe({
        error: error => {
          console.error('Error fetching tenant data:', error);
          this.dataSource.data = [];
        },
      });
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numSelectableRows = this.dataSource.data.filter(row => !row.isUpdateDisabled).length;
    return numSelected > 0 && numSelected === numSelectableRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAll() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    const selectableRows = this.dataSource.data.filter(row => !row.isUpdateDisabled);
    this.selection.select(...selectableRows);
  }

  get isAnySelectedTenantUpdateDisabled(): boolean {
    if (!this.selection.hasValue()) {
      return false; // Or true, depending on desired behavior when nothing is selected - typically false
    }
    return this.selection.selected.some(t => t.isUpdateDisabled);
  }

  update() {
    const selectedTenants = this.selection.selected.map(tenant => tenant.tenant).join(',\n    ');
    const message = `Are you sure you want to run an App ID Maintenance job on the following tenants: ${selectedTenants}?`;
    const dto = new YesNoModalDto('Run App ID Maintenance?', message);
    const onConfirm = () => {
      this.selection.selected.forEach(t => {
        const tenantInDataSource = this.dataSource.data.find(dsTenant => dsTenant.tenant === t.tenant);
        if (tenantInDataSource) {
          tenantInDataSource.updateJobStatus = null;
        }
      });

      const updateOperations = this.selection.selected.map(tenant =>
        of(null).pipe(
          tap(() => this.tenantStateService.setTenant(tenant.tenant)),
          mergeMap(() =>
            this.appIdService.runAppIdMaintenanceAppIdRuntime().pipe(
              map(response => ({ tenant: tenant.tenant, success: true, response })),
              catchError(error => of({ tenant: tenant.tenant, success: false, error })),
            ),
          ),
          finalize(() => this.tenantStateService.clearTenant()),
        ),
      );

      forkJoin(updateOperations).subscribe(results => {
        results.forEach(result => {
          const tenantInDataSource = this.dataSource.data.find(t => t.tenant === result.tenant);
          if (tenantInDataSource) {
            tenantInDataSource.updateJobStatus = result.success ? 'success' : 'error';
          }
          if (result.success) {
            console.log(`App ID Maintenance job succeeded for tenant: ${result.tenant}`, (result as { response: any }).response);
          } else {
            console.error(`App ID Maintenance job failed for tenant: ${result.tenant}`, (result as { error: any }).error);
          }
        });

        this.selection.clear();
        this.getTenants();
      });
    };

    SubscriptionUtil.subscribeToYesNoModal(dto, this.ngx, onConfirm);
  }

  refreshTenant(tenant: any): void {
    const message =
      'This will refresh Panos Applications and App ID runtime data for this tenant.\n\n' +
      // eslint-disable-next-line @typescript-eslint/quotes
      "For a full update, including other maintenance tasks, using the main 'Run App ID Maintenance' job is recommended.\n\n" +
      'Continue with this specific refresh?';
    const dto = new YesNoModalDto('Refresh Panos Applications?', message);
    const onConfirm = () => {
      this.refreshAppId(tenant);
    };
    SubscriptionUtil.subscribeToYesNoModal(dto, this.ngx, onConfirm);
  }

  refreshAppId(tenant: any): void {
    if (tenant.isRefreshingAppIdRuntimeData) {
      return;
    }

    tenant.isRefreshingAppIdRuntimeData = true;
    tenant.appIdJobStatus = null;

    this.tenantStateService.setTenant(tenant.tenantQueryParameter);

    this.appIdService
      .createRuntimeDataJobAppIdRuntime()
      .pipe(
        finalize(() => {
          this.tenantStateService.clearTenant();
        }),
      )
      .subscribe({
        next: job => {
          let status = '';
          this.runtimeDataService.pollJobStatus(job.id, tenant.tenantQueryParameter).subscribe({
            next: towerJobDto => {
              status = towerJobDto.status;
            },
            error: pollError => {
              console.error(`Polling error for tenant ${tenant.tenant}:`, pollError);
              status = 'error';
              tenant.appIdJobStatus = status;
              tenant.isRefreshingAppIdRuntimeData = false;
            },
            complete: () => {
              tenant.appIdJobStatus = status;
              if (status === 'successful') {
                this.getTenants();
              } else if (status !== 'error') {
                status = 'error';
                tenant.isRefreshingAppIdRuntimeData = false;
              }
            },
          });
        },
        error: creationError => {
          console.error(`Job creation error for tenant ${tenant.tenant}:`, creationError);
          tenant.appIdJobStatus = 'error';
          tenant.isRefreshingAppIdRuntimeData = false;
        },
      });
  }

  openTierManagementModal(tenant: Tenant): void {
    const dialogRef = this.dialog.open<TierManagementModalComponent, TierManagementModalData, TierManagementSaveChanges>(
      TierManagementModalComponent,
      {
        width: '600px',
        data: {
          tenantName: tenant.tenant,
          tiers: tenant.tiers || [],
        },
      },
    );

    dialogRef.componentInstance.saveChanges.subscribe((changes: TierManagementSaveChanges) => {
      if (changes.tiersToUpdate && changes.tiersToUpdate.length > 0) {
        this.handleTierUpdates(tenant, changes.tiersToUpdate);
      }
      dialogRef.close();
    });

    dialogRef.componentInstance.closeModal.subscribe(() => {
      dialogRef.close();
    });
  }

  handleTierUpdates(originalTenant: Tenant, tiersToUpdate: { id: string; appIdEnabled: boolean }[]): void {
    const updateOperations = tiersToUpdate.map(tierUpdate => {
      this.tenantStateService.setTenant(originalTenant.tenant);
      return this.tierService
        .toggleAppIdTier({
          id: tierUpdate.id,
        })
        .pipe(
          finalize(() => this.tenantStateService.clearTenant()),
          catchError(err => {
            console.error(`Failed to update tier ${tierUpdate.id} for tenant ${originalTenant.tenant}`, err);
            return of(null);
          }),
        );
    });

    forkJoin(updateOperations).subscribe({
      next: () => {
        this.getTenants();
      },
      error: batchError => {
        console.error('Error in batch tier update process for tenant ', originalTenant.tenant, batchError);
      },
    });
  }
}
