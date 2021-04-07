import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

export interface Tab {
  name: string;
  tooltip?: string;
}

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
})
export class TabsComponent implements OnInit {
  @Input() tabs: Tab[] = [];
  @Input() initialTabIndex = 0;
  @Output() tabChange = new EventEmitter<Tab>();

  public activeTab: Tab;

  ngOnInit(): void {
    this.setActiveTab(this.tabs[this.initialTabIndex]);
  }

  public setActiveTab(tab: Tab): void {
    this.activeTab = tab;
    this.tabChange.emit(tab);
  }
}
