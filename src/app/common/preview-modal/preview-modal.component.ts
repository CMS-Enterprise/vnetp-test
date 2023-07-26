import { Component } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { UntypedFormGroup } from '@angular/forms';
import { TableConfig } from '../table/table.component';

@Component({
  selector: 'app-preview-modal',
  templateUrl: './preview-modal.component.html',
})
export class PreviewModalComponent<T> {
  form: UntypedFormGroup;
  submitted = false;
  config: TableConfig<T> = {
    description: 'Import Preview',
    columns: [],
  };
  data: T[];

  constructor(private ngx: NgxSmartModalService) {}

  public confirm(): void {
    const previewModalDto = { confirm: true };

    this.ngx.resetModalData('previewModal');
    this.ngx.setModalData(Object.assign({}, previewModalDto), 'previewModal');
    this.ngx.close('previewModal');
  }

  public cancel(): void {
    this.ngx.resetModalData('previewModal');
    this.ngx.close('previewModal');
  }

  public getData(): void {
    const modalConfig = this.ngx.getModalData('previewModal');
    this.config = modalConfig.tableConfig;
    this.data = modalConfig.data;
    this.ngx.resetModalData('previewModal');
  }
}
