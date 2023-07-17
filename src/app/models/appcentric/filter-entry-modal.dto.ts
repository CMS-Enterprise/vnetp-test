import { FilterEntry } from 'client';
import { ModalMode } from '../other/modal-mode';

export class FilterEntryModalDto {
  modalMode: ModalMode;
  filterEntry: FilterEntry;
  filterId: string;
}
