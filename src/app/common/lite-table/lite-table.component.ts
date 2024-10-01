import { Component, Input, ViewEncapsulation } from '@angular/core';
import { TableColumn } from '../table/table.component';

export interface LiteTableConfig<T> {
  columns: TableColumn<T>[];
  rowStyle?: (row: T) => any;
}

@Component({
  selector: 'app-lite-table',
  templateUrl: './lite-table.component.html',
  styleUrl: './lite-table.component.scss',
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class LiteTableComponent {
  @Input() config: LiteTableConfig<any>;
  @Input() data: any[];
}
