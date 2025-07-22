import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import {
  GetManyWanFormRequestResponseDto,
  V1NetworkScopeFormsWanFormService,
  V3GlobalWanFormRequestService,
  WanForm,
  WanFormRequest,
} from '../../../../../client';
import { TableComponentDto } from '../../../models/other/table-component-dto';
import { TableConfig } from '../../../common/table/table.component';
import { SearchColumnConfig } from '../../../common/search-bar/search-bar.component';
import { TenantStateService } from '../../../services/tenant-state.service';
import SubscriptionUtil from '../../../utils/SubscriptionUtil';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { YesNoModalDto } from '../../../models/other/yes-no-modal-dto';

type WanFormRequestTableData = {
  wanFormId: string;
  tenant: string;
  createdAt: string;
  wanFormName: string;
  aciTenant?: string;
  datacenter?: string;
  wanForm: WanForm;
};

interface WanFormRequestTableDto extends GetManyWanFormRequestResponseDto {
  data: Array<WanFormRequestTableData>;
}

@Component({
  selector: 'app-wan-form-request',
  templateUrl: './wan-form-request.component.html',
  styleUrl: './wan-form-request.component.css',
})
export class WanFormRequestComponent implements OnInit {
  public wanFormRequests: GetManyWanFormRequestResponseDto;
  public perPage = 20;
  public tableComponentDto = new TableComponentDto();
  public wanFormRequestTableDto: WanFormRequestTableDto;

  @ViewChild('expandedRows') expandedRows: TemplateRef<any>;

  public config: TableConfig<any> = {
    description: 'Wan Forms',
    columns: [
      { name: 'Wan Form', property: 'wanFormName' },
      { name: 'Tenant', property: 'tenant' },
      { name: 'Created At', property: 'createdAt' },
      { name: 'ACI Tenant', property: 'aciTenant' },
      { name: 'Datacenter', property: 'datacenter' },
      // {
      //   name: '',
      //   template: (rowData: WanFormRequestTableData) => {
      //     return {
      //       approve: () => this.approveWanFormRequest(rowData.wanFormId),
      //     };
      //   },
      // },
    ],
    expandableRows: () => this.expandedRows,
    hideAdvancedSearch: true,
  };

  public searchColumns: SearchColumnConfig[] = [
    { displayName: 'Created At', propertyName: 'createdAt' },
    { displayName: 'Tenant', propertyName: 'tenant' },
  ];

  constructor(
    private wanFormRequestService: V3GlobalWanFormRequestService,
    private tenantStateService: TenantStateService,
    private wanFormService: V1NetworkScopeFormsWanFormService,
    private ngx: NgxSmartModalService,
  ) {}

  ngOnInit(): void {
    this.getAllWanFormRequests();
  }

  public getAllWanFormRequests(event?): void {
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

    this.wanFormRequestService
      .getManyWanFormRequests({
        filter: [eventParams, 'status||eq||PENDING'],
        page: this.tableComponentDto.page,
        perPage: this.tableComponentDto.perPage,
      })
      .subscribe(response => {
        this.wanFormRequests = response;
        this.createWanFormTableDto();
      });
  }

  public createWanFormTableDto(): void {
    this.wanFormRequests.data.forEach(wanFormRequest => {
      this.setWanForm(wanFormRequest.wanFormId, wanFormRequest);
    });
    this.tenantStateService.clearTenant();
  }

  public approveWanFormRequest(id: string): void {
    const dto = new YesNoModalDto(
      'Approve Wan Form Request',
      'Are you sure you want to approve this WAN Form Request? It will immediately be applied to aci.',
    );
    const onConfirm = () => {
      this.wanFormRequestService.approveOneWanFormRequest({ id }).subscribe({
        next: () => this.getAllWanFormRequests(),
      });
    };

    const onClose = () => {
      this.getAllWanFormRequests();
    };

    SubscriptionUtil.subscribeToYesNoModal(dto, this.ngx, onConfirm, onClose);
  }

  public rejectWanFormRequest(id: string): void {
    const dto = new YesNoModalDto(
      'Reject Wan Form Request',
      'Are you sure you want to reject this WAN Form Request? It will be removed from the list.',
    );
    const onConfirm = () => {
      this.wanFormRequestService.rejectOneWanFormRequest({ id }).subscribe({
        next: () => this.getAllWanFormRequests(),
      });
    };

    const onClose = () => {
      this.getAllWanFormRequests();
    };

    SubscriptionUtil.subscribeToYesNoModal(dto, this.ngx, onConfirm, onClose);
  }

  public setWanForm(wanFormId: string, wanFormRequest: WanFormRequest): void {
    this.tenantStateService.setTenant(wanFormRequest.tenant);
    this.wanFormService.getOneWanForm({ id: wanFormId, join: ['internalRoutes', 'externalRoutes', 'tenant', 'datacenter'] }).subscribe({
      next: response => {
        const wanFormRequestData: WanFormRequestTableData = {
          wanFormId: response.id,
          tenant: wanFormRequest.tenant,
          createdAt: wanFormRequest.createdAt,
          wanFormName: response.name,
          aciTenant: response.tenant?.name,
          datacenter: response.datacenter?.name,
          wanForm: response,
        };

        this.wanFormRequestTableDto = {
          ...this.wanFormRequests,
          data: this.wanFormRequestTableDto?.data ? this.wanFormRequestTableDto.data : [],
        };

        this.wanFormRequestTableDto.data.push(wanFormRequestData);
      },
    });
  }

  public onTableEvent(event: TableComponentDto): void {
    this.tableComponentDto = event;
    this.getAllWanFormRequests(event);
  }
}
