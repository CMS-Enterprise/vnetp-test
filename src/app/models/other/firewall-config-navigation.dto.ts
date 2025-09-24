export interface FirewallConfigNavigationDto {
  type: 'external-firewall' | 'service-graph-firewall';
  firewallId: string;
  firewallName: string;
  serviceGraphId?: string;
}
