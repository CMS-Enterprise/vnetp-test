import { SearchColumnConfig } from '../search-bar/search-bar.component';
import { Component, TemplateRef, Input, AfterViewInit, ChangeDetectorRef, Output, EventEmitter, AfterContentInit } from '@angular/core';
import { TableComponentDto } from '../../models/other/table-component-dto';
import { TableContextService } from 'src/app/services/table-context.service';
import { SearchBarHelpText } from 'src/app/helptext/help-text-networking';
import { Subscription } from 'rxjs';
import { NgxSmartModalService } from 'ngx-smart-modal';

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
  advancedSearchSubscription: Subscription;

  public searchText = '';

  public currentPage = 1;
  public show = false;
  public uniqueTableId: string;

  public showSearchBar = true;
  public paginationControlsOn = true;

  private objectDictionary = [
    { formName: 'IpAddress', propertyName: 'ipAddress', operator: '$eq' },
    { formName: 'FQDN', propertyName: 'fqdn', operator: '$cont' },
    { formName: 'Start IP', propertyName: 'startIpAddress', operator: '$eq' },
    { formName: 'End IP', propertyName: 'endIpAddress', operator: '$eq' },
    { formName: 'Type', propertyName: 'protocol', operator: '$eq' },
    { formName: 'Source Port', propertyName: 'sourcePorts', operator: '$cont' },
    { formName: 'Destination Port', propertyName: 'destinationPorts', operator: '$cont' },
    { formName: 'Vlan', propertyName: 'vlan.name', operator: '$cont' },
    { formName: 'Network', propertyName: 'network', operator: '$eq' },
    { formName: 'Gateway', propertyName: 'gateway', operator: '$eq' },
    { formName: 'Vlan Number', propertyName: 'vlanNumber', operator: '$eq' },
    { formName: 'VCD/Vlan Type', propertyName: 'vcdVlanType', operator: '$eq' },
    { formName: 'Direction', propertyName: 'direction', operator: '$eq' },
    { formName: 'Protocol', propertyName: 'protocol', operator: '$eq' },
    { formName: 'Enabled', propertyName: 'enabled', operator: '$eq' },
    { formName: 'Source Address', propertyName: 'sourceIpAddress', operator: '$eq' },
    { formName: 'Destination Address', propertyName: 'destinationIpAddress', operator: '$eq' },
    { formName: 'Source Port', propertyName: 'sourcePorts', operator: '$eq' },
    { formName: 'Destination Port', propertyName: 'destinationPorts', operator: '$eq' },
  ];

  constructor(
    private changeRef: ChangeDetectorRef,
    private tableContextService: TableContextService,
    public helpText: SearchBarHelpText,
    private ngx: NgxSmartModalService,
  ) {}

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
      'endpoint-groups',
      'consumed-contracts',
      'provided-contracts',
      'subnets',
      'subjects',
      'filterentries',
      'self-services',
      'subject-filters',
      'l3out-modal',
      'bd-l3outs',
    ];

    const hidePagination = ['import-preview', 'detailed-audit-log-entry'];

    // if tableId is a badList ID, we hide the search bar
    if (badList.includes(this.uniqueTableId)) {
      this.showSearchBar = false;
    }

    if (hidePagination.includes(this.uniqueTableId)) {
      this.paginationControlsOn = false;
    }

    const searchParams = this.tableContextService.getSearchLocalStorage();
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
    const searchParams = this.tableContextService.getSearchLocalStorage();
    this.tableContextService.addFilteredResultsLocalStorage();
    const { searchColumn, searchText } = searchParams;
    this.tableEvent.emit(new TableComponentDto(+this.itemsPerPage, this.currentPage, searchColumn, searchText));
    this.itemsPerPageChange.emit(this.itemsPerPage);
  }

  // function that parses the form values sent by the advanced search modal
  // and emits them to the child component to use in the GET query
  public searchThis(event?) {
    Object.entries(event).map(([k, v]) => {
      if (v === '') {
        delete event[k];
      }
    });
    const newQueryParams = [];

    Object.entries(event).map(input => {
      const queryObject = { searchColumn: input[0], searchText: input[1] };
      newQueryParams.push(queryObject);
    });
    this.tableContextService.addFilteredResultsLocalStorage();
    const finalString = this.scrapeValues(newQueryParams);

    this.tableContextService.addSearchLocalStorage(null, null, finalString);
    const searchStorageParams = this.tableContextService.getSearchLocalStorage();
    console.log('searchStorageParams', searchStorageParams);
    this.getObjectsAndFilter(finalString);
  }

  subscribeToAdvancedSearch() {
    this.advancedSearchSubscription = this.ngx.getModal('advancedSearch').onCloseFinished.subscribe(() => {
      this.ngx.resetModalData('advancedSearch');
      this.advancedSearchSubscription.unsubscribe();
    });
  }

  openAdvancedSearch(event?) {
    this.subscribeToAdvancedSearch();
    this.ngx.getModal('advancedSearch').open();
  }

  private scrapeValues(newQueryParams) {
    const eventParamsArray = [];
    newQueryParams.map(param => {
      const match = this.objectDictionary.find(config => {
        return config.formName === param.searchColumn;
      });
      let string;
      if (match) {
        string = `{"${match.propertyName}": {"${match.operator}": "${param.searchText}"}}`;
      }
      eventParamsArray.push(string);
    });
    const finalString = eventParamsArray.concat().toString();
    return finalString;
  }

  // private advancedSearchNetObjForm(newQueryParams) {
  //   const netObjConfig = [
  //     { formName: 'IpAddress', propertyName: 'ipAddress', operator: '$eq' },
  //     { formName: 'FQDN', propertyName: 'fqdn', operator: '$cont' },
  //     { formName: 'Start IP', propertyName: 'startIpAddress', operator: '$eq'},
  //     { formName: 'End IP', properyName: 'endIpAddress', operator: '$eq'}
  //   ];
  //   let eventParamsArray = [];
  //   newQueryParams.map(param => {
  //     const match = netObjConfig.find(config => {
  //       return config.formName === param.searchColumn;
  //     });
  //     let string;
  //     if (match) {
  //       string = `{"${match.propertyName}": {"${match.operator}": "${param.searchText}"}}`;
  //     }
  //     eventParamsArray.push(string);
  //   });
  //   const finalString = eventParamsArray.concat().toString();
  //   return finalString;
  // }

  // private advancedSearchSvcObjForm(newQueryParams) {
  //   const svcObjConfig = [
  //     { formName: 'Type', propertyName: 'protocol', operator: '$eq' },
  //     { formName: 'Source Port', propertyName: 'sourcePorts', operator: '$cont' },
  //     { formName: 'Destination Port', propertyName: 'destinationPorts', operator: '$cont'},
  //   ];
  //   let eventParamsArray = [];
  //   newQueryParams.map(param => {
  //     const match = svcObjConfig.find(config => {
  //       return config.formName === param.searchColumn;
  //     });
  //     let string;
  //     if (match) {
  //       string = `{"${match.propertyName}": {"${match.operator}": "${param.searchText}"}}`
  //     }
  //     eventParamsArray.push(string);
  //   });
  //   const finalString = eventParamsArray.concat().toString();
  //   return finalString;
  // }

  // private advancedSearchSubnetForm(newQueryParams) {
  //   const subnetObjConfig = [
  //     { formName: 'Network', propertyName: 'network', operator: '$eq' },
  //     { formName: 'Gateway', propertyName: 'gateway', operator: '$eq' },
  //   ];

  //   let eventParamsArray = [];
  //   newQueryParams.map(param => {
  //     const match = subnetObjConfig.find(config => {
  //       return config.formName === param.searchColumn;
  //     });
  //     let string;
  //     if (match) {
  //       string = `{"${match.propertyName}": {"${match.operator}": "${param.searchText}"}}`
  //     }
  //     eventParamsArray.push(string);
  //   });
  //   const finalString = eventParamsArray.concat().toString();
  //   return finalString;
  // }
}
