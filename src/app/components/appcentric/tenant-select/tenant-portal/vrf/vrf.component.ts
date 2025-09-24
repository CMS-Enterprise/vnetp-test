import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  GetManyVrfResponseDto,
  Tenant,
  V2AppCentricTenantsService,
  V2AppCentricVrfsService,
  V3GlobalWanFormRequestService,
  Vrf,
  WanFormRequest,
} from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { AdvancedSearchAdapter } from 'src/app/common/advanced-search/advanced-search.adapter';
import { SearchColumnConfig } from 'src/app/common/search-bar/search-bar.component';
import { TableConfig } from 'src/app/common/table/table.component';
import { VrfModalDto } from 'src/app/models/appcentric/vrf-modal-dto';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { TableContextService } from 'src/app/services/table-context.service';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { RouteDataUtil } from '../../../../../utils/route-data.util';
import { ApplicationMode } from '../../../../../models/other/application-mode-enum';

@Component({
  selector: 'app-vrf',
  templateUrl: './vrf.component.html',
  styleUrls: ['./vrf.component.css'],
})
export class VrfComponent implements OnInit {
  public ModalMode = ModalMode;
  public currentVrfPage = 1;
  public perPage = 20;
  public vrfs = {} as GetManyVrfResponseDto;
  public tableComponentDto = new TableComponentDto();
  public vrfModalSubscription: Subscription;
  public tenantId: string;
  public applicationMode: ApplicationMode;
  public isLoading = false;
  public currentView: 'vrf' | 'subnets' | 'routes' = 'vrf';
  public selectedVrf: Vrf | null = null;
  public expandedRow: Vrf | null = null;
  public tenant: Tenant;
  public wanFormRequest: WanFormRequest;

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

  @ViewChild('expandableRows') expandableRows: TemplateRef<any>;

  public searchColumns: SearchColumnConfig[] = [
    { displayName: 'Alias', propertyName: 'alias', searchOperator: 'cont' },
    { displayName: 'Description', propertyName: 'description', searchOperator: 'cont' },
    { displayName: 'Policy Control Enforced', propertyName: 'policyControlEnforced', propertyType: 'boolean' },
    { displayName: 'Policy Control Enforcement Ingress', propertyName: 'policyControlEnforcementIngress', propertyType: 'boolean' },
  ];

  public config: TableConfig<any> = {
    description: 'Vrfs',
    columns: [
      { name: 'Name', property: 'name' },
      { name: 'Alias', property: 'alias' },
      { name: 'Policy Control Enforced', property: 'policyControlEnforced' },
      { name: 'Policy Control Enforcement Ingress', property: 'policyControlEnforcementIngress' },
      { name: 'Max External Routes', property: 'maxExternalRoutes' },
      { name: 'BGP ASN', property: 'bgpAsn' },
      { name: '', template: () => this.actionsTemplate },
    ],
    expandableRows: () => this.expandableRows,
  };

  constructor(
    private vrfService: V2AppCentricVrfsService,
    private tableContextService: TableContextService,
    private ngx: NgxSmartModalService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private tenantService: V2AppCentricTenantsService,
    private wanFormRequestService: V3GlobalWanFormRequestService,
  ) {
    const advancedSearchAdapter = new AdvancedSearchAdapter<Vrf>();
    advancedSearchAdapter.setService(this.vrfService);
    advancedSearchAdapter.setServiceName('V2AppCentricVrfsService');
    this.config.advancedSearchAdapter = advancedSearchAdapter;

    const match = this.router.routerState.snapshot.url.match(
      /tenant-select\/edit\/[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}/,
    );
    if (match) {
      const uuid = match[0].split('/')[2];
      this.tenantId = uuid;
    }
  }

  ngOnInit(): void {
    this.applicationMode = RouteDataUtil.getApplicationModeFromRoute(this.activatedRoute);
    this.getVrfs();
    this.getTenant();
  }

  public getTenant(): void {
    this.tenantService.getOneTenant({ id: this.tenantId }).subscribe(tenant => {
      this.tenant = tenant;
      if (this.tenant.wanFormStatus === 'PENDING') {
        this.getWanFormRequest();
      }
    });
  }

  public showVrfList(): void {
    this.selectedVrf = null;
    this.currentView = 'vrf';
  }

  public showSubnets(vrf: Vrf): void {
    this.selectedVrf = vrf;
    this.currentView = 'subnets';
  }

  public showRoutes(vrf: Vrf): void {
    this.selectedVrf = vrf;
    this.currentView = 'routes';
  }

  public onTableEvent(event: TableComponentDto): void {
    this.tableComponentDto = event;
    this.getVrfs(event);
  }

