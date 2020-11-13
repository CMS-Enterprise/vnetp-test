import { Component } from '@angular/core';
import { Tab } from 'src/app/common/tabs/tabs.component';

export enum SlaTab {
  Templates = 'Templates',
  Profiles = 'Profiles',
  LogicalGroups = 'Logical Groups',
}

@Component({
  selector: 'app-sla-landing',
  templateUrl: './sla-landing.component.html',
})
export class SlaLandingComponent {
  public activeTabName = SlaTab.Templates;
  public tabs: Tab[] = [{ name: SlaTab.Templates }, { name: SlaTab.Profiles }, { name: SlaTab.LogicalGroups }];
  public SLATab = SlaTab;

  public handleTabChange(tab: Tab): void {
    this.activeTabName = tab.name as SlaTab;
  }
}
