import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import {
  FilterEntryPaginationResponse,
  FilterEntry,
  Filter,
  V2AppCentricFilterEntriesService,
  FilterEntryEtherTypeEnum,
  FilterEntryArpFlagEnum,
  FilterEntryIpProtocolEnum,
  FilterEntryTcpFlagsEnum,
  V2AppCentricFiltersService,
} from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { SearchColumnConfig } from 'src/app/common/search-bar/search-bar.component';
import { TableConfig } from 'src/app/common/table/table.component';
import { FilterModalDto } from 'src/app/models/appcentric/filter-modal-dto';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { TableContextService } from 'src/app/services/table-context.service';
import { NameValidator } from 'src/app/validators/name-validator';
import { FilterEntryModalDto } from '../../../../../../models/appcentric/filter-entry-modal.dto';

@Component({
  selector: 'app-filter-modal',
  templateUrl: './filter-modal.component.html',
  styleUrls: ['./filter-modal.component.css'],
})
export class FilterModalComponent implements OnInit {
  public ModalMode = ModalMode;
  public isLoading = false;
  public modalMode: ModalMode;
  public form: FormGroup;
  public submitted: boolean;
  public tenantId: string;
  public filterId: string;
  public filterEntries: FilterEntryPaginationResponse;
  public tableComponentDto = new TableComponentDto();
  public perPage = 20;

  public etherTypeOptions = Object.keys(FilterEntryEtherTypeEnum);
  public arpFlagOptions = Object.keys(FilterEntryArpFlagEnum);
  public ipProtocolOptions = Object.keys(FilterEntryIpProtocolEnum);
  public tcpFlagsOptions = Object.keys(FilterEntryTcpFlagsEnum).map(key => ({ value: key, label: key }));

  public filter: Filter;

  private filterEntryEditModalSubscription: Subscription;

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

  public searchColumns: SearchColumnConfig[] = [];

  public config: TableConfig<any> = {
    description: 'FilterEntries',
    columns: [
      { name: 'Name', property: 'name' },
      { name: 'Alias', property: 'alias' },
      { name: 'Description', property: 'description' },
      { name: '', template: () => this.actionsTemplate },
    ],
  };

  constructor(
    private formBuilder: FormBuilder,
    private ngx: NgxSmartModalService,
    private filterService: V2AppCentricFiltersService,
    private filterEntriesService: V2AppCentricFilterEntriesService,
    private router: Router,
    private tableContextService: TableContextService,
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const match = event.url.match(/\/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})\//);
        if (match) {
          this.tenantId = match[1];
        }
      }
    });
  }

  ngOnInit(): void {
    this.buildForm();
  }

  public onTableEvent(event: TableComponentDto): void {
    this.tableComponentDto = event;
    this.getFilterEntries(event);
  }

  get f() {
    return this.form.controls;
  }

  public closeModal(): void {
    this.ngx.close('filterModal');
    this.reset();
  }

  public getData(): void {
    const dto = Object.assign({}, this.ngx.getModalData('filterModal') as FilterModalDto);

    this.modalMode = dto.modalMode;

    if (this.modalMode === ModalMode.Edit) {
      this.filterId = dto.filter.id;
      this.form.controls.name.disable();
      this.getFilterEntries();
    }

    const filter = dto?.filter;

    if (filter !== undefined) {
      this.form.controls.name.setValue(filter.name);
      this.form.controls.description.setValue(filter.description);
      this.form.controls.alias.setValue(filter.alias);
    }
    this.ngx.resetModalData('filterModal');
  }

  public reset(): void {
    this.submitted = false;
    this.ngx.resetModalData('filterModal');
    this.buildForm();
  }

  public getFilterEntries(event?): void {
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
    this.filterEntriesService
      .findAllFilterEntry({
        filter: [`filterId||eq||${this.filterId}`, eventParams],
      })
      .subscribe(
        data => (this.filterEntries = data),
        () => (this.filterEntries = null),
      );
  }

  public removeFilterEntry(filterEntry: FilterEntry) {
    if (filterEntry.deletedAt) {
      this.filterEntriesService
        .removeFilterEntry({
          uuid: filterEntry.id,
        })
        .subscribe(() => {
          const params = this.tableContextService.getSearchLocalStorage();
          const { filteredResults } = params;
          if (filteredResults) {
            this.getFilterEntries(params);
          } else {
            this.getFilterEntries();
          }
        });
    } else {
      this.filterEntriesService
        .updateFilterEntry({
          uuid: filterEntry.id,
          filterEntry: { deleted: true } as FilterEntry,
        })
        .subscribe(() => {
          const params = this.tableContextService.getSearchLocalStorage();
          const { filteredResults } = params;
          if (filteredResults) {
            this.getFilterEntries(params);
          } else {
            this.getFilterEntries();
          }
        });
    }
  }

  public restoreFilterEntry(filterEntry: FilterEntry): void {
    if (!filterEntry.deletedAt) {
      return;
    }

    this.filterEntriesService
      .updateFilterEntry({
        uuid: filterEntry.id,
        filterEntry: { deleted: false } as FilterEntry,
      })
      .subscribe(() => {
        const params = this.tableContextService.getSearchLocalStorage();
        const { filteredResults } = params;

        // if filtered results boolean is true, apply search params in the
        // subsequent get call
        if (filteredResults) {
          this.getFilterEntries(params);
        } else {
          this.getFilterEntries();
        }
      });
  }

  public openFilterEntryModal(modalMode: ModalMode, filterEntry?: FilterEntry): void {
    const dto = new FilterEntryModalDto();
    dto.modalMode = modalMode;
    dto.filterId = this.filterId;

    if (modalMode === ModalMode.Edit) {
      dto.filterEntry = filterEntry;
    }

    this.subscribeToFilterEntryModal();
    this.ngx.setModalData(dto, 'filterEntryModal');
    this.ngx.getModal('filterEntryModal').open();
  }

  private subscribeToFilterEntryModal(): void {
    this.filterEntryEditModalSubscription = this.ngx.getModal('filterEntryModal').onCloseFinished.subscribe(() => {
      this.ngx.resetModalData('filterEntryModal');
      this.filterEntryEditModalSubscription.unsubscribe();
      // get search params from local storage
      const params = this.tableContextService.getSearchLocalStorage();
      const { filteredResults } = params;

      // if filtered results boolean is true, apply search params in the
      // subsequent get call
      if (filteredResults) {
        this.getFilterEntries(params);
      } else {
        this.getFilterEntries();
      }
    });
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      name: ['', NameValidator()],
      alias: ['', Validators.compose([Validators.maxLength(100)])],
      description: ['', Validators.compose([Validators.maxLength(500)])],
    });
  }

  private createFilter(filter: Filter): void {
    this.filterService.createFilter({ filter }).subscribe(
      () => {
        this.closeModal();
      },
      () => {},
    );
  }

  private editFilter(filter: Filter): void {
    filter.name = null;
    this.filterService
      .updateFilter({
        uuid: this.filterId,
        filter,
      })
      .subscribe(
        () => {
          this.closeModal();
        },
        () => {},
      );
  }

  public save(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const { name, description, alias } = this.form.value;
    const tenantId = this.tenantId;
    const filter = {
      name,
      description,
      alias,
      tenantId,
    } as Filter;

    if (this.modalMode === ModalMode.Create) {
      this.createFilter(filter);
    } else {
      delete filter.tenantId;
      delete filter.name;
      this.editFilter(filter);
    }
  }
}
