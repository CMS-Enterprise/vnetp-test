import { Component } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { UntypedFormGroup } from '@angular/forms';
import { TableConfig } from '../table/table.component';

@Component({
  selector: 'app-preview-modal',
  templateUrl: './preview-modal.component.html',
  styleUrls: ['./preview-modal.component.css'],
  standalone: false,
})
export class PreviewModalComponent<T> {
  form: UntypedFormGroup;
  submitted = false;
  config: TableConfig<T> = {
    description: 'Import Preview',
    columns: [],
    hideAdvancedSearch: true,
  };
  data: { data: T[]; count: number; total: number; page: number; pageCount: number };

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
    const modalConfig = this.ngx.getModalData('previewModal') as any;
    this.config = modalConfig.tableConfig;
    this.data = modalConfig.data;
    this.ngx.resetModalData('previewModal');
  }
}
