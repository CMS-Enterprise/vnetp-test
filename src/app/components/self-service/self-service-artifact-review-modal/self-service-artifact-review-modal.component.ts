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
  selectedObjects;
  navIndex = 0;
  selectedLog;

  public loadingTabObjects = false;

  public tabs: Tab[] = [
    { name: 'LOGS' },
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
    description: 'Selected Objects',
    columns: [
      {
        name: 'Object Name',
        property: 'name',
      },
      {
        name: 'Line Number (Original Config)',
        template: () => this.lineNumberTemplate,
      },
    ],
  };

  constructor(private ngx: NgxSmartModalService) {}
  ngOnInit(): void {
    this.navIndex = 0;
  }

  public onClose() {
    this.navIndex = 0;
  }

  public handleTabChange(tab) {
    this.loadingTabObjects = true;
    if (this.navIndex === this.tabs.findIndex(t => t.name === tab.name)) {
      return;
    }
    this.navIndex = this.tabs.findIndex(t => t.name === tab.name);
    switch (this.navIndex) {
      case 1:
        this.selectedObjects = {
          data: this.selfService.convertedConfig.artifact.networkObjects,
          page: 1,
          pageCount: 1,
          count: 1,
          total: 1,
        };
        break;
      case 2:
        this.selectedObjects = {
          data: this.selfService.convertedConfig.artifact.serviceObjects,
          page: 1,
          pageCount: 1,
          count: 1,
          total: 1,
        };
        break;
      case 3:
        this.selectedObjects = {
          data: this.selfService.convertedConfig.artifact.networkObjectGroups,
          page: 1,
          pageCount: 1,
          count: 1,
          total: 1,
        };
        break;
      case 4:
        this.selectedObjects = {
          data: this.selfService.convertedConfig.artifact.serviceObjectGroups,
          page: 1,
          pageCount: 1,
          count: 1,
          total: 1,
        };
        break;
      case 5:
        this.selectedObjects = {
          data: this.selfService.convertedConfig.artifact.intervrfFirewallRules,
          page: 1,
          pageCount: 1,
          count: 1,
          total: 1,
        };
        break;
      case 6:
        this.selectedObjects = {
          data: this.selfService.convertedConfig.artifact.externalFirewallRules,
          page: 1,
          pageCount: 1,
          count: 1,
          total: 1,
        };
        break;
      case 7:
        this.selectedObjects = {
          data: this.selfService.convertedConfig.artifact.intervrfNatRules,
          page: 1,
          pageCount: 1,
          count: 1,
          total: 1,
        };
        break;
      case 8:
        this.selectedObjects = {
          data: this.selfService.convertedConfig.artifact.externalNatRules,
          page: 1,
          pageCount: 1,
          count: 1,
          total: 1,
        };
        break;
    }
    this.loadingTabObjects = false;
  }
}
