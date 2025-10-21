import { Injectable } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FirewallConfigNavigationDto } from 'src/app/models/other/firewall-config-navigation.dto';

@Injectable({
  providedIn: 'root',
})
export class TenantPortalNavigationService {
  constructor(private router: Router) {}

  public navigateToFirewallConfig(params: FirewallConfigNavigationDto, activatedRoute: ActivatedRoute): void {
    const normalizedId = this.normalizeFirewallId(params.firewallId);
    if (!normalizedId) {
      return;
    }

    const baseRoute = ['firewall-config', params.type, normalizedId, params.initialTab || 'rules'];
    this.router.navigate(
      [
        {
          outlets: {
            'tenant-portal': baseRoute,
          },
        },
      ],
      {
        queryParamsHandling: 'merge',
        queryParams: {
          ...(params.serviceGraphId && { serviceGraphId: params.serviceGraphId }),
        },
        relativeTo: activatedRoute.parent?.parent,
      },
    );
  }

  private normalizeFirewallId(rawId: string): string | null {
    if (!rawId) {
      return null;
    }

    const decodedId = decodeURIComponent(rawId);

    if (decodedId.includes(':')) {
      const parts = decodedId.split(':');
      if (parts.length >= 2) {
        return parts[1];
      }
    }

    return decodedId;
  }
}
