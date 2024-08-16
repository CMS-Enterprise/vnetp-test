import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { F5ConfigService } from '../f5-config.service';
import { F5PartitionInfo, F5Runtime } from '../../../../../client';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-partition-details',
  templateUrl: './partition-details.component.html',
  styleUrls: ['./partition-details.component.css'],
})
export class PartitionDetailsComponent implements OnInit, OnDestroy {
  urlF5Id: string;
  f5Config: F5Runtime;
  partitionInfo: F5PartitionInfo[] = [];
  partitionNames: string[] = [];
  filteredPartitionNames: string[] = [];
  filteredVirtualServerNames: any[] = [];
  selectedPartition = '[ALL]';
  searchQuery = '';
  @Input() f5ParentSearchQuery: string;
  filteredPartitionInfo: F5PartitionInfo[] = [];
  partitionInfoExists = false;

  constructor(private f5ConfigStateManagementService: F5ConfigService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.urlF5Id = params?.id;
      this.f5ConfigStateManagementService.getF5Configs().subscribe(data => {
        this.f5Config = data.find(f5 => f5?.id === this.urlF5Id);
        if (this.f5Config) {
          this.partitionInfo = this.f5Config?.data?.partitionInfo || [];
          this.partitionInfoExists = this.partitionInfo.length > 0;
          this.partitionNames = this.partitionInfo.map(partition => partition.name || '');
          this.filteredPartitionNames = this.partitionNames;
          this.filteredPartitionInfo = this.f5ConfigStateManagementService.filterVirtualServers(this.partitionInfo, this.searchQuery);
        }
      });
    });
  }

  onPartitionSelected(partition: string): void {
    this.selectedPartition = partition;
  }

  ngOnDestroy(): void {
    this.filteredPartitionInfo.forEach(partition => {
      partition.virtualServers?.forEach(vs => {
        // eslint-disable-next-line @typescript-eslint/dot-notation
        delete vs['expanded'];
      });
    });
  }

  onSearch(searchQuery: string): void {
    this.searchQuery = searchQuery.toLowerCase();
    this.filteredPartitionInfo = this.f5ConfigStateManagementService.filterVirtualServers(this.partitionInfo, this.searchQuery);
  }

  handleExpandedChange(virtualServer: any, expanded: boolean): void {
    virtualServer.expanded = expanded;
  }
}
