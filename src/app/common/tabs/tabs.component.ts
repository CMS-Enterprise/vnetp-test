import { Component, Input, OnInit, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';

export interface Tab {
  name: string;
  tooltip?: string;
  route?: string[];
  subTabs?: Tab[];
  isSubTab?: boolean;
  navToFirstSubTab?: boolean;
  id?: string; // Optional ID for the tab
}

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
})
export class TabsComponent implements OnInit, OnChanges {
  @Input() tabs: Tab[] = [];
  @Input() initialTabIndex = 0;
  @Output() tabChange = new EventEmitter<Tab>();

  public activeTab: Tab;
  public activeSubTab: Tab;

  constructor() {}

  ngOnInit(): void {
    this.setActiveTab(this.tabs[this.initialTabIndex]);
  }

  ngOnChanges(changes: SimpleChanges): void {
    // If tabs change after initialization, we need to make sure we have an active tab
    if (changes.tabs && !changes.tabs.firstChange && this.tabs?.length) {
      // Only update if we don't already have an active tab
      if (!this.activeTab) {
        this.setActiveTab(this.tabs[this.initialTabIndex || 0]);
      }
    }
  }

  public setActiveTab(tab: Tab): void {
    if (!tab) {
      return;
    }

    this.activeTab = tab;
    this.tabChange.emit(tab);

    // Set the first sub-tab as active if it exists
    if (tab.subTabs && tab.subTabs.length > 0) {
      // Mark all sub-tabs as sub-tabs
      tab.subTabs.forEach(subTab => {
        subTab.isSubTab = true;
      });
      this.setActiveSubTab(tab.subTabs[0]);
    } else {
      this.activeSubTab = null;
    }
  }

  public setActiveSubTab(subTab: Tab): void {
    if (!subTab) {
      return;
    }

    this.activeSubTab = subTab;
    this.tabChange.emit(subTab);
  }
}
