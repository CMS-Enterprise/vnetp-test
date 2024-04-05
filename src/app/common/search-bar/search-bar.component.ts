import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TableContextService } from 'src/app/services/table-context.service';

export interface SearchColumnConfig {
  propertyName: string;
  displayName: string;
  searchOperator?: string;
  join?: string[];
  // property type is used for populated advanced search drop downs
  // can either be set to 'boolean' for true false drop downs, or passed any enum object
  propertyType?: any;
}

/**
 * Usage:
 *
 * - in component:
 *  public searchColumns: SearchColumnConfig[] = [{ propertyName: 'property-name', displayName: 'display name' }];
 *
 * - in template
 * <app-search-bar
 * [columns]="searchColumns"
 * (searchCriteria)="searchThis($event)"
 * ></app-search-bar>
 */

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
})
export class SearchBarComponent implements OnInit {
  @Input() columns: SearchColumnConfig[];
  @Input() hideDefaultSearch;
  @Output() searchCriteria = new EventEmitter<any>();

  @Output() searchBarClearResults = new EventEmitter<any>();

  public searchText = '';
  public searchColumn: string;
  public filteredResults = false;
  public searchError = false;
  public defaultSearch = { displayName: 'Name', propertyName: 'name' };

  constructor(private tableContextService: TableContextService) {}

  ngOnInit(): void {
    // after a search has occured, technically a new instance of the app-table has been created
    // therefore we must use localStorage to get the previous values for consistency once the new
    // table has been created.

    // currently this results in a page refresh persisting the values, but a page navigation
    // performs accordingly and wipes the search parameters from local storage
    const searchParams = this.tableContextService.getSearchLocalStorage();
    const { searchColumn: previousSearchColumn, searchText: previousSearchText, filteredResults } = searchParams;
    if (filteredResults) {
      this.filteredResults = filteredResults;
    }
    this.searchText = previousSearchText;

    this.searchColumn = previousSearchColumn;

    if (!previousSearchColumn) {
      this.searchColumn = this.defaultSearch.propertyName;
    }
  }

  public searchThis(): void {
    if (!this.searchText) {
      this.searchError = true;
      return;
    }

    if (!this.searchColumn) {
      this.searchError = true;
      return;
    }

    this.tableContextService.addSearchLocalStorage(JSON.stringify(this.searchColumn), JSON.stringify(this.searchText));
    this.tableContextService.addFilteredResultsLocalStorage();

    this.searchError = false;
    this.filteredResults = true;

    this.searchCriteria.emit({ searchColumn: this.searchColumn, searchText: this.searchText });
    this.tableContextService.removeAdvancedSearchLocalStorage();
  }

  public setFilteredResults(): void {
    console.log('hideDefaultSearch', this.hideDefaultSearch);

    this.filteredResults = true;
  }

  // we begin a double emit here, because "clear results" is now on the search bar component,
  // when "clear results" is clicked on the search bar component emits the event to the table component
  // the table component then emits the event further upstream
  public clearFilteredResults(): void {
    this.tableContextService.removeSearchLocalStorage();
    this.tableContextService.removeAdvancedSearchLocalStorage();
    this.filteredResults = false;
    this.searchError = false;
    this.searchBarClearResults.emit();
  }
}
