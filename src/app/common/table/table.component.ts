import { SearchBarComponent, SearchColumnConfig } from '../search-bar/search-bar.component';
import { Component, TemplateRef, Input, AfterViewInit, ChangeDetectorRef, Output, EventEmitter, ViewChild } from '@angular/core';
import { TableComponentDto } from '../../models/other/table-component-dto';
import { TableContextService } from 'src/app/services/table-context.service';
import { SearchBarHelpText } from 'src/app/helptext/help-text-networking';
import { Subject, Subscription } from 'rxjs';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { AdvancedSearchAdapter } from '../advanced-search/advanced-search.adapter';
import { AdvancedSearchComponent } from '../advanced-search/advanced-search-modal.component';

export interface TableColumn<T> {
  name: string;
  property?: keyof T;
  template?: () => TemplateRef<any>;
  value?: (datum: T) => any;
}
export interface TableConfig<T> {
  description: string;
  columns: TableColumn<T>[];
  rowStyle?: (datum: object) => Partial<CSSStyleDeclaration>;
  advancedSearchAdapter?: AdvancedSearchAdapter<T>;
  hideAdvancedSearch?: boolean;
  hideSearchBar?: boolean;
  expandableRows?: (() => TemplateRef<any>[]) | (() => TemplateRef<any>);
}

/**
 * Usage:
 *
 * - in component:
 *  @ViewChild('nameTemplate') nameTemplate: TemplateRef<any>;
 *
 *  public config: TableConfig = {
 *     description: 'Table',
 *     columns: [{ name: 'Name', template: () => this.nameTemplate }, { name: 'Desc', property: 'description' }],
 *     rowStyle: (data: object) => ({ background: 'red' }),
 *  };
 *  public data = [{ name: 'Test', description: 'my-desc' }];
 *
 * - in template
 * <app-table [config]="config" [data]="objects" (clearResults)="getObjects($event)" (searchParams)="getObjects($event)"
 * [searchColumns]="searchColumns" [(itemsPerPage)]="perPage" (tableEvent)="onTableEvent($event)"></app-table>
 *
 * <ng-container *ngTemplateOutlet="nameTemplate; context: { datum: datum }"></ng-container>
 * <ng-template #nameTemplate let-datum="datum">{{ datum.name }}</ng-template>
 */
