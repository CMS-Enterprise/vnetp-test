import { FirewallRule, NetworkObjectGroup, ServiceObjectGroup } from 'client';

export class FirewallRulePacketTracerDto {
  firewallRules: FirewallRule[];
  networkObjectGroups: NetworkObjectGroup[];
  serviceObjectGroups: ServiceObjectGroup[];
}
