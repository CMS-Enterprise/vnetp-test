import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { F5PartitionInfo, F5Runtime, F5RuntimePoolMember, V1RuntimeDataF5ConfigService, F5RuntimeVirtualServer } from '../../../../client';
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

  public getF5Configs(): Observable<F5Runtime[]> {
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

  filterVirtualServers(partitionInfo: F5PartitionInfo[], query: string): F5PartitionInfo[] {
    return partitionInfo
      .map(partition => {
        const filteredServers = partition.virtualServers?.filter(
          virtualServer => query === '' || this.fullSearchMatch(virtualServer, query),
        );

        if (filteredServers && filteredServers.length > 0) {
          return {
            ...partition,
            virtualServers: filteredServers,
          };
        }
      })
      .filter(partition => partition !== undefined) as F5PartitionInfo[];
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
    const virtualServerDestination = virtualServer?.destination?.split('/')?.at(-1);
    const virtualServerDestinationIp = virtualServerDestination?.split(':')?.at(0);
    const virtualServerDestinationPort = virtualServerDestination?.split(':')?.at(1);
    const virtualServerIpProtocol = virtualServer?.ipProtocol;
    const virtualServerStatus = this.getVirtualServerStatus(virtualServer);
    const virtualServerCertSearch = this.getVirtualServerCertSearch(virtualServer);

    return (
      virtualServerName?.toLowerCase()?.includes(searchQuery) ||
      virtualServerDestinationIp?.toLowerCase()?.includes(searchQuery) ||
      virtualServerDestinationPort?.toLowerCase()?.includes(searchQuery) ||
      virtualServerIpProtocol?.toLowerCase()?.includes(searchQuery) ||
      virtualServerStatus?.toLowerCase()?.includes(searchQuery) ||
      virtualServerCertSearch?.toLowerCase()?.includes(searchQuery)
    );
  }

  poolMatchesSearch(pool: any, searchQuery: string): boolean {
    const poolName = pool?.name;
    return poolName?.toLowerCase()?.includes(searchQuery);
  }

  fullPoolMemberSearchMatch(members: any, searchQuery: string): boolean {
    return members?.some(member => this.poolMemberMatchesSearch(member, searchQuery));
  }

  poolMemberMatchesSearch(member: F5RuntimePoolMember, searchQuery: string): boolean {
    const memberName = member?.name;
    const memberFullPath = member?.fullPath?.split('/')?.[member?.fullPath?.split('/')?.length - 1];
    const memberIp = memberFullPath?.split(':')?.[0];
    const memberPort = memberFullPath?.split(':')?.[1];
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

  getVirtualServerCertSearch(virtualServer: F5RuntimeVirtualServer): string {
    if (!virtualServer.certsReference || virtualServer.certsReference.length === 0) {
      return '';
    }

    return virtualServer.certsReference
      .map(cert => {
        const name = cert.name || '';
        const subject = cert.subject || '';
        const expirationDate = cert.expirationDate ? cert.expirationDate.toString() : '';
        const expirationString = cert.expirationString || '';

        // Combine the values with a space between them
        return `${name} ${subject} ${expirationDate} ${expirationString}`.trim();
      })
      .join(' ')
      .trim();
  }
}