@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent<T> implements AfterViewInit {
  @Input() config: TableConfig<T>;
  @Input() data: { data: any[]; count: number; total: number; page: number; pageCount: number };
  @Input() itemsPerPage;
  @Output() tableEvent = new EventEmitter<any>();
  @Output() itemsPerPageChange = new EventEmitter<any>();

  @Input() searchColumns: SearchColumnConfig[];
  @Output() clearResults = new EventEmitter<any>();
  @Output() searchParams = new EventEmitter<any>();

  @ViewChild(SearchBarComponent) searchBarComponent!: SearchBarComponent;
  @ViewChild(AdvancedSearchComponent) advancedSearchComponent!: AdvancedSearchComponent<any>;

  advancedSearchSubscription: Subscription;

  public searchText = '';

  public currentPage = 1;
  public show = false;
  public hasSearchResults = false;
  public uniqueTableId: string;

  public showSearchBar = true;
  public paginationControlsOn = true;

  public advancedSearchAdapterSubject: Subject<any> = new Subject<any>();

  public expandableRows: boolean;

  constructor(
    private changeRef: ChangeDetectorRef,
    private tableContextService: TableContextService,
    public helpText: SearchBarHelpText,
    private ngx: NgxSmartModalService,
  ) {}

  ngAfterViewInit(): void {
    if (this.config?.advancedSearchAdapter) {
      const advancedSearchAdapter = this.config.advancedSearchAdapter;
      this.advancedSearchAdapterSubject.next(advancedSearchAdapter);
    }
    const searchParams = this.tableContextService.getSearchLocalStorage();
    const advancedSearchParams = this.tableContextService.getAdvancedSearchLocalStorage();
    if (searchParams.searchText || advancedSearchParams) {
      this.hasSearchResults = true;
    } else {
      this.hasSearchResults = false;
    }

    this.show = true;
    this.uniqueTableId = this.config.description.toLowerCase().replace(/ /gm, '-');
    // list of components that should have the search bar hidden when a user navigates to them
    const badList = [
      'managed-network',
      'unused-network-objects/groups',
      'unused-service-objects/groups',
      'import-preview',
      'pools-in-the-currently-selected-tier',
      'static-routes-listed-by-tier',
      'static-routes-for-the-currently-selected-tier',
      'audit-log',
      'detailed-audit-log-entry',
      'consumed-contracts',
      'provided-contracts',
      'subnets',
      'subjects',
      'filterentries',
      'self-services',
      'subject-filters',
      'l3out-modal',
      'bd-l3outs',
      'tiers-in-the-currently-selected-datacenter',
      'tenants-and-datacenters',
      'object-usage',
      'tenants',
    ];

    const hidePagination = [
      'import-preview',
      'detailed-audit-log-entry',
      'unused-network-objects/groups',
      'unused-service-objects/groups',
      'bd-l3outs',
      'tenants-and-datacenters',
      'object-usage',
    ];

    // if tableId is a badList ID, we hide the search bar
    if (badList.includes(this.uniqueTableId)) {
      this.showSearchBar = false;
    }

    if (hidePagination.includes(this.uniqueTableId)) {
      this.paginationControlsOn = false;
    }

    this.expandableRows = Boolean(this.config.expandableRows);

    this.changeRef.detectChanges();
  }

  // user has registered search parameters, we take these parameters and emit them forward
  // so the parent component has them for the subsequent "get" call
  public getObjectsAndFilter(searchInformation): void {
    this.searchParams.emit(searchInformation);
  }

  // we do a double emit here, the search bar emits the event to the table component, the table component then resets
  // the itemsPerPage and the currentPage back to its default values, and then emits the event to the parent component,
  // where the appropriate function is called to re-populate the table
  public clearTableResults(): void {
    this.itemsPerPage = 20;
    this.currentPage = 1;
    this.clearResults.emit(new TableComponentDto(+this.itemsPerPage, this.currentPage));
  }

  // when a user interacts with the pagination controls this function is invoked
  // we get the searchParams from localStorage and emit the pagination & search params
  onTableEvent(): void {
    const advancedSearchParams = this.tableContextService.getAdvancedSearchLocalStorage();
    const searchParams = this.tableContextService.getSearchLocalStorage();

    if (searchParams.searchText || advancedSearchParams) {
      this.hasSearchResults = true;
    } else {
      this.hasSearchResults = false;
    }

    if (advancedSearchParams) {
      this.advancedSearchComponent.searchThis(
        this.currentPage,
        this.itemsPerPage,
        advancedSearchParams.searchOperator,
        advancedSearchParams.searchString,
      );
      return;
    }

    this.tableContextService.addFilteredResultsLocalStorage();
    const { searchColumn, searchText } = searchParams;
    this.tableEvent.emit(new TableComponentDto(+this.itemsPerPage, this.currentPage, searchColumn, searchText));
    this.itemsPerPageChange.emit(this.itemsPerPage);
  }

  public setAdvancedSearchData($event): void {
    this.data = $event;
    this.searchBarComponent.setFilteredResults();
    this.hasSearchResults = true;
  }

  subscribeToAdvancedSearch() {
    this.advancedSearchSubscription = this.ngx.getModal('advancedSearch').onCloseFinished.subscribe(() => {
      this.ngx.resetModalData('advancedSearch');
      this.advancedSearchSubscription.unsubscribe();
    });
  }

  /* eslint-disable-next-line */
  openAdvancedSearch(event?) {
    this.subscribeToAdvancedSearch();
    this.ngx.getModal('advancedSearch').open();
  }

  isEventFromButton(event: Event): boolean {
    let targetElement: HTMLElement | null = event.target as HTMLElement;

    while (targetElement) {
      if (targetElement.tagName === 'BUTTON') {
        return true;
      }
      targetElement = targetElement.parentElement;
    }

    return false;
  }

  handleRowClick(event: Event, datum: any): void {
    if (!this.isEventFromButton(event)) {
      if (this.expandableRows) {
        datum.expanded = !datum.expanded;

        if (Array.isArray(this.config.expandableRows())) {
          datum.currentTemplateIndex = 0; // Initialize on first click
        }
      }
    }
  }

  previousTemplate(datum: any): void {
    const templates = this.config.expandableRows();
    if (Array.isArray(templates)) {
      datum.currentTemplateIndex = (datum.currentTemplateIndex - 1 + templates.length) % templates.length;
      this.changeRef.detectChanges(); // Manually trigger change detection
    }
  }

  nextTemplate(datum: any): void {
    const templates = this.config.expandableRows();
    if (Array.isArray(templates)) {
      datum.currentTemplateIndex = (datum.currentTemplateIndex + 1) % templates.length;
      this.changeRef.detectChanges(); // Manually trigger change detection
    }
  }

  isTemplateArray(): boolean {
    const templates = this.config.expandableRows?.();
    return Array.isArray(templates);
  }
}
