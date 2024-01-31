import { ModalMode } from 'src/app/models/other/modal-mode';
import { NatRule, NatRuleGroupTypeEnum, NetworkObject, NetworkObjectGroup, ServiceObject, Zone } from '../../../../client';

export class NatRuleModalDto {
  tierId: string;
  modalMode: ModalMode;
  natRuleGroupId: string;
  ruleIndex: number;
  description: string;
  natRule: NatRule;
  NetworkObjects: NetworkObject[];
  NetworkObjectGroups: NetworkObjectGroup[];
  ServiceObjects: ServiceObject[];
  Zones: Zone[];
  GroupType: NatRuleGroupTypeEnum;
}
