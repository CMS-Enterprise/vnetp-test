import { Component } from '@angular/core';
import { Tab } from 'src/app/common/tabs/tabs.component';

enum SLATab {
  Templates = 'Templates',
  Profiles = 'Profiles',
  LogicalGroups = 'Logical Groups',
}

@Component({
  selector: 'app-sla-landing',
  templateUrl: './sla-landing.component.html',
})
export class SLALandingComponent {
  public activeTabName = SLATab.Templates;
  public tabs: Tab[] = [{ name: SLATab.Templates }, { name: SLATab.Profiles }, { name: SLATab.LogicalGroups }];
  public SLATab = SLATab;

  public handleTabChange(tab: Tab): void {
    this.activeTabName = tab.name as SLATab;
  }
}
