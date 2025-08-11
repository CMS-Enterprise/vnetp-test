import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sortVirtualServersByStatus',
  standalone: false,
})
export class SortVirtualServersByStatusPipe implements PipeTransform {
  transform(virtualServers: any[]): any[] {
    if (!virtualServers || !Array.isArray(virtualServers)) {
      return [];
    }

    const statusSortValue = (virtualServer: any): number => {
      const availabilityState = virtualServer?.stats?.nestedStats?.entries?.['status.availabilityState']?.description;
      const enabledState = virtualServer?.stats?.nestedStats?.entries?.['status.enabledState']?.description;
      if (availabilityState === 'available' && enabledState === 'enabled') {
        return 4; // Green
      } else if (availabilityState === 'available' && enabledState === 'disabled') {
        return 1; // Black
      } else if (availabilityState === 'offline') {
        return 2; // Red
      } else {
        return 3; // Blue
      }
    };

    return virtualServers.sort((a, b) => statusSortValue(a) - statusSortValue(b));
  }
}
