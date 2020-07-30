import { Component } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup } from '@angular/forms';
import { PreviewModalDto } from 'src/app/models/other/preview-modal-dto';

@Component({
  selector: 'app-preview-modal',
  templateUrl: './preview-modal.component.html',
})
export class PreviewModalComponent {
  form: FormGroup;
  submitted = false;
  title = 'Preview';
  headers: string[];
  toBeAdded: any;
  toBeDeleted: any;

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

    this.title = modalConfig.title;
    this.headers = modalConfig.headers.slice(0, -1);
    this.toBeAdded = modalConfig.toBeAdded;
    this.toBeDeleted = modalConfig.toBeDeleted;

    this.ngx.resetModalData('previewModal');
  }
}
