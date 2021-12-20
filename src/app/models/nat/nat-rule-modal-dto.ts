import { ModalMode } from 'src/app/models/other/modal-mode';
import { NatRule, NetworkObject, NetworkObjectGroup, ServiceObject } from '../../../../client';

export class NatRuleModalDto {
  tierId: string;
  modalMode: ModalMode;
  natRuleGroupId: string;
  ruleIndex: number;
  description: string;

  // todo: Use generated types from api_client
  natRule: NatRule;
  NetworkObjects: NetworkObject[];
  NetworkObjectGroups: NetworkObjectGroup[];
  ServiceObjects: ServiceObject[];
}
