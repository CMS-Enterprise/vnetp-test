import { Selector } from 'client';
import { ModalMode } from '../other/modal-mode';

export class SelectorModalDto {
  modalMode: ModalMode;
  selector?: Selector;
}
