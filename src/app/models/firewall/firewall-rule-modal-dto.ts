import { FirewallRule } from 'api_client';

export class FirewallRuleModalDto {
  FirewallRuleGroupId: string;

  TierId: string;

  FirewallRule: FirewallRule;
}
