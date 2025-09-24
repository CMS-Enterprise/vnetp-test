import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Tenant, GetManyTenantResponseDto, V2AppCentricTenantsService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { SearchColumnConfig } from 'src/app/common/search-bar/search-bar.component';
import { TableConfig } from 'src/app/common/table/table.component';
import { TenantModalDto } from 'src/app/models/appcentric/tenant-modal-dto';
import { ApplicationMode } from 'src/app/models/other/application-mode-enum';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { TableContextService } from 'src/app/services/table-context.service';
import { RouteDataUtil } from 'src/app/utils/route-data.util';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';

@Component({
  selector: 'app-tenant-select',
  templateUrl: './tenant-select.component.html',
})
export class TenantSelectComponent implements OnInit {
  public ModalMode = ModalMode;
  public currentTenantsPage = 1;
  public perPage = 20;
  public tenants = {} as GetManyTenantResponseDto;
  public tableComponentDto = new TableComponentDto();
  public tenantModalSubscription: Subscription;
  selectedTenantToDelete: Tenant;
  objectType = 'tenant';
  ApplicationMode = ApplicationMode;
  applicationMode: ApplicationMode;

  public isLoading = false;

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;
  @ViewChild('tenantSelectNameTemplate') tenantSelectNameTemplate: TemplateRef<any>;

  public searchColumns: SearchColumnConfig[] = [];

