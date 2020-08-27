import { FirewallRule, NetworkObjectGroup, NetworkObject, ServiceObject, ServiceObjectGroup } from 'api_client';
import { ModalMode } from '../other/modal-mode';

export class FirewallRuleModalDto {
  FirewallRuleGroupId: string;
  TierId: string;
  FirewallRule: FirewallRule;
  NetworkObjects: NetworkObject[];
  NetworkObjectGroups: NetworkObjectGroup[];
  ServiceObjects: ServiceObject[];
  ServiceObjectGroups: ServiceObjectGroup[];
  ModalMode: ModalMode;
}
