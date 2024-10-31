import { FirewallRule, NetworkObjectGroup, PanosApplication, ServiceObjectGroup } from 'client';

export class FirewallRulePacketTracerDto {
  firewallRules: FirewallRule[];
  networkObjectGroups: NetworkObjectGroup[];
  serviceObjectGroups: ServiceObjectGroup[];
  panosApplications: PanosApplication[];
}