  public getVrfs(event?): void {
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

    const relations = this.applicationMode === ApplicationMode.NETCENTRIC ? [] : [];

    this.vrfService
      .getManyVrf({
        filter: [`tenantId||eq||${this.tenantId}`, eventParams],
        page: this.tableComponentDto.page,
        perPage: this.tableComponentDto.perPage,
        relations,
      })
      .subscribe({
        next: data => {
          this.vrfs = data;
        },
        error: () => {
          this.vrfs = null;
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }

  private showConfirmationModal(title: string, message: string, onConfirm: () => void): void {
    const modalDto = new YesNoModalDto(title, message);

    const onConfirmWrapper = () => {
      onConfirm();
    };

    const onClose = () => {
      this.refreshVrfs();
    };

    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirmWrapper, onClose);
  }

  private refreshVrfs(): void {
    const params = this.tableContextService.getSearchLocalStorage();
    const { filteredResults } = params;

    if (filteredResults) {
      this.getVrfs(params);
    } else {
      this.getVrfs();
    }
  }

  public deleteVrf(vrf: Vrf): void {
    const isHardDelete = vrf.deletedAt;
    const title = isHardDelete ? 'Delete VRF' : 'Soft Delete VRF';
    const message = isHardDelete
      ? `Are you sure you want to delete ${vrf.name}? This cannot be undone.`
      : `Are you sure you want to soft delete ${vrf.name}? This can be undone.`;

    const onConfirm = () => {
      const deleteMethod = isHardDelete ? this.vrfService.deleteOneVrf({ id: vrf.id }) : this.vrfService.softDeleteOneVrf({ id: vrf.id });

      deleteMethod.subscribe(() => {
        this.refreshVrfs();
      });
    };

    this.showConfirmationModal(title, message, onConfirm);
  }

  public restoreVrf(vrf: Vrf): void {
    if (!vrf.deletedAt) {
      return;
    }

    const onConfirm = () => {
      this.vrfService.restoreOneVrf({ id: vrf.id }).subscribe(() => {
        this.refreshVrfs();
      });
    };

    this.showConfirmationModal('Restore VRF', `Are you sure you want to restore ${vrf.name}?`, onConfirm);
  }

  public deprovisionVrf(vrf: Vrf): void {
    const onConfirm = () => {
      this.vrfService.deprovisionOneVrf({ id: vrf.id }).subscribe(() => {
        this.refreshVrfs();
      });
    };

    this.showConfirmationModal('Deprovision VRF', `Are you sure you would like to deprovision ${vrf.name}?`, onConfirm);
  }

  public openVrfModal(modalMode: ModalMode, vrf?: Vrf): void {
    const dto = new VrfModalDto();

    dto.ModalMode = modalMode;

    if (modalMode === ModalMode.Edit) {
      dto.vrf = vrf;
    }

    this.subscribeToVrfModal();
    this.ngx.setModalData(dto, 'vrfModal');
    this.ngx.getModal('vrfModal').open();
  }

  public subscribeToVrfModal(): void {
    this.vrfModalSubscription = this.ngx.getModal('vrfModal').onCloseFinished.subscribe(() => {
      this.ngx.resetModalData('vrfModal');
      this.vrfModalSubscription.unsubscribe();
      // get search params from local storage
      const params = this.tableContextService.getSearchLocalStorage();
      const { filteredResults } = params;

      // if filtered results boolean is true, apply search params in the
      // subsequent get call
      if (filteredResults) {
        this.getVrfs(params);
      } else {
        this.getVrfs();
      }
    });
  }

  sanitizeData(entities: any) {
    return entities.map(entity => {
      this.mapToCsv(entity);
      return entity;
    });
  }

  mapToCsv = obj => {
    Object.entries(obj).forEach(([key, val]) => {
      if (val === 'false' || val === 'f') {
        obj[key] = false;
      }
      if (val === 'true' || val === 't') {
        obj[key] = true;
      }
      if (val === null || val === '') {
        delete obj[key];
      }
      if (key === 'ipAddress' && val !== '') {
        obj[key] = String(val).trim();
      }
      if (key === 'tenantName') {
        obj.tenantId = this.tenantId;
        delete obj[key];
      }
    });
    return obj;
  };

  public importVrfs(event): void {
    const onConfirm = () => {
      const dto = this.sanitizeData(event);
      this.vrfService.createManyVrf({ createManyVrfDto: { bulk: dto } }).subscribe({
        complete: () => {
          this.refreshVrfs();
        },
      });
    };

    this.showConfirmationModal(
      'Import VRFs',
      `Are you sure you would like to import ${event.length} VRF${event.length > 1 ? 's' : ''}?`,
      onConfirm,
    );
  }

  public createWanFormRequest(): void {
    const message =
      'This action will submit your route changes for approval. ' +
      'Once submitted, you will not be able to make further changes until the request is approved, rejected, or cancelled. ' +
      'Are you sure you want to proceed?';
    const title = 'Request Deployment of Route Changes';
    const onConfirm = () => {
      this.wanFormRequestService
        .createOneWanFormRequest({
          wanFormRequestDto: {
            tenantId: this.tenantId,
            organization: 'test',
          },
        })
        .subscribe({
          next: () => {
            this.getTenant();
            this.refreshVrfs();
          },
        });
    };

    this.showConfirmationModal(title, message, onConfirm);
  }

  public getWanFormRequest(): void {
    this.wanFormRequestService
      .getManyWanFormRequests({ filter: [`tenantId||eq||${this.tenantId}`, 'status||eq||PENDING'] })
      .subscribe(wanFormRequests => {
        this.wanFormRequest = wanFormRequests[0];
      });
  }

  public cancelWanFormRequest(): void {
    const title = 'Cancel Route Change Request';
    const message =
      'This action will cancel your pending route change request and restart the approval process. ' +
      'This cannot be undone. Are you sure you want to proceed?';
    const onConfirm = () => {
      this.wanFormRequestService.deleteOneWanFormRequest({ wanFormRequestId: this.wanFormRequest.id }).subscribe({
        next: () => {
          this.getTenant();
          this.refreshVrfs();
        },
      });
    };
    this.showConfirmationModal(title, message, onConfirm);
  }
}
