import { Component, Input } from '@angular/core';
import { LoadBalancerNodeBulkImportDto, V1LoadBalancerPoolsService } from 'client';

@Component({
  selector: 'app-pool-relations',
  templateUrl: './pool-relations.component.html',
  standalone: false,
})
export class PoolRelationsComponent {
  @Input() datacenterId: string;

  constructor(private poolsService: V1LoadBalancerPoolsService) {}

  public import(nodes: LoadBalancerNodeBulkImportDto[]): void {
    this.poolsService
      .bulkUpdatePoolsLoadBalancerPool({
        nodeImportCollectionDto: {
          nodes,
          datacenterId: this.datacenterId,
        },
      })
      .subscribe();
  }
}
