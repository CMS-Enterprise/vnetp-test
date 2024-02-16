import {
  FirewallRule,
  NetworkObjectGroup,
  NetworkObject,
  ServiceObject,
  ServiceObjectGroup,
  Zone,
  FirewallRuleGroupTypeEnum,
} from 'client';
import { ModalMode } from '../other/modal-mode';

export class FirewallRuleModalDto {
  FirewallRuleGroupId: string;
  TierId: string;
  FirewallRule: FirewallRule;
  NetworkObjects: NetworkObject[];
  NetworkObjectGroups: NetworkObjectGroup[];
  ServiceObjects: ServiceObject[];
  ServiceObjectGroups: ServiceObjectGroup[];
  Zones: Zone[];
  ModalMode: ModalMode;
  GroupType: FirewallRuleGroupTypeEnum;
}
