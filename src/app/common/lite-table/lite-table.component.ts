import { AfterViewChecked, AfterViewInit, Component, Input, ViewEncapsulation } from '@angular/core';
import { TableColumn } from '../table/table.component';

export interface LiteTableConfig<T> {
  columns: TableColumn<T>[];
  rowStyle?: (row: T) => any;
  context?: (row: T, parentContext?: any) => any;
  afterView?: (...args: any[]) => void;
}

@Component({
  selector: 'app-lite-table',
  templateUrl: './lite-table.component.html',
  styleUrl: './lite-table.component.scss',
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class LiteTableComponent implements AfterViewChecked {
  @Input() config: LiteTableConfig<any>;
  @Input() data: any[];
  @Input() parentContext: any;

  constructor() {}

  ngAfterViewChecked(): void {
    this.config.afterView();
  }
}
