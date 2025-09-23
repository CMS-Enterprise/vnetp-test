import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouteControlRequest, Tenant, V2AppCentricTenantsService, V3GlobalRouteControlRequestService } from '../../../../../client';
import { forkJoin, map, Observable, of, switchMap, finalize } from 'rxjs';

interface RouteControlRequestDisplayItem {
  id: string;
  createdAt: string;
  tenantId: string;
  tenantName: string;
  additions: number;
  modifications: number;
  deletions: number;
}

@Component({
  selector: 'app-route-control-request',
  templateUrl: './route-control-request.component.html',
  styleUrl: './route-control-request.component.css',
})
export class RouteControlRequestComponent implements OnInit {
  public routeControlRequests: RouteControlRequestDisplayItem[] = [];
  public isLoading = false;
  private pendingRequests: RouteControlRequest[] = [];
  private tenantNames = new Map<string, string>();
  private changesByTenantId = new Map<string, any>();

  constructor(
    private routeControlRequestService: V3GlobalRouteControlRequestService,
    private tenantService: V2AppCentricTenantsService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.getPendingRouteControlRequests();
  }

  public getPendingRouteControlRequests(): void {
    this.isLoading = true;
    (this.routeControlRequestService.getManyRouteControlRequests({
      filter: ['status||eq||PENDING']
    }) as unknown as Observable<RouteControlRequest[]>)
      .pipe(
        switchMap(requests => {
          if (requests.length === 0) {
            return of({ requests: [], tenants: new Map<string, string>(), changes: [] });
          }
          const tenantIds = [...new Set(requests.map(r => r.tenantId).filter(Boolean))] as string[];
          const tenantReq = (tenantIds.length
            ? this.tenantService.getManyTenant({ filter: [`id||in||${tenantIds.join(',')}`] })
            : of([])) as unknown as Observable<Tenant[]>;
          const changeReqs = tenantIds.map(id => this.tenantService.getRouteControlChangesTenant({ tenantId: id }));
          return forkJoin({
            requests: of(requests),
            tenants: tenantReq.pipe(map(tenants => new Map(tenants.map(t => [t.id, t.name])))),
            changes: changeReqs.length ? forkJoin(changeReqs) : of([]),
            tenantIds: of(tenantIds),
          });
        }),
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: (result) => {
          const { requests, tenants, changes, tenantIds } = result as unknown as {
            requests: RouteControlRequest[];
            tenants: Map<string, string>;
            changes: any[];
            tenantIds: string[];
          };
          this.pendingRequests = requests;
          this.tenantNames = tenants as Map<string, string>;
          this.changesByTenantId = new Map((tenantIds as string[]).map((id, i) => [id, changes[i]]));
          this.buildDisplayItems();
        },
        error: err => {
          console.error('Error fetching WAN form requests:', err);
        },
      });
  }

  private buildDisplayItems(): void {
    this.routeControlRequests = this.pendingRequests.map(request => {
      const requestChanges = (this.changesByTenantId.get(request.tenantId) as any) || {};
      const changeGroups: any[] = Array.isArray(requestChanges?.routeControlChanges)
        ? requestChanges.routeControlChanges
        : Array.isArray(requestChanges?.wanFormChanges)
          ? requestChanges.wanFormChanges
          : [];
      const additions = changeGroups.reduce(
        (acc: number, curr: any) => acc + (curr.addedInternalRoutes?.length || 0) + (curr.addedExternalRoutes?.length || 0),
        0,
      );
      const modifications = changeGroups.reduce(
        (acc: number, curr: any) => acc + (curr.modifiedInternalRoutes?.length || 0) + (curr.modifiedExternalRoutes?.length || 0),
        0,
      );
      const deletions = changeGroups.reduce(
        (acc: number, curr: any) => acc + (curr.removedInternalRoutes?.length || 0) + (curr.removedExternalRoutes?.length || 0),
        0,
      );

      return {
        id: request.id,
        createdAt: request.createdAt,
        tenantId: request.tenantId,
        tenantName: this.tenantNames.get(request.tenantId) || 'Unknown Tenant',
        additions,
        modifications,
        deletions,
        tenantAccountName: request.tenantAccountName,
      };
    });
  }

  public viewRequestDetails(requestId: string): void {
    this.router.navigate(['/adminportal/route-control-request', requestId], { queryParamsHandling: 'merge' });
  }
}
