import { Component, OnInit } from '@angular/core';
import { F5Runtime, V1RuntimeDataF5ConfigService } from '../../../../client';
import { F5ConfigService } from './f5-config.service';

@Component({
  selector: 'app-f5-config',
  templateUrl: './f5-config.component.html',
})
export class F5ConfigComponent implements OnInit {
  f5Configs: F5Runtime[];
  filteredF5Configs: F5Runtime[] = [];
  searchQuery = '';

  constructor(private f5ConfigService: V1RuntimeDataF5ConfigService, private f5ConfigStateManagementService: F5ConfigService) {}

  ngOnInit(): void {
    this.f5ConfigStateManagementService.getF5Configs().subscribe(data => {
      this.f5Configs = data;
      this.filterF5Configs();
    });
  }

  onSearch(searchQuery: string): void {
    this.searchQuery = searchQuery.toLowerCase();
    this.filterF5Configs();
  }

  filterF5Configs(): void {
    const filteredConfigs: F5Runtime[] = [];
    this.f5Configs.forEach(f5Config => {
      if (this.matchF5Config(f5Config)) {
        filteredConfigs.push(f5Config);
      }
    });
    this.filteredF5Configs = filteredConfigs;
  }

  matchF5Config(f5Config: F5Runtime): boolean {
    const partitionInfo = (f5Config as any).data.partitionInfo;
    if (this.searchQuery === '' || f5Config.hostname.toLowerCase().includes(this.searchQuery)) {
      return true;
    }
    const filteredParitions = this.f5ConfigStateManagementService.filterVirtualServers(partitionInfo, this.searchQuery);

    for (const partition in filteredParitions) {
      if (filteredParitions.hasOwnProperty(partition)) {
        if (partition.toLowerCase().includes(this.searchQuery.toLowerCase())) {
          return true;
        }

        if (filteredParitions[partition].length > 0) {
          return true;
        }
      }
    }

    return false;
  }

  public getF5Configs() {
    this.f5ConfigService.getManyF5Config({}).subscribe(data => {
      this.f5Configs = data;
      this.filterF5Configs();
    });
  }
}
