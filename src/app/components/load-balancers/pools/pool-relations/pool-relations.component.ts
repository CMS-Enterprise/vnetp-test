import { Component, Input } from '@angular/core';
import { LoadBalancerNodeBulkImportDto, V1LoadBalancerPoolsService } from 'api_client';

@Component({
  selector: 'app-pool-relations',
  templateUrl: './pool-relations.component.html',
})
export class PoolRelationsComponent {
  @Input() datacenterId: string;

  constructor(private poolsService: V1LoadBalancerPoolsService) {}

  public import(nodes: LoadBalancerNodeBulkImportDto[]): void {
    this.poolsService
      .v1LoadBalancerPoolsBulkUpdatePost({
        nodeImportCollectionDto: {
          nodes,
          datacenterId: this.datacenterId,
        },
      })
      .subscribe();
  }
}
