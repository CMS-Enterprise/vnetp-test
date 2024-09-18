import { EndpointSecurityGroup, Selector } from 'client';
import { ModalMode } from '../other/modal-mode';

export class SelectorModalDto {
  modalMode: ModalMode;
  selctor?: Selector;
}
