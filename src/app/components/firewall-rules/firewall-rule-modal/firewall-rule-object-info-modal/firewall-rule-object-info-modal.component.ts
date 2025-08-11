import { Component } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
  selector: 'app-firewall-rule-object-info-modal',
  templateUrl: './firewall-rule-object-info-modal.component.html',
  standalone: false,
})
export class FirewallRuleObjectInfoModalComponent {
  modalBody;
  modalTitle;
  constructor(private ngx: NgxSmartModalService) {}

  getData() {
    const modalData = this.ngx.getModalData('firewallRuleObjectInfoModal') as any;
    this.modalTitle = modalData.modalTitle;
    this.modalBody = modalData.modalBody;
  }
}
