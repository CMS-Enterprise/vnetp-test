import { Injectable } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FirewallConfigNavigationDto } from 'src/app/models/other/firewall-config-navigation.dto';

@Injectable({
  providedIn: 'root',
})
export class TenantPortalNavigationService {
  constructor(private router: Router) {}

  public navigateToFirewallConfig(params: FirewallConfigNavigationDto, activatedRoute: ActivatedRoute): void {
    // Navigate to firewall configuration within the tenant-portal outlet
    // Get current query params and preserve only the tenant param
    const currentParams = activatedRoute.snapshot.queryParams;
    const cleanParams = {
      // Keep essential params
      tenant: currentParams.tenant,
      // Add new firewall-specific params
      type: params.type,
      firewallId: params.firewallId,
      firewallName: params.firewallName,
      // Only add serviceGraphId if it exists for this navigation
      ...(params.serviceGraphId && { serviceGraphId: params.serviceGraphId }),
    };

    this.router.navigate([{ outlets: { 'tenant-portal': ['firewall-config'] } }], {
      queryParams: cleanParams,
      relativeTo: activatedRoute.parent?.parent,
    });
  }
}
