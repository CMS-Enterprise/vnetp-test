import { Component, TemplateRef, Input, AfterViewInit, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';

export interface PaginationEvent {
  currentPage: number;
  itemsPerPage: number;
}
export interface TableColumn {
  name: string;
  property?: string;
  template?: () => TemplateRef<any>;
}

export interface TableConfig {
  description: string;
  columns: TableColumn[];
  rowStyle?: (datum: object) => Partial<CSSStyleDeclaration>;
}

/**
 * Usage:
 *
 * - in component:
 *  @ViewChild('nameTemplate', { static: false }) nameTemplate: TemplateRef<any>;
 *
 *  public config: TableConfig = {
 *     description: 'Table',
 *     columns: [{ name: 'Name', template: () => this.nameTemplate }, { name: 'Desc', property: 'description' }],
 *     rowStyle: (data: object) => ({ background: 'red' }),
 *  };
 *  public data = [{ name: 'Test', description: 'my-desc' }];
 *
 * - in template
 * <app-table [config]="config" [data]="data"></app-table>
 * <ng-template #nameTemplate let-datum="datum">{{ datum.name }}</ng-template>
 */
@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
})
export class TableComponent implements AfterViewInit {
  @Input() config: TableConfig;
  @Input() data: object[] = [];

  public itemsPerPage = 20;
  public currentPage = 1;
  public show = false;

  constructor(private changeRef: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.show = true;
    this.changeRef.detectChanges();
  }
}
