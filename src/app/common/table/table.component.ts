import { Component, TemplateRef, Input, OnChanges, AfterViewInit, ChangeDetectorRef } from '@angular/core';

export interface TableColumn {
  name: string;
  property?: string;
  template?: () => TemplateRef<any>;
}

export interface TableConfig {
  description: string;
  columns: TableColumn[];
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
  public show = false;

  constructor(private changeRef: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.show = true;
    this.changeRef.detectChanges();
  }
}
