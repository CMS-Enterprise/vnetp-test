import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { F5ConfigService } from '../f5-config.service';
import { Observable, Subscription } from 'rxjs';
import { F5Runtime } from '../../../../../client';
import { ActivatedRoute, Router, UrlSegment } from '@angular/router';

@Component({
  selector: 'app-partition-details',
  templateUrl: './partition-details.component.html',
  styleUrls: ['./partition-details.component.css'],
})
export class PartitionDetailsComponent implements OnInit {
  urlF5Id: string;
  f5Config: F5Runtime;
  partitionInfo: any;
  partitionNames: string[];
  filteredPartitionNames: string[];
  filteredVirtualServerNames: any[];
  selectedPartition = '[ALL]';
  searchQuery = '';
  @Input() f5ParentSearchQuery;
  filteredPartitionInfo: any;
  partitionInfoExists = false;

  constructor(private f5ConfigStateManagementService: F5ConfigService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.urlF5Id = params?.id;
      this.f5ConfigStateManagementService.getF5Configs().subscribe(data => {
        this.f5Config = data.find(f5 => f5?.id === this.urlF5Id);
        if (this.f5Config) {
          const f5 = this.f5Config as any;
          this.partitionInfo = f5?.data?.partitionInfo;
          this.partitionInfo = this.partitionInfo === undefined ? {} : this.partitionInfo;
          this.partitionInfoExists = Object.keys(this.partitionInfo).length > 0;
          this.partitionNames = Object.keys(this.partitionInfo);
          this.filteredPartitionNames = this.partitionNames;
          this.filteredPartitionInfo = this.f5ConfigStateManagementService.filterVirtualServers(this.partitionInfo, this.searchQuery);
        }
      });
    });
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