  public config: TableConfig<any> = {
    description: 'Tenants',
    columns: [
      { name: 'Name', template: () => this.tenantSelectNameTemplate },
      { name: 'Alias', property: 'alias' },
      { name: 'Description', property: 'description' },
      { name: '', template: () => this.actionsTemplate },
    ],
  };
  typeDeletemodalSubscription: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private tenantService: V2AppCentricTenantsService,
    private tableContextService: TableContextService,
    private ngx: NgxSmartModalService,
  ) {}

  ngOnInit(): void {
    this.determineApplicationMode();
    this.getTenants();
  }

  private determineApplicationMode(): void {
    this.applicationMode = RouteDataUtil.getApplicationModeFromRoute(this.route);
  }

  public onTableEvent(event: TableComponentDto): void {
    this.tableComponentDto = event;
    this.getTenants();
  }

  public getTenants(): void {
    const filter =
      this.applicationMode === ApplicationMode.TENANTV2 || this.applicationMode === ApplicationMode.ADMINPORTAL
        ? 'tenantVersion||eq||2'
        : 'tenantVersion||eq||1';

    this.tenantService
      .getManyTenant({
        page: this.tableComponentDto.page,
        perPage: this.tableComponentDto.perPage,
        filter: [filter],
      })
      .subscribe({
        next: data => {
          this.tenants = data;
        },
        error: () => {
          this.tenants = null;
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }

  public openTenantModal(modalMode: ModalMode, tenant?: Tenant): void {
    const dto = new TenantModalDto();

    dto.ModalMode = modalMode;

    if (modalMode === ModalMode.Edit) {
      dto.Tenant = tenant;
    }

    // Initialize AdminPortal specific properties when in admin portal mode
    if (this.applicationMode === ApplicationMode.ADMINPORTAL) {
      // Set default values for AdminPortal specific properties
      dto.northSouthFirewallVendor = 'PANOS';
      dto.northSouthFirewallArchitecture = 'Virtual';
      dto.northSouthHa = true;
      dto.eastWestFirewallVendor = 'PANOS';
      dto.eastWestFirewallArchitecture = 'Virtual';
      dto.eastWestHa = true;

      // Initialize feature flags
      dto.featureFlags = {
        northSouthAppId: true,
        eastWestAppId: true,
        nat64NorthSouth: false,
        eastWestAllowSgBypass: false,
        eastWestNat: false,
      };

      // If editing, populate with existing tenant data if available
      if (modalMode === ModalMode.Edit && tenant) {
        // Here you would normally populate with existing data from the tenant
        // For now, we're just using defaults since we don't have the actual properties
      }
    }

    this.subscribeToTenantModal();
    this.ngx.setModalData(dto, 'tenantModal');
    this.ngx.getModal('tenantModal').open();
  }

  public deleteTenant(tenant: Tenant): void {
    if (tenant.deletedAt) {
      this.openTypeDeleteModal(tenant);
    } else {
      const modalDto = new YesNoModalDto('Soft Delete Tenant', `Are you sure you want to soft delete ${tenant.name}? This can be undone.`);
      const onConfirm = () => {
        this.tenantService
          .softDeleteOneTenant({
            id: tenant.id,
          })
          .subscribe(() => {
            const params = this.tableContextService.getSearchLocalStorage();
            const { filteredResults } = params;

            // if filtered results boolean is true, apply search params in the
            // subsequent get call
            if (filteredResults) {
              this.getTenants();
            } else {
              this.getTenants();
            }
          });
      };
      SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm);
    }
  }

  public restoreTenant(tenant: Tenant): void {
    if (!tenant.deletedAt) {
      return;
    }

    this.tenantService
      .restoreOneTenant({
        id: tenant.id,
      })
      .subscribe(() => {
        const params = this.tableContextService.getSearchLocalStorage();
        const { filteredResults } = params;

        // if filtered results boolean is true, apply search params in the
        // subsequent get call
        if (filteredResults) {
          this.getTenants();
        } else {
          this.getTenants();
        }
      });
  }

  public importTenantsConfig(): void {
    // const tenantEnding = tenants.length > 1 ? 's' : '';
    // const modalDto = new YesNoModalDto(
    //   `Import Tier${tenantEnding}`,
    //   `Would you like to import ${tenants.length} tier${tenantEnding}?`,
    //   `Import Tier${tenantEnding}`,
    //   'Cancel',
    // );
    // const onConfirm = () => {
    //   this.tenantService
    //     .createManyTier({
    //       createManyTierDto: { bulk: this.sanitizeTiers(tiers) },
    //     })
    //     .subscribe(() => {
    //       this.getTiers();
    //     });
    // };
    // SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm);
  }

  public navigateToTenantInfrastructure(mode: 'create' | 'edit' = 'create', tenant?: Tenant): void {
    if (mode === 'edit' && tenant?.id) {
      this.router.navigate([`/adminportal/tenant-infrastructure/edit/${tenant.id}`], { queryParamsHandling: 'merge' });
      return;
    }
    this.router.navigate(['/adminportal/tenant-infrastructure/create'], { queryParamsHandling: 'merge' });
  }

  public navigateToTenantPortal(tenant: Tenant): void {
    this.router.navigate([`/tenantv2/tenant-select/edit/${tenant.id}/home`], { queryParamsHandling: 'merge' });
  }

  public subscribeToTenantModal(): void {
    this.tenantModalSubscription = this.ngx.getModal('tenantModal').onCloseFinished.subscribe(() => {
      this.ngx.resetModalData('tenantModal');
      this.tenantModalSubscription.unsubscribe();
      // get search params from local storage
      const params = this.tableContextService.getSearchLocalStorage();
      const { filteredResults } = params;

      // if filtered results boolean is true, apply search params in the
      // subsequent get call
      if (filteredResults) {
        this.getTenants();
      } else {
        this.getTenants();
      }
    });
  }

  public subscribeToTypeDeleteModal(): void {
    this.typeDeletemodalSubscription = this.ngx.getModal('typeDeleteModal').onCloseFinished.subscribe(() => {
      this.ngx.resetModalData('typeDeleteModal');
      this.typeDeletemodalSubscription.unsubscribe();
      this.getTenants();
    });
  }

  public openTypeDeleteModal(tenant: Tenant): void {
    this.selectedTenantToDelete = tenant;
    this.subscribeToTypeDeleteModal();
    this.ngx.getModal('typeDeleteModal').open();
  }
}
