import { Component } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
  selector: 'app-self-service-bulk-upload-modal',
  templateUrl: './self-service-bulk-upload-modal.component.html',
})
export class SelfServiceBulkUploadModalComponent {
  constructor(private ngx: NgxSmartModalService) {}
}
