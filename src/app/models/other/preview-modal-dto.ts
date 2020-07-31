import { TableConfig } from 'src/app/common/table/table.component';

export class PreviewModalDto<T> {
  constructor(tableConfig: TableConfig, toBeAdded: T[], toBeDeleted: T[]) {
    this.tableConfig = tableConfig;
    this.toBeAdded = toBeAdded;
    this.toBeDeleted = toBeDeleted;
  }

  tableConfig: TableConfig;
  toBeDeleted: T[];
  toBeAdded: T[];
  confirm: boolean;
}
