import { Component, Input, OnInit } from '@angular/core';
import { Filter, FilterPaginationResponse, V2AppCentricFiltersService, V2AppCentricSubjectsService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { SearchColumnConfig } from 'src/app/common/search-bar/search-bar.component';
import { TableConfig } from 'src/app/common/table/table.component';
import { SubjectModalDto } from 'src/app/models/appcentric/subject-modal-dto';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';

@Component({
  selector: 'app-add-filter-modal',
  templateUrl: './add-filter-modal.component.html',
  styleUrls: ['./add-filter-modal.component.css'],
})
export class AddFilterModalComponent implements OnInit {
  public isLoading = false;
  public tableComponentDto = new TableComponentDto();
  @Input() tenantId: string;
  public filters: Filter[];
  public selectedFilter: Filter;
  public subjectId: string;
  public filterTableData: FilterPaginationResponse;
  public perPage = 5;

  public searchColumns: SearchColumnConfig[] = [];

  public config: TableConfig<any> = {
    description: 'Filters',
    columns: [
      { name: 'Name', property: 'name' },
      { name: 'Alias', property: 'alias' },
      { name: 'Description', property: 'description' },
    ],
  };

  constructor(
    private filterService: V2AppCentricFiltersService,
    private subjectService: V2AppCentricSubjectsService,
    private ngx: NgxSmartModalService,
  ) {}

  ngOnInit(): void {
    this.getFilters();
  }

  public onTableEvent(event: TableComponentDto): void {
    this.tableComponentDto = event;
    this.getFiltertableData(event);
  }

  public getData(): void {
    const dto = Object.assign({}, this.ngx.getModalData('addFilterModal') as SubjectModalDto);

    this.subjectId = dto.subject.id;

    this.ngx.resetModalData('addFilterModal');
    this.getFiltertableData;
  }

  public closeModal(): void {
    this.ngx.close('addFilterModal');
    this.reset();
  }

  public reset(): void {
    this.ngx.resetModalData('addFilterModal');
  }

  public getFilters(): void {
    this.isLoading = true;
    this.filterService
      .findAllFilter({
        filter: [`tenantId||eq||${this.tenantId}`],
        page: this.tableComponentDto.page,
        perPage: this.tableComponentDto.perPage,
      })
      .subscribe(
        data => {
          this.filters = data.data;
        },
        () => {
          this.filters = null;
        },
        () => {
          this.isLoading = false;
        },
      );
  }

  public getFiltertableData(event?) {
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
    this.subjectService
      .findOneSubject({
        uuid: this.subjectId,
        relations: 'filters',
      })
      .subscribe(
        data => {
          let filterPagResponse = {} as FilterPaginationResponse;
          filterPagResponse.count = data.filters.length;
          filterPagResponse.page = 1;
          filterPagResponse.pageCount = 1;
          filterPagResponse.total = data.filters.length;
          filterPagResponse.data = data.filters;
          this.filterTableData = filterPagResponse;
        },
        () => {
          this.filters = null;
        },
        () => {
          this.isLoading = false;
        },
      );
  }

  public addFilter() {
    this.isLoading = true;
    this.subjectService
      .addFilterToSubjectSubject({
        filterId: this.selectedFilter.id,
        subjectId: this.subjectId,
      })
      .subscribe(
        () => {},
        () => {},
        () => {
          this.isLoading = false;
          this.getFiltertableData();
        },
      );
  }
}
