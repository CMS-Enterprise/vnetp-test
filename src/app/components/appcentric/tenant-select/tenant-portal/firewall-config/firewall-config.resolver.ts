import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import {
  ExternalFirewall,
  ServiceGraphFirewall,
  Tier,
  V2AppCentricExternalFirewallsService,
  V2AppCentricServiceGraphFirewallsService,
  V2AppCentricTenantsService,
  Tenant,
} from 'client';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { TierContextService } from 'src/app/services/tier-context.service';

export type FirewallConfigType = 'external-firewall' | 'service-graph-firewall';

export interface FirewallConfigResolvedData {
  firewall: ExternalFirewall | ServiceGraphFirewall | null;
  firewallType: FirewallConfigType;
  tenant?: Tenant;
}

@Injectable({ providedIn: 'root' })
export class FirewallConfigResolver implements Resolve<FirewallConfigResolvedData> {
  constructor(
    private externalFirewallService: V2AppCentricExternalFirewallsService,
    private serviceGraphFirewallService: V2AppCentricServiceGraphFirewallsService,
    private tenantService: V2AppCentricTenantsService,
    private tierContextService: TierContextService,
    private router: Router,
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<FirewallConfigResolvedData> {
    console.log('resolve', route);
    console.log('resolve', state);
    const paramSource = route.paramMap.has('firewallId') ? route : route.parent;
    const typeParam = (paramSource?.paramMap.get('firewallType') as FirewallConfigType) || 'external-firewall';
    const rawFirewallId = paramSource?.paramMap.get('firewallId');
    const firewallId = rawFirewallId ? decodeURIComponent(rawFirewallId) : null;

    if (!firewallId || !this.isUuid(firewallId)) {
      return of({ firewall: null, firewallType: typeParam } as FirewallConfigResolvedData);
    }

    const relations = ['tier'];
    const firewallRequest$: Observable<ExternalFirewall | ServiceGraphFirewall> =
      typeParam === 'external-firewall'
        ? this.externalFirewallService.getOneExternalFirewall({ id: firewallId, relations })
        : this.serviceGraphFirewallService.getOneServiceGraphFirewall({ id: firewallId, relations });

    return firewallRequest$.pipe(
      switchMap((firewall: ExternalFirewall | ServiceGraphFirewall) => {
        if (!firewall) {
          return of(this.buildResolvedData(typeParam, null));
        }

        const tenantId = firewall.tenantId || firewall?.tier?.tenantId;

        if (!firewall.tierId) {
          return this.handleError('Firewall is not associated with a tier.');
        }

        console.log('Tenant ID', tenantId);

        if (!tenantId) {
          return of(this.buildResolvedData(typeParam, firewall));
        }

        return this.tenantService.getOneTenant({ id: tenantId, relations: ['tiers'] }).pipe(
          tap(tenant => this.applyTierContext((tenant?.tiers as Tier[]) || [], firewall.tierId)),
          map(tenant => this.buildResolvedData(typeParam, firewall, tenant)),
          catchError(() => {
            // Even if we fail to load tenant tiers, continue with firewall data.
            this.tierContextService.clearTier();
            return of(this.buildResolvedData(typeParam, firewall));
          }),
        );
      }),
      catchError(() => this.handleError('Unable to load firewall configuration.')),
    );
  }

  private applyTierContext(tiers: Tier[] = [], tierId: string | null): void {
    if (!tiers?.length || !tierId) {
      this.tierContextService.clearTier();
      return;
    }

    this.tierContextService.unlockTier();
    this.tierContextService.setTenantTiers(tiers, tierId);
    this.tierContextService.lockTier();
  }

  private buildResolvedData(
    firewallType: FirewallConfigType,
    firewall: ExternalFirewall | ServiceGraphFirewall | null,
    tenant?: Tenant,
  ): FirewallConfigResolvedData {
    return {
      firewall,
      firewallType,
      tenant,
    };
  }

  private handleError(message: string): Observable<never> {
    console.error(message);
    return throwError(() => new Error(message));
  }

  private isUuid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
  }
}
