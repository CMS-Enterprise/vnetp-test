import { Component } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
  selector: 'app-nat-rule-object-info-modal',
  templateUrl: './nat-rule-object-info-modal.component.html',
  standalone: false,
})
export class NatRuleObjectInfoModalComponent {
  modalBody;
  modalTitle;
  constructor(private ngx: NgxSmartModalService) {}

  getData() {
    const modalData = this.ngx.getModalData('natRuleObjectInfoModal') as any;
    this.modalTitle = modalData.modalTitle;
    this.modalBody = modalData.modalBody;
  }
}
