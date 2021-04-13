import { ModalMode } from 'src/app/models/other/modal-mode';
import { NatRuleGroup } from '../../../../../api_client';

export class NatRuleGroupModalDto {
  tierId: string;
  modalMode: ModalMode;

  // todo: Use generated types from api_client
  natRuleGroup: NatRuleGroup;
}
