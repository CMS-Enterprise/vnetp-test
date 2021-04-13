import { ModalMode } from 'src/app/models/other/modal-mode';
import { NatRule } from '../../../../../api_client';

export class NatRuleModalDto {
  tierId: string;
  modalMode: ModalMode;

  // todo: Use generated types from api_client
  natRule: NatRule;
}
