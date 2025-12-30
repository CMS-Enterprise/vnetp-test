import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { TableConfig } from 'src/app/common/table/table.component';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { V3GlobalBgpRangesService, GlobalBgpAsnRange } from 'client';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import AsnUtil from 'src/app/utils/AsnUtil';

@Component({
  selector: 'app-global-bgp-asn-ranges',
  templateUrl: './global-bgp-asn-ranges.component.html',
})
export class GlobalBgpAsnRangesComponent implements OnInit {
  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

  public addIcon: IconDefinition = faPlus as any;

  public config: TableConfig<GlobalBgpAsnRange> = {
    description: 'BGP ASN ranges',
    columns: [
      { name: 'Name', property: 'name' },
      { name: 'Environment', value: (r: GlobalBgpAsnRange & any) => r.environment?.name || r.environmentId },
      { name: 'Start (ASPlain)', property: 'start' },
      { name: 'Start (ASdot+)', value: (r: GlobalBgpAsnRange) => {
        const startNum = typeof r.start === 'string' ? parseInt(r.start, 10) : r.start;
        return AsnUtil.asPlainToAsdot(startNum);
      }},
      { name: 'End (ASPlain)', property: 'end' },
      { name: 'End (ASdot+)', value: (r: GlobalBgpAsnRange) => {
        const endNum = typeof r.end === 'string' ? parseInt(r.end, 10) : r.end;
        return AsnUtil.asPlainToAsdot(endNum);
      }},
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

  constructor(private ngx: NgxSmartModalService, private bgpApi: V3GlobalBgpRangesService) {}

  ngOnInit(): void {
    this.load();
  }

  openCreate(): void {
    this.ngx.setModalData({ ModalMode: ModalMode.Create }, 'globalBgpAsnRangeModal');
    this.ngx.getModal('globalBgpAsnRangeModal').onCloseFinished.subscribe(() => this.load());
    this.ngx.getModal('globalBgpAsnRangeModal').open();
  }

  openEdit(range: GlobalBgpAsnRange): void {
    this.ngx.setModalData({ ModalMode: ModalMode.Edit, range }, 'globalBgpAsnRangeModal');
    this.ngx.getModal('globalBgpAsnRangeModal').onCloseFinished.subscribe(() => this.load());
    this.ngx.getModal('globalBgpAsnRangeModal').open();
  }

  load(): void {
    this.bgpApi.listRangesGlobalBgpAsn().subscribe({
      next: ranges => {
        const decorated$ = (ranges || []).map(range =>
          this.bgpApi.allocationsSummaryGlobalBgpAsn({ rangeId: range.id }).pipe(
            map(summary => ({
              ...range,
              allocatedCount: summary?.allocatedCount ?? 0,
              freeCount: summary?.freeCount ?? 0,
              usedPercent: summary?.usedPercent ?? 0,
            })),
            catchError(() => of({ ...range, allocatedCount: 0, freeCount: 0, usedPercent: 0 } as any)),
          ),
        );

        if (decorated$.length === 0) {
          this.data = [];
          this.tableData = { data: [], count: 0, total: 0, page: 1, pageCount: 1 };
          return;
        }

        forkJoin(decorated$).subscribe(decorated => {
          this.data = decorated as any;
          this.tableData = {
            data: decorated as any,
            count: decorated.length,
            total: decorated.length,
            page: 1,
            pageCount: 1,
          };
        });
      },
      error: () => {
        this.data = [];
        this.tableData = { data: [], count: 0, total: 0, page: 1, pageCount: 1 };
      },
    });
  }
}
