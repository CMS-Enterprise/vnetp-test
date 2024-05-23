import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { V1NetworkScopeFormsWanFormService } from 'client/api/v1NetworkScopeFormsWanForm.service';
import { WanForm } from 'client/model/wanForm';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { TableConfig } from 'src/app/common/table/table.component';
import { WanFormModalDto } from 'src/app/models/network-scope-forms/wan-form-modal.dto';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { TableContextService } from 'src/app/services/table-context.service';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { GetManyWanFormResponseDto } from '../../../../../client/model/getManyWanFormResponseDto';
import { SearchColumnConfig } from '../../../common/search-bar/search-bar.component';
import { MatSidenav } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import { Tenant, V2AppCentricTenantsService } from '../../../../../client';

@Component({
  selector: 'app-wan-form',
  templateUrl: './wan-form.component.html',
  styleUrls: ['./wan-form.component.scss'],
})
export class WanFormComponent implements OnInit, OnDestroy {
  public isLoading = false;
  public wanForms: GetManyWanFormResponseDto;
  public perPage = 20;
  public tableComponentDto = new TableComponentDto();
  public wanFormModalSubscription: Subscription;
  public ModalMode = ModalMode;
  public datacenterId: string;
  public currentDatacenterSubscription: Subscription;
  public dcsMode: string;
  public selectedTenant: string;
  public tenants: Tenant[];

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;
  @ViewChild('activeTemplate') activeTemplate: TemplateRef<any>;
  @ViewChild('expandedRows') expandedRows: TemplateRef<any>;
  @ViewChild('drawer') drawer: MatSidenav;

  public searchColumns: SearchColumnConfig[] = [
    { propertyName: 'name', displayName: 'Name' },
    { displayName: 'Description', propertyName: 'description' },
    { displayName: 'Created At', propertyName: 'createdAt' },
    { displayName: 'Active', propertyName: 'active', propertyType: 'boolean' },
  ];

  public config: TableConfig<any> = {
    description: 'Wan Forms',
    columns: [
      { name: 'Name', property: 'name' },
      { name: 'Description', property: 'description' },
      { name: 'Created At', property: 'createdAt' },
      { name: 'Active', template: () => this.activeTemplate },
      { name: '', template: () => this.actionsTemplate },
    ],
    expandableRows: () => this.expandedRows,
    hideAdvancedSearch: true,
  };

  constructor(
    private wanFormService: V1NetworkScopeFormsWanFormService,
    private ngx: NgxSmartModalService,
    private tableContextService: TableContextService,
    private datacenterContextService: DatacenterContextService,
    private route: ActivatedRoute,
    private router: Router,
    private tenantService: V2AppCentricTenantsService,
  ) {
    this.selectedTenant = this.route.snapshot.queryParams.tenantId;
  }

  ngOnInit(): void {
    this.dcsMode = this.route.snapshot.data.mode;
    if (this.dcsMode === 'netcentric') {
      this.currentDatacenterSubscription = this.datacenterContextService.currentDatacenter.subscribe(cd => {
        if (cd) {
          this.datacenterId = cd.id;
          this.getWanForms();
        }
      });
    } else {
      if (!this.selectedTenant) {
        this.getTenants();
      } else {
        this.getWanForms();
      }
    }
  }

  ngOnDestroy(): void {
    this.currentDatacenterSubscription?.unsubscribe();
  }

  public onTableEvent(event: TableComponentDto): void {
    this.tableComponentDto = event;
    this.getWanForms(event);
  }

  public openModal(modalMode: ModalMode, wanForm?: WanForm): void {
    const dto = new WanFormModalDto();

    dto.modalMode = modalMode;

    if (modalMode === ModalMode.Edit) {
      dto.wanForm = wanForm;
    }

    this.subscribeToModal();
    this.ngx.setModalData(dto, 'wanFormModal');
    this.ngx.getModal('wanFormModal').open();
  }

  private subscribeToModal(): void {
    this.wanFormModalSubscription = this.ngx.getModal('wanFormModal').onCloseFinished.subscribe(() => {
      this.ngx.resetModalData('wanFormModal');
      this.wanFormModalSubscription.unsubscribe();
      // get search params from local storage
      const params = this.tableContextService.getSearchLocalStorage();
      const { filteredResults } = params;
      if (filteredResults) {
        this.getWanForms(params);
      } else {
        this.getWanForms();
      }
    });
  }

  public getWanForms(event?) {
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
    const filerParam = this.dcsMode === 'netcentric' ? `datacenterId||eq||${this.datacenterId}` : `tenantId||eq||${this.selectedTenant}`;
    this.wanFormService
      .getManyWanForm({
        filter: [filerParam, eventParams],
        join: ['externalRoutes', 'wanFormSubnets'],
        page: this.tableComponentDto.page,
        perPage: this.tableComponentDto.perPage,
      })
      .subscribe(
        data => {
          this.wanForms = data;
        },
        () => {
          this.wanForms = null;
        },
        () => {
          this.isLoading = false;
        },
      );
  }

  public activateWanForm(wanForm: WanForm): void {
    const modalDto = new YesNoModalDto('Activate WAN Form', `Are you sure you want to activate: '${wanForm.name}'?`);
    const onConfirm = () => {
      this.wanFormService.activateWanFormWanForm({ id: wanForm.id }).subscribe(() => {
        this.getWanForms();
      });
    };
    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm);
  }

  public deactivateWanForm(wanForm: WanForm) {
    const modalDto = new YesNoModalDto('Deactivate WAN Form', `Are you sure you want to deactivate: '${wanForm.name}'?`);
    const onConfirm = () => {
      this.wanFormService.deactivateWanFormWanForm({ id: wanForm.id }).subscribe(() => {
        this.getWanForms();
      });
    };
    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm);
  }

  public deleteWanForm(wanForm: WanForm): void {
    this.isLoading = true;
    if (wanForm.deletedAt) {
      this.wanFormService
        .deleteOneWanForm({
          id: wanForm.id,
        })
        .subscribe(
          () => {
            this.getWanForms();
          },
          () => {
            this.isLoading = false;
          },
          () => {
            this.isLoading = false;
          },
        );
    } else {
      this.wanFormService.softDeleteOneWanForm({ id: wanForm.id }).subscribe(
        () => {
          this.getWanForms();
        },
        () => {
          this.isLoading = false;
        },
        () => {
          this.isLoading = false;
        },
      );
    }
  }

  public restoreWanForm(wanForm: WanForm): void {
    this.isLoading = true;
    this.wanFormService.restoreOneWanForm({ id: wanForm.id }).subscribe(
      () => {
        this.getWanForms();
      },
      () => {
        this.isLoading = false;
      },
      () => {
        this.isLoading = false;
      },
    );
  }

  public getTenants(): void {
    this.tenantService.getManyTenant({}).subscribe(data => {
      this.tenants = data as any;
    });
  }

  public onTenantSelect(tenant: Tenant): void {
    const currentQueryParams = this.route.snapshot.queryParams;
    const queryParams = { ...currentQueryParams, tenantId: tenant.id };
    this.router.navigate(['/appcentric/wan-form'], {
      queryParams,
    });
  }
}
