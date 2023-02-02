import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Tenant, TenantPaginationResponse, V2AppCentricTenantsService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { SearchColumnConfig } from 'src/app/common/search-bar/search-bar.component';
import { TableConfig } from 'src/app/common/table/table.component';
import { TenantModalDto } from 'src/app/models/appcentric/tenant-modal-dto';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { TableContextService } from 'src/app/services/table-context.service';

@Component({
  selector: 'app-tenant-select',
  templateUrl: './tenant-select.component.html',
})
export class TenantSelectComponent implements OnInit {
  public ModalMode = ModalMode;
  public currentTenantsPage = 1;
  public perPage = 20;
  public tenants = {} as TenantPaginationResponse;
  public tableComponentDto = new TableComponentDto();
  private tenantModalSubscription: Subscription;

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

  constructor(
    private tenantService: V2AppCentricTenantsService,
    private tableContextService: TableContextService,
    private ngx: NgxSmartModalService,
  ) {}

  ngOnInit(): void {
    this.getTenants();
  }

  public onTableEvent(event: TableComponentDto): void {
    this.tableComponentDto = event;
    this.getTenants(event);
  }

  public getTenants(event?): void {
    this.isLoading = true;
    let eventParams;
    if (event) {
      this.tableComponentDto.page = event.page ? event.page : 1;
      this.tableComponentDto.perPage = event.perPage ? event.perPage : 20;
      const { searchText } = event;
      const propertyName = event.searchColumn ? event.searchColumn : null;
      if (propertyName) {
        eventParams = `${propertyName}||cont||${searchText}`;
      }
    }
    this.tenantService
      .findAllTenant({
        page: this.tableComponentDto.page,
        perPage: this.tableComponentDto.perPage,
      })
      .subscribe(
        data => {
          this.tenants = data;
        },
        () => {
          this.tenants = null;
        },
        () => {
          this.isLoading = false;
        },
      );
  }

  public openTenantModal(modalMode: ModalMode, tenant?: Tenant): void {
    const dto = new TenantModalDto();

    dto.ModalMode = modalMode;

    if (modalMode === ModalMode.Edit) {
      dto.Tenant = tenant;
    }

    this.subscribeToTenantModal();
    this.ngx.setModalData(dto, 'tenantModal');
    this.ngx.getModal('tenantModal').open();
  }

  public deleteTenant(tenant: Tenant): void {
    if (tenant.deletedAt) {
      this.tenantService.removeTenant({ uuid: tenant.id }).subscribe(() => {
        const params = this.tableContextService.getSearchLocalStorage();
        const { filteredResults } = params;

        // if filtered results boolean is true, apply search params in the
        // subsequent get call
        if (filteredResults) {
          this.getTenants(params);
        } else {
          this.getTenants();
        }
      });
    } else {
      this.tenantService
        .updateTenant({
          uuid: tenant.id,
          tenant: { deleted: true },
        })
        .subscribe(() => {
          const params = this.tableContextService.getSearchLocalStorage();
          const { filteredResults } = params;

          // if filtered results boolean is true, apply search params in the
          // subsequent get call
          if (filteredResults) {
            this.getTenants(params);
          } else {
            this.getTenants();
          }
        });
    }
  }

  public restoreTenant(tenant: Tenant): void {
    if (!tenant.deletedAt) {
      return;
    }

    this.tenantService
      .updateTenant({
        uuid: tenant.id,
        tenant: { deleted: false },
      })
      .subscribe(() => {
        const params = this.tableContextService.getSearchLocalStorage();
        const { filteredResults } = params;

        // if filtered results boolean is true, apply search params in the
        // subsequent get call
        if (filteredResults) {
          this.getTenants(params);
        } else {
          this.getTenants();
        }
      });
  }

  public importTenantsConfig(tenants: Tenant[]): void {
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

  private subscribeToTenantModal(): void {
    this.tenantModalSubscription = this.ngx.getModal('tenantModal').onCloseFinished.subscribe(() => {
      this.ngx.resetModalData('tenantModal');
      this.tenantModalSubscription.unsubscribe();
      // get search params from local storage
      const params = this.tableContextService.getSearchLocalStorage();
      const { filteredResults } = params;

      // if filtered results boolean is true, apply search params in the
      // subsequent get call
      if (filteredResults) {
        this.getTenants(params);
      } else {
        this.getTenants();
      }
    });
  }
}
