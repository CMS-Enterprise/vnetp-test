import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { F5ConfigService } from '../f5-config.service';
import { Subscription } from 'rxjs';
import { F5Runtime } from '../../../../../client';

@Component({
  selector: 'app-partition-details',
  templateUrl: './partition-details.component.html',
})
export class PartitionDetailsComponent implements OnInit, OnDestroy {
  f5Config: F5Runtime;
  f5ConfigSubscription: Subscription;
  partitionInfo: any;
  partitionNames: string[];
  filteredPartitionNames: string[];
  filteredVirtualServerNames: any[];
  selectedPartition = '[ALL]';
  searchQuery = '';
  @Input() f5ParentSearchQuery;
  filteredPartitionInfo: any;

  constructor(private f5ConfigStateManagementService: F5ConfigService) {}

  ngOnInit(): void {
    this.f5ConfigSubscription = this.f5ConfigStateManagementService.currentF5Config.subscribe(f5Config => {
      if (f5Config) {
        this.f5Config = f5Config;
        this.partitionInfo = f5Config.data?.partitionInfo;
        this.partitionNames = Object.keys(this.partitionInfo);
        this.filteredPartitionNames = this.partitionNames;
        this.filteredPartitionInfo = this.f5ConfigStateManagementService.filterVirtualServers(this.partitionInfo, this.searchQuery);
      }
    });
  }

  ngOnDestroy(): void {
    this.f5ConfigSubscription.unsubscribe();
  }

  onPartitionSelected(partition: string): void {
    this.selectedPartition = partition;
  }

  onSearch(searchQuery: string): void {
    this.searchQuery = searchQuery.toLowerCase();
    this.filteredPartitionInfo = this.f5ConfigStateManagementService.filterVirtualServers(this.partitionInfo, this.searchQuery);
  }

  handleExpandedChange(virtualServer: any, expanded: boolean): void {
    // If needed, find the virtualServer in your data structure and update its expanded state
    // This is necessary if you want to adjust the layout or maintain the state
    virtualServer.expanded = expanded;

    // Additional logic if needed, e.g., ensuring only one card is expanded at a time
  }
}
