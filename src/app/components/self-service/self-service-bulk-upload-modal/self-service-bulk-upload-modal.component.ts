import { Component, Input } from '@angular/core';
import { V1SelfServiceService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Tab } from 'src/app/common/tabs/tabs.component';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { TierContextService } from 'src/app/services/tier-context.service';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

@Component({
  selector: 'app-self-service-bulk-upload-modal',
  templateUrl: './self-service-bulk-upload-modal.component.html',
  standalone: false,
})
export class SelfServiceBulkUploadModalComponent {
  @Input() selfService;
  navIndex = 0;

  public tabs: Tab[] = [
    // { name: 'LOGS' },
    { name: 'Subnets' },
    { name: 'VLANs' },
    { name: 'Network Objects' },
    { name: 'Service Objects' },
    { name: 'Network Object Groups' },
    { name: 'Service Object Groups' },
    { name: 'Intervrf FW Rules' },
    { name: 'External FW Rules' },
    { name: 'Intervrf NAT Rules' },
    { name: 'External NAT Rules' },
  ];

  constructor(
    private ngx: NgxSmartModalService,
    public datacenterService: DatacenterContextService,
    public tierContextService: TierContextService,
    private selfServiceService: V1SelfServiceService,
  ) {}

  public handleTabChange(tab) {
    if (this.navIndex === this.tabs.findIndex(t => t.name === tab.name)) {
      return;
    }
    this.navIndex = this.tabs.findIndex(t => t.name === tab.name);
  }

  public importObjects() {
    const modalDto = new YesNoModalDto('Import', 'Are you sure you would like to import objects?');
    const onConfirm = () => {
      this.selfServiceService.bulkUploadSelfService({ selfService: this.selfService }).subscribe(() => {});
    };

    const onClose = () => {};

    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm, onClose);
  }
}
