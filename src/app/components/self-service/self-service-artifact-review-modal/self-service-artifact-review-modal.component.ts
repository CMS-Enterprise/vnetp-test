import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Tab } from 'src/app/common/tabs/tabs.component';

@Component({
  selector: 'app-self-service-artifact-review-modal',
  templateUrl: './self-service-artifact-review-modal.component.html',
})
export class SelfServiceArtifactReviewModalComponent implements OnInit {
  @ViewChild('lineNumberTemplate') lineNumberTemplate: TemplateRef<any>;
  @Input() selfService;
  navIndex = 0;
  logIndex = 0;
  selectedLog;

  public logValues = [{ name: 'Artifact-Logs' }, { name: 'Object-Logs' }];
  public tabs: Tab[] = [
    { name: 'LOGS' },
    // { name: 'Subnets' },
    // { name: 'VLANs' },
    { name: 'Network Objects' },
    { name: 'Service Objects' },
    { name: 'Network Object Groups' },
    { name: 'Service Object Groups' },
    { name: 'Intervrf FW Rules' },
    { name: 'External FW Rules' },
    { name: 'Intervrf NAT Rules' },
    { name: 'External NAT Rules' },
  ];

  public config = {
    description: 'Network Objects',
    columns: [
      {
        name: 'Object Name',
        template: 'name',
      },
      {
        name: 'Line Number',
        template: () => this.lineNumberTemplate,
      },
    ],
  };

  constructor(private ngx: NgxSmartModalService) {}
  ngOnInit(): void {
    this.selectedLog = this.logValues[0].name;
  }

  public onClose() {
    this.selectedLog = this.logValues[0].name;
    this.logIndex = 0;
  }

  public handleLogChange(val) {
    if (this.logIndex === this.logValues.findIndex(l => l.name === val.name)) {
      return;
    }
    this.logIndex = this.logValues.findIndex(l => l.name === val.name);
  }
  public handleTabChange(tab) {
    if (this.navIndex === this.tabs.findIndex(t => t.name === tab.name)) {
      return;
    }
    this.navIndex = this.tabs.findIndex(t => t.name === tab.name);
    console.log('navIndex', this.navIndex);
  }
}
