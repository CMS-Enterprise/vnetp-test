export interface FirewallConfigNavigationDto {
  type: 'external-firewall' | 'service-graph-firewall';
  firewallId: string;
  firewallName: string;
  serviceGraphId?: string;
  initialTab?: 'summary' | 'rules' | 'nat' | 'network-objects' | 'service-objects';
}
