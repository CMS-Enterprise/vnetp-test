import { SearchColumnConfig } from '../seach-bar/search-bar.component';
import { Component, TemplateRef, Input, AfterViewInit, ChangeDetectorRef, Output, EventEmitter, AfterContentInit } from '@angular/core';
import { TableComponentDto } from '../../models/other/table-component-dto';
import { TableContextService } from 'src/app/services/table-context.service';
import { SearchBarHelpText } from 'src/app/helptext/help-text-networking';

export interface TableColumn<T> {
  name: string;
  property?: keyof T;
  template?: () => TemplateRef<any>;
}
export interface TableConfig<T> {
  description: string;
  columns: TableColumn<T>[];
  rowStyle?: (datum: object) => Partial<CSSStyleDeclaration>;
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

  public searchText = '';

  public currentPage = 1;
  public show = false;
  public uniqueTableId: string;

  public showSearchBar = true;
  public paginationControlsOn = true;

  constructor(private changeRef: ChangeDetectorRef, private tableContextService: TableContextService, public helpText: SearchBarHelpText) {}

  ngAfterViewInit(): void {
    this.show = true;
    this.uniqueTableId = this.config.description.toLowerCase().replace(/ /gm, '-');
    // list of components that should have the search bar hidden when a user navigates to them
    const badList = [
      'managed-network',
      'selected-objects',
      'import-preview',
      'pools-in-the-currently-selected-tier',
      'static-routes-listed-by-tier',
      'static-routes-for-the-currently-selected-tier',
      'audit-log',
      'detailed-audit-log-entry',
      'self-services',
    ];

    const hidePagination = ['import-preview', 'detailed-audit-log-entry'];

    // if tableId is a badList ID, we hide the search bar
    if (badList.includes(this.uniqueTableId)) {
      this.showSearchBar = false;
    }

    if (hidePagination.includes(this.uniqueTableId)) {
      this.paginationControlsOn = false;
    }

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
    this.itemsPerPage = 50;
    this.currentPage = 1;
    this.clearResults.emit(new TableComponentDto(+this.itemsPerPage, this.currentPage));
  }

  // when a user interacts with the pagination controls this function is invoked
  // we get the searchParams from localStorage and emit the pagination & search params
  onTableEvent(): void {
    const searchParams = this.tableContextService.getSearchLocalStorage();
    this.tableContextService.addFilteredResultsLocalStorage();
    const { searchColumn, searchText } = searchParams;
    this.tableEvent.emit(new TableComponentDto(+this.itemsPerPage, this.currentPage, searchColumn, searchText));
    this.itemsPerPageChange.emit(this.itemsPerPage);
  }
}
