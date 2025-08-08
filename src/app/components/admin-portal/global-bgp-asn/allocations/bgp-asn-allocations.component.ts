import { Component, OnInit } from '@angular/core';
import { TableConfig } from 'src/app/common/table/table.component';
import { GlobalBgpAsnService } from '../services/global-bgp-asn.service';

@Component({
  selector: 'app-bgp-asn-allocations',
  templateUrl: './bgp-asn-allocations.component.html',
})
export class BgpAsnAllocationsComponent implements OnInit {
  public config: TableConfig<any> = {
    description: 'BGP ASN allocations',
    columns: [
      { name: 'Environment', property: 'environmentName' },
      { name: 'ASN', property: 'asn' },
      { name: 'Range', property: 'rangeLabel' },
      { name: 'Allocated To', property: 'allocatedTo' },
      { name: 'Status', property: 'status' },
    ],
    hideAdvancedSearch: true,
    hideSearchBar: true,
  };

  // public data: BgpAsnAllocation[] = [];
  public tableData = { data: [], count: 0, total: 0, page: 1, pageCount: 1 };

  constructor(private bgpService: GlobalBgpAsnService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.bgpService.getAllocations().subscribe({
      next: allocations => {
        this.tableData = {
          data: allocations,
          count: allocations.length,
          total: allocations.length,
          page: 1,
          pageCount: 1,
        };
      },
      error: () => {},
    });
  }
}
