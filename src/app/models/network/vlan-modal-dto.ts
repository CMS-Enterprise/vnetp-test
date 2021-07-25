import { ModalMode } from '../other/modal-mode';
import { Vlan } from 'client';

export class VlanModalDto {
  TierId: string;
  Vlan: Vlan;
  ModalMode: ModalMode;
}
