import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { F5Runtime, V1RuntimeDataF5ConfigService } from '../../../../client';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class F5ConfigService {
  f5Configs: F5Runtime[];

  constructor(private v1F5ConfigService: V1RuntimeDataF5ConfigService) {
    this.getF5Configs().subscribe(data => {
      this.f5Configs = data;
    });
  }

  public getF5Configs(): Observable<any> {
    if (this.f5Configs) {
      return of(this.f5Configs);
    } else {
      return this.v1F5ConfigService.getManyF5Config({}).pipe(
        tap(data => {
          this.f5Configs = data;
        }),
        catchError(error => {
          console.error('Error fetching F5 Configs', error);
          return of(null);
        }),
      );
    }
  }

  filterVirtualServers(partitionInfo: any, query: string): any {
    const filteredPartitionInfo = {};
    Object.entries(partitionInfo)?.forEach(([partitionName, virtualServers]) => {
      if ((virtualServers as any)?.length > 0) {
        const filteredServers = (virtualServers as any)?.filter(
          virtualServer => query === '' || this.fullSearchMatch(virtualServer, query),
        );

        if (filteredServers?.length > 0) {
          filteredPartitionInfo[partitionName] = filteredServers;
        } else {
          filteredPartitionInfo[partitionName] = [];
        }
      } else {
        filteredPartitionInfo[partitionName] = [];
      }
    });

    return filteredPartitionInfo;
  }

  fullSearchMatch(virtualServer: any, searchQuery: string): boolean {
    const pool = virtualServer?.poolReference?.items;
    const poolMembers = pool?.membersReference?.items;
    return (
      this.virtualServerMatchesSearch(virtualServer, searchQuery) ||
      this.poolMatchesSearch(pool, searchQuery) ||
      this.fullPoolMemberSearchMatch(poolMembers, searchQuery)
    );
  }

  virtualServerMatchesSearch(virtualServer: any, searchQuery: string): boolean {
    const virtualServerName = virtualServer?.name;
    const virtualSeverDestination = virtualServer?.destination?.split('/')?.at(-1);
    const virtualServerDestinationIp = virtualSeverDestination?.split(':')?.at(0);
    const virtualServerDestinationPort = virtualSeverDestination?.split(':')?.at(1);
    const virtualServerIpProtocol = virtualServer?.ipProtocol;
    const virtualServerStatus = this.getVirtualServerStatus(virtualServer);

    if (
      virtualServerName?.toLowerCase()?.includes(searchQuery) ||
      virtualServerDestinationIp?.toLowerCase()?.includes(searchQuery) ||
      virtualServerDestinationPort?.toLowerCase()?.includes(searchQuery) ||
      virtualServerIpProtocol?.toLowerCase()?.includes(searchQuery) ||
      virtualServerStatus?.toLowerCase()?.includes(searchQuery)
    ) {
      return true;
    }
  }

  poolMatchesSearch(pool: any, searchQuery: string): boolean {
    const poolName = pool?.name;
    return poolName?.toLowerCase()?.includes(searchQuery);
  }

  fullPoolMemberSearchMatch(members: any, searchQuery: string): boolean {
    return members?.some(member => this.poolMemberMatchesSearch(member, searchQuery));
  }

  poolMemberMatchesSearch(member: any, searchQuery: string): boolean {
    const memberName = member?.name;
    const memberFullPath = member?.fullPath?.split('/')?.at(-1);
    const memberIp = memberFullPath?.split(':')?.at(0);
    const memberPort = memberFullPath?.split(':')?.at(1);
    const address = member?.address;

    return (
      memberName?.toLowerCase()?.includes(searchQuery) ||
      memberIp?.toLowerCase()?.includes(searchQuery) ||
      memberPort?.toLowerCase()?.includes(searchQuery) ||
      address?.toLowerCase()?.includes(searchQuery)
    );
  }

  getVirtualServerStatus(virtualServer: any): string {
    const availabilityState = virtualServer?.stats?.nestedStats?.entries?.['status.availabilityState']?.description;
    const enabledState = virtualServer?.stats?.nestedStats?.entries?.['status.enabledState']?.description;

    if (availabilityState === 'available' && enabledState === 'enabled') {
      return 'up';
    } else if (availabilityState === 'available' && enabledState === 'disabled') {
      return 'disabled';
    } else if (availabilityState === 'offline') {
      return 'down';
    } else {
      return 'unknown';
    }
  }
}
