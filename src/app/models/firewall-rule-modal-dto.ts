import { NetworkSecurityProfileRule } from './network-security-profile-rule';

export class FirewallRuleModalDto {
    VrfId: number;

    FirewallRule: NetworkSecurityProfileRule;
}
