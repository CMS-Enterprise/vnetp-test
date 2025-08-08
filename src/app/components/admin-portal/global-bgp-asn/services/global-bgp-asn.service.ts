import { Injectable } from '@angular/core';
import { Observable, of, forkJoin } from 'rxjs';

import {
  V3GlobalBgpRangesService,
  V3GlobalEnvironmentService,
  GlobalBgpAsnRange,
  GlobalBgpAsnAllocation,
  EnvironmentSummary,
} from 'client';
import { map, switchMap, catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class GlobalBgpAsnService {
  constructor(private bgpApi: V3GlobalBgpRangesService, private envApi: V3GlobalEnvironmentService) {}

  getRanges(environmentId?: string): Observable<GlobalBgpAsnRange[]> {
    if (environmentId) {
      return this.bgpApi.listGlobalBgpAsn({ environmentId }).pipe(
        map(ranges => this.mapRanges(ranges)),
        switchMap(mapped => this.withAllocationSummaries(mapped)),
      );
    }
    return this.envApi.getManyEnvironments().pipe(
      map(envs => envs?.[0]?.id || null),
      switchMap(envId => (envId ? this.bgpApi.listGlobalBgpAsn({ environmentId: envId }) : of([] as GlobalBgpAsnRange[]))),
      map(ranges => this.mapRanges(ranges)),
      switchMap(mapped => this.withAllocationSummaries(mapped)),
    );
  }

  private mapRanges(apiRanges: GlobalBgpAsnRange[]): GlobalBgpAsnRange[] {
    return (apiRanges || []).map(r => ({
      id: r.id,
      name: r.name,
      environmentId: r.environmentId,
      start: r.start,
      end: r.end,
      type: r.type,
      description: r.description,
      allocations: [],
    }));
  }

  private withAllocationSummaries(ranges: GlobalBgpAsnRange[]): Observable<GlobalBgpAsnRange[]> {
    if (!ranges || ranges.length === 0) {
      return of([]);
    }

    const augmented$ = ranges.map(range =>
      this.bgpApi.allocationsSummaryGlobalBgpAsn({ rangeId: range.id }).pipe(
        map(summary => ({
          ...range,
          allocatedCount: summary?.allocatedCount ?? 0,
          freeCount: summary?.freeCount ?? 0,
          usedPercent: summary?.usedPercent ?? 0,
        })),
        catchError(() => of({ ...range, count: 0, percentUsed: 0 })),
      ),
    );

    return forkJoin(augmented$);
  }

  getAllocations(rangeId?: string): Observable<any[]> {
    if (rangeId) {
      return forkJoin([this.bgpApi.allocationsDetailGlobalBgpAsn({ rangeId }), this.getEnvironmentNameMap()]).pipe(
        map(([allocs, envMap]) => this.mapAllocations(allocs, rangeId, rangeId, envMap)),
      );
    }

    return this.getRanges().pipe(
      map(ranges => ranges?.[0] || null),
      switchMap(selected => {
        const resolvedLabel = selected?.name || selected?.id || '';
        const resolvedId = selected?.id || '';
        return forkJoin([
          selected ? this.bgpApi.allocationsDetailGlobalBgpAsn({ rangeId: resolvedId }) : of([] as GlobalBgpAsnAllocation[]),
          this.getEnvironmentNameMap(),
        ]).pipe(map(([allocs, envMap]) => this.mapAllocations(allocs, resolvedId, resolvedLabel, envMap)));
      }),
    );
  }

  private mapAllocations(
    allocs: GlobalBgpAsnAllocation[],
    rangeId: string,
    rangeLabel: string,
    envNameById: Record<string, string>,
  ): any[] {
    const toAllocatedTo = (a: GlobalBgpAsnAllocation) => a.tenantId || a.vrfId || a.datacenterId || a.tierId || '';
    return (allocs || []).map(a => ({
      environmentName: envNameById?.[a.environmentId] || a.environmentId,
      asn: a.asn,
      rangeLabel,
      allocatedTo: toAllocatedTo(a),
      status: a.role,
      rangeId,
    }));
  }

  private getEnvironmentNameMap(): Observable<Record<string, string>> {
    return this.envApi.getManyEnvironmentSummaries().pipe(
      map((summaries: EnvironmentSummary[] = []) =>
        (summaries || []).reduce((acc, s) => {
          acc[s.id] = s.name;
          return acc;
        }, {} as Record<string, string>),
      ),
      catchError(() => of({} as Record<string, string>)),
    );
  }
}
