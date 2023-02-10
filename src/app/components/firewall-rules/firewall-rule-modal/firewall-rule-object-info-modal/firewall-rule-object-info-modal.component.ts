import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
  selector: 'app-firewall-rule-object-info-modal',
  templateUrl: './firewall-rule-object-info-modal.component.html',
})
export class FirewallRuleObjectInfoModalComponent implements OnInit {
  modalBody;
  modalTitle;
  constructor(private ngx: NgxSmartModalService) {}

  ngOnInit(): void {}

  getData() {
    const modalData = this.ngx.getModalData('firewallRuleObjectInfoModal');
    this.modalTitle = modalData.modalTitle;
    this.modalBody = modalData.modalBody;
  }
}
