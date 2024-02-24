import { NatRule, NetworkObjectGroup } from 'client';

export class NatRulePacketTracerDto {
  natRules: NatRule[];
  networkObjectGroups: NetworkObjectGroup[];
}
