import { Component, Input, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Tab } from 'src/app/common/tabs/tabs.component';

@Component({
  selector: 'app-self-service-artifact-review-modal',
  templateUrl: './self-service-artifact-review-modal.component.html',
})
export class SelfServiceArtifactReviewModalComponent {
  @Input() selfService;
  navIndex = 0;
  public tabs: Tab[] = [
    { name: 'Subnets' },
    { name: 'VLANs' },
    { name: 'Network Objects' },
    { name: 'Service Objects' },
    { name: 'VLANs' },
  ];

  constructor(private ngx: NgxSmartModalService) {}

  public handleTabChange(tab) {
    if (this.navIndex === this.tabs.findIndex(t => t.name === tab.name)) {
      return;
    }
    this.navIndex = this.tabs.findIndex(t => t.name === tab.name);
  }
}
