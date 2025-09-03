import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { V3GlobalWanFormRequestService, V2AppCentricTenantsService } from '../../../../../client';

interface WanFormRequestDisplayItem {
  id: string;
  createdAt: string;
  tenantName: string;
  additions: number;
  modifications: number;
  deletions: number;
}

@Component({
  selector: 'app-wan-form-request',
  templateUrl: './wan-form-request.component.html',
  styleUrl: './wan-form-request.component.css',
})
export class WanFormRequestComponent implements OnInit {
  public wanFormRequests: WanFormRequestDisplayItem[] = [];
  public isLoading = false;

  constructor(
    private wanFormRequestService: V3GlobalWanFormRequestService,
    private tenantService: V2AppCentricTenantsService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.getPendingWanFormRequests();
  }

  public getPendingWanFormRequests(): void {
    // this.isLoading = true;
    // (this.wanFormRequestService.getManyWanFormRequests({ filter: ['status||eq||PENDING'] }) as unknown as Observable<WanFormRequest[]>)
    //   .pipe(
    //     switchMap(requests => {
    //       if (requests.length === 0) {
    //         return of({ requests: [], tenants: new Map<string, string>(), changes: [] });
    //       }
    //       const tenantIds = [...new Set(requests.map(r => r.tenantId))];
    //       const tenantReq = this.tenantService.getManyTenant({ filter: [`id||in||${tenantIds.join(',')}`] }) as unknown as Observable<
    //         Tenant[]
    //       >;
    //       // const changeReqs = requests.map(r => this.tenantService.getWanFormChangesTenant({ id: r.tenantId }));
    //       // return forkJoin({
    //       //   requests: of(requests),
    //       //   tenants: tenantReq.pipe(map(tenants => new Map(tenants.map(t => [t.id, t.name])))),
    //       //   changes: forkJoin(changeReqs),
    //       // });
    //     }),
    //   )
    //   .subscribe({
    //     next: ({ requests, tenants, changes }) => {
    //       const changesMap = new Map(changes.map((c, i) => [requests[i].id, c]));
    //       this.wanFormRequests = requests.map(request => {
    //         const requestChanges = changesMap.get(request.id) as any;
    //         const additions = requestChanges
    //           ? requestChanges.wanFormChanges.reduce(
    //               (acc, curr) => acc + (curr.addedInternalRoutes?.length || 0) + (curr.addedExternalRoutes?.length || 0),
    //               0,
    //             )
    //           : 0;
    //         const modifications = requestChanges
    //           ? requestChanges.wanFormChanges.reduce(
    //               (acc, curr) =>
    //                 acc + ((curr as any).modifiedInternalRoutes?.length || 0) + ((curr as any).modifiedExternalRoutes?.length || 0),
    //               0,
    //             )
    //           : 0;
    //         const deletions = requestChanges
    //           ? requestChanges.wanFormChanges.reduce(
    //               (acc, curr) => acc + (curr.removedInternalRoutes?.length || 0) + (curr.removedExternalRoutes?.length || 0),
    //               0,
    //             )
    //           : 0;
    //         return {
    //           id: request.id,
    //           createdAt: request.createdAt,
    //           tenantName: tenants.get(request.tenantId) || 'Unknown Tenant',
    //           additions,
    //           modifications,
    //           deletions,
    //         };
    //       });
    //       this.isLoading = false;
    //     },
    //     error: err => {
    //       console.error('Error fetching WAN form requests:', err);
    //       this.isLoading = false;
    //     },
    //   });
  }

  public viewRequestDetails(requestId: string): void {
    this.router.navigate(['/adminportal/wan-form-request', requestId], { queryParamsHandling: 'merge' });
  }
}
