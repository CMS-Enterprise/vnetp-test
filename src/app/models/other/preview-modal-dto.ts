import { TableConfig } from 'src/app/common/table/table.component';

export class PreviewModalDto<T> {
  constructor(tableConfig: TableConfig, data: T[]) {
    this.tableConfig = tableConfig;
    this.data = data;
  }

  tableConfig: TableConfig;
  data: T[];
  confirm: boolean;
}
