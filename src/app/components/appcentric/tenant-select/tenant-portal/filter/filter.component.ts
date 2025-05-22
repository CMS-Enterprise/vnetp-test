import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Filter, GetManyFilterResponseDto, V2AppCentricFiltersService, V2AppCentricTenantsService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { AdvancedSearchAdapter } from 'src/app/common/advanced-search/advanced-search.adapter';
import { SearchColumnConfig } from 'src/app/common/search-bar/search-bar.component';
import { TableConfig } from 'src/app/common/table/table.component';
import { FilterModalDto } from 'src/app/models/appcentric/filter-modal-dto';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { TableContextService } from 'src/app/services/table-context.service';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css'],
})
export class FilterComponent implements OnInit {
  public ModalMode = ModalMode;
  public currentFilterPage = 1;
  public perPage = 20;
  public filters = {} as GetManyFilterResponseDto;
  public tableComponentDto = new TableComponentDto();
  public filterModalSubscription: Subscription;
  public tenantId: string;
  public tenantName: string;

  public isLoading = false;

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

  public searchColumns: SearchColumnConfig[] = [
    { displayName: 'Alias', propertyName: 'alias', searchOperator: 'cont' },
    { displayName: 'Description', propertyName: 'description', searchOperator: 'cont' },
  ];

  public config: TableConfig<any> = {
    description: 'Filters',
    columns: [
      { name: 'Name', property: 'name' },
      { name: 'Alias', property: 'alias' },
      { name: 'Description', property: 'description' },
      { name: '', template: () => this.actionsTemplate },
    ],
  };

  constructor(
    private filterService: V2AppCentricFiltersService,
    private tableContextService: TableContextService,
    private ngx: NgxSmartModalService,
    private router: Router,
    private tenantService: V2AppCentricTenantsService,
  ) {
    const advancedSearchAdapter = new AdvancedSearchAdapter<Filter>();
    advancedSearchAdapter.setService(this.filterService);
    advancedSearchAdapter.setServiceName('V2AppCentricFiltersService');
    this.config.advancedSearchAdapter = advancedSearchAdapter;

    const match = this.router.routerState.snapshot.url.match(
      /tenant-select\/edit\/[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}/,
    );
    if (match) {
      const uuid = match[0].split('/')[2];
      this.tenantId = uuid;
      this.tenantService.getManyTenant({ page: 1, perPage: 10000 }).subscribe(data => {
        this.tenantName = ObjectUtil.getObjectName(this.tenantId, data.data);
      });
    }
  }

  ngOnInit(): void {
    this.getFilters();
  }

  public onTableEvent(event: TableComponentDto): void {
    this.tableComponentDto = event;
    this.getFilters(event);
  }

  public getFilters(event?): void {
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
    this.filterService
      .getManyFilter({
        filter: [`tenantId||eq||${this.tenantId}`, eventParams],
        page: this.tableComponentDto.page,
        perPage: this.tableComponentDto.perPage,
      })
      .subscribe(
        data => {
          this.filters = data;
        },
        () => {
          this.filters = null;
        },
        () => {
          this.isLoading = false;
        },
      );
  }

  public deleteFilter(filter: Filter): void {
    if (filter.deletedAt) {
      this.filterService.deleteOneFilter({ id: filter.id }).subscribe(() => {
        const params = this.tableContextService.getSearchLocalStorage();
        const { filteredResults } = params;

        // if filtered results boolean is true, apply search params in the
        // subsequent get call
        if (filteredResults) {
          this.getFilters(params);
        } else {
          this.getFilters();
        }
      });
    } else {
      this.filterService
        .softDeleteOneFilter({
          id: filter.id,
        })
        .subscribe(() => {
          const params = this.tableContextService.getSearchLocalStorage();
          const { filteredResults } = params;

          // if filtered results boolean is true, apply search params in the
          // subsequent get call
          if (filteredResults) {
            this.getFilters(params);
          } else {
            this.getFilters();
          }
        });
    }
  }

  public restoreFilter(filter: Filter): void {
    if (!filter.deletedAt) {
      return;
    }

    this.filterService
      .restoreOneFilter({
        id: filter.id,
      })
      .subscribe(() => {
        const params = this.tableContextService.getSearchLocalStorage();
        const { filteredResults } = params;

        // if filtered results boolean is true, apply search params in the
        // subsequent get call
        if (filteredResults) {
          this.getFilters(params);
        } else {
          this.getFilters();
        }
      });
  }

  public openFilterModal(modalMode: ModalMode, filter?: Filter): void {
    const dto = new FilterModalDto();

    dto.modalMode = modalMode;

    if (modalMode === ModalMode.Edit) {
      dto.filter = filter;
    }

    this.subscribeToFilterModal();
    this.ngx.setModalData(dto, 'filterModal');
    this.ngx.getModal('filterModal').open();
  }

  public subscribeToFilterModal(): void {
    this.filterModalSubscription = this.ngx.getModal('filterModal').onCloseFinished.subscribe(() => {
      this.ngx.resetModalData('filterModal');
      this.filterModalSubscription.unsubscribe();
      // get search params from local storage
      const params = this.tableContextService.getSearchLocalStorage();
      const { filteredResults } = params;

      // if filtered results boolean is true, apply search params in the
      // subsequent get call
      if (filteredResults) {
        this.getFilters(params);
      } else {
        this.getFilters();
      }
    });
  }

  public sanitizeData(entities) {
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
      if (key === 'tenantName') {
        obj.tenantId = this.tenantId;
        delete obj[key];
      }
    });
    return obj;
  };

  private warnDuringUpload(e, event) {
    const warningModal = new YesNoModalDto(
      'WARNING',
      `One or more entries' Tenant value does not match the Tenant that is currently selected, 
           we will attempt to assign the currently selected Tenant to any 
           incorrect entries, this may cause failures in the bulk upload, would you still like to proceed?
              "${e.tenantName}" vs "${this.tenantName}"`,
    );
    // const onConfirm = () => {
    //   const dto = this.sanitizeData(event);
    //   this.uploadAppProfiles(dto);
    // };
    const onClose = () => this.getFilters();
    SubscriptionUtil.subscribeToYesNoModal(warningModal, this.ngx, onClose);
  }

  private uploadFilters(dto) {
    this.filterService.createManyFilter({ createManyFilterDto: { bulk: dto } }).subscribe(
      () => {},
      () => {},
      () => {
        this.getFilters();
      },
    );
  }

  public importFilters(event): void {
    const modalDto = new YesNoModalDto(
      'Import Filters',
      `Are you sure you would like to import ${event.length} Filter${event.length > 1 ? 's' : ''}?`,
    );

    event.map(e => {
      if (e.tenantName !== this.tenantName) {
        return this.warnDuringUpload(e, event);
      }
    });
    const onConfirm = () => {
      const dto = this.sanitizeData(event);
      this.filterService.createManyFilter({ createManyFilterDto: { bulk: dto } }).subscribe(
        () => {},
        () => {},
        () => {
          this.getFilters();
        },
      );
    };

    const onClose = () => {
      this.getFilters();
    };

    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm, onClose);
  }
}
