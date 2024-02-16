import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
  selector: 'app-nat-rule-object-info-modal',
  templateUrl: './nat-rule-object-info-modal.component.html',
})
export class NatRuleObjectInfoModalComponent implements OnInit {
  modalBody;
  modalTitle;
  constructor(private ngx: NgxSmartModalService) {}

  ngOnInit(): void {}

  getData() {
    const modalData = this.ngx.getModalData('natRuleObjectInfoModal') as any;
    this.modalTitle = modalData.modalTitle;
    this.modalBody = modalData.modalBody;
  }
}
