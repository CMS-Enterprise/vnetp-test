import { ModalMode } from 'src/app/models/other/modal-mode';

export class NatRuleModalDto {
  tierId: string;
  modalMode: ModalMode;

  // todo: Use generated types from api_client
  natRule: any;
}
