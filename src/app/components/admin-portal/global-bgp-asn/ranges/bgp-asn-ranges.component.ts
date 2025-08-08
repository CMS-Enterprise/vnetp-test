import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { TableConfig } from 'src/app/common/table/table.component';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { GlobalBgpAsnService } from '../services/global-bgp-asn.service';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { GlobalBgpAsnRange } from 'client';

@Component({
  selector: 'app-bgp-asn-ranges',
  templateUrl: './bgp-asn-ranges.component.html',
})
export class BgpAsnRangesComponent implements OnInit {
  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

  public addIcon: IconDefinition = faPlus as any;

  public config: TableConfig<GlobalBgpAsnRange> = {
    description: 'BGP ASN ranges',
    columns: [
      { name: 'Environment', property: 'environmentId' },
      { name: 'Start', property: 'start' },
      { name: 'End', property: 'end' },
      { name: 'Type', property: 'type' },
      { name: 'Description', property: 'description' },
      { name: 'Allocated ASNs', value: (r: GlobalBgpAsnRange & any) => r.allocatedCount ?? 0 },
      { name: 'Free ASNs', value: (r: GlobalBgpAsnRange & any) => r.freeCount ?? 0 },
      { name: '% Used', value: (r: GlobalBgpAsnRange & any) => (r.usedPercent ?? 0) + '%' },
      { name: '', template: () => this.actionsTemplate },
    ],
    hideAdvancedSearch: true,
    hideSearchBar: true,
  };

  public data: GlobalBgpAsnRange[] = [];
  public tableData = { data: [], count: 0, total: 0, page: 1, pageCount: 1 };

  constructor(private ngx: NgxSmartModalService, private bgpService: GlobalBgpAsnService) {}

  ngOnInit(): void {
    this.load();
  }

  openCreate(): void {
    this.ngx.setModalData({ ModalMode: ModalMode.Create }, 'bgpAsnRangeModal');
    this.ngx.getModal('bgpAsnRangeModal').onCloseFinished.subscribe(() => this.load());
    this.ngx.getModal('bgpAsnRangeModal').open();
  }

  openEdit(range: GlobalBgpAsnRange): void {
    this.ngx.setModalData({ ModalMode: ModalMode.Edit, range }, 'bgpAsnRangeModal');
    this.ngx.getModal('bgpAsnRangeModal').onCloseFinished.subscribe(() => this.load());
    this.ngx.getModal('bgpAsnRangeModal').open();
  }

  load(): void {
    this.bgpService.getRanges().subscribe({
      next: ranges => {
        const augmented = ranges.map(r => ({ ...r, count: (r as any).count ?? 0, percentUsed: (r as any).percentUsed ?? 0 }));
        this.data = augmented as any;
        this.tableData = {
          data: augmented as any,
          count: augmented.length,
          total: augmented.length,
          page: 1,
          pageCount: 1,
        };
      },
      error: () => {},
    });
  }
}
