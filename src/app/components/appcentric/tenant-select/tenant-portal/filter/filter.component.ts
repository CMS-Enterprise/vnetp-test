import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Filter, FilterPaginationResponse, V2AppCentricFiltersService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { SearchColumnConfig } from 'src/app/common/search-bar/search-bar.component';
import { TableConfig } from 'src/app/common/table/table.component';
import { FilterModalDto } from 'src/app/models/appcentric/filter-modal-dto';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { TableContextService } from 'src/app/services/table-context.service';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css'],
})
export class FilterComponent implements OnInit {
  public ModalMode = ModalMode;
  public currentFilterPage = 1;
  public perPage = 20;
  public filters = {} as FilterPaginationResponse;
  public tableComponentDto = new TableComponentDto();
  private filterModalSubscription: Subscription;
  private filterEntryModalSubscription: Subscription;
  public tenantId: String;

  public isLoading = false;

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

  public searchColumns: SearchColumnConfig[] = [];

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
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const match = event.url.match(/\/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})\//);
        if (match) this.tenantId = match[1];
      }
    });
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
      .findAllFilter({
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
      this.filterService.removeFilter({ uuid: filter.id }).subscribe(() => {
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
        .updateFilter({
          uuid: filter.id,
          filter: { deleted: true } as Filter,
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
      .updateFilter({
        uuid: filter.id,
        filter: { deleted: false } as Filter,
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

  private subscribeToFilterModal(): void {
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

  public openFilterEntryModal(filter: Filter): void {
    const dto = new FilterModalDto();
    dto.modalMode = ModalMode.Edit;
    dto.filter = filter;

    this.subscribeToFilterEntryModal();
    this.ngx.setModalData(dto, 'filterEntryModal');
    this.ngx.getModal('filterEntryModal').open();
  }

  private subscribeToFilterEntryModal(): void {
    this.filterEntryModalSubscription = this.ngx.getModal('filterEntryModal').onCloseFinished.subscribe(() => {
      this.ngx.resetModalData('filterEntryModal');
      this.filterEntryModalSubscription.unsubscribe();
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

  public importFiltersConfig(filter: Filter[]): void {
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
}
