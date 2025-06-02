import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Tenant, GetManyTenantResponseDto, V2AppCentricTenantsService } from 'client';
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
  public tenants = {} as GetManyTenantResponseDto;
  public tableComponentDto = new TableComponentDto();
  public tenantModalSubscription: Subscription;
  selectedTenantToDelete: Tenant;
  objectType = 'tenant';

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
    private tenantService: V2AppCentricTenantsService,
    private tableContextService: TableContextService,
    private ngx: NgxSmartModalService,
  ) {}

  ngOnInit(): void {
    this.getTenants();
  }

  public onTableEvent(event: TableComponentDto): void {
    this.tableComponentDto = event;
    this.getTenants();
  }

  public getTenants(): void {
    this.isLoading = true;
    // let eventParams;
    // if (event) {
    //   this.tableComponentDto.page = event.page ? event.page : 1;
    //   this.tableComponentDto.perPage = event.perPage ? event.perPage : 20;
    //   const { searchText } = event;
    //   const propertyName = event.searchColumn ? event.searchColumn : null;
    //   if (propertyName) {
    //     eventParams = `${propertyName}||cont||${searchText}`;
    //   }
    // }
    this.tenantService
      .getManyTenant({
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
      this.openTypeDeleteModal(tenant);
    } else {
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
