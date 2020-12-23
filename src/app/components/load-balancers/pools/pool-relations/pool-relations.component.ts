import { Component, Input } from '@angular/core';
import { LoadBalancerNodeBulkImportDto, V1LoadBalancerPoolsService } from 'api_client';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-pool-relations',
  templateUrl: './pool-relations.component.html',
})
export class PoolRelationsComponent {
  @Input() datacenterId: string;

  constructor(private poolsService: V1LoadBalancerPoolsService, private toastr: ToastrService) {}

  public import(nodes: LoadBalancerNodeBulkImportDto[]): void {
    debugger;
    this.poolsService
      .v1LoadBalancerPoolsBulkUpdatePost({
        nodeImportCollectionDto: {
          nodes,
          datacenterId: this.datacenterId,
        },
      })
      .subscribe(
        resp => {
          debugger;
        },
        err => {
          debugger;
        },
      );
  }
}
