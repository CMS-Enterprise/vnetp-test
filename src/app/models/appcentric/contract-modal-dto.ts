import { Contract } from 'client';
import { ModalMode } from '../other/modal-mode';

export class ContractModalDto {
  modalMode: ModalMode;
  contract: Contract;
}
