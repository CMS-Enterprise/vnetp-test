import { Component, Input, OnChanges, OnInit, Output, EventEmitter } from '@angular/core';

export interface Tab {
  name: string;
  tooltip: string;
}

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
})
export class TabsComponent implements OnInit {
  @Input() tabs: Tab[] = [];
  @Output() tabChange = new EventEmitter<Tab>();

  public activeTab: Tab;

  ngOnInit(): void {
    this.activeTab = this.tabs[0];
  }
}
