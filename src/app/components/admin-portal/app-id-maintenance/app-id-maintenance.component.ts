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

interface Tenant {
  tenant: string;
  currentVersion: string;
  lastUpdated: string;
}

@Component({
  selector: 'app-app-id-maintenance',
  templateUrl: './app-id-maintenance.component.html',
  styleUrl: './app-id-maintenance.component.css',
})
export class AppIdMaintenanceComponent implements OnInit {
  displayedColumns: string[] = ['select', 'tenant', 'currentVersion', 'lastUpdated'];
  dataSource = new MatTableDataSource<Tenant>();
  selection = new SelectionModel<Tenant>(true, []);
  updateCode = '';
  externalSiteUrl = 'https://example.com/app-id-update';

  constructor(
    private authService: AuthService,
    private tenantStateService: TenantStateService,
    private tierService: V1TiersService,
    private ngx: NgxSmartModalService,
    private appIdService: V1RuntimeDataAppIdRuntimeService,
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
                tap(() => this.tenantStateService.setTenant(tenant.tenant)),
                mergeMap(() => this.tierService.getManyTier({ filter: ['appVersion||notnull'], limit: 1 })),
                tap(tier => {
                  if ((tier as unknown as Tier[])?.length > 0) {
                    const t = tier[0];
                    tenantData.push({
                      tenant: tenant.tenant,
                      currentVersion: t.appVersion,
                      lastUpdated: t.runtimeDataLastRefreshed,
                    });
                  }
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
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAll() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.dataSource.data);
  }

  update() {
    const selectedTenants = this.selection.selected.map(tenant => tenant.tenant).join(',\n    ');
    const message = `Are you sure you want to run an App ID Maintenance job on the following tenants: ${selectedTenants}?`;
    const dto = new YesNoModalDto('Run App ID Maintenance?', message);
    const onConfirm = () => {
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
}
