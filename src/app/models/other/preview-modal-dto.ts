import { TableConfig } from 'src/app/common/table/table.component';

export class PreviewModalDto<T> {
  constructor(public tableConfig: TableConfig<T>, public data: T[]) {}

  confirm: boolean;
}
