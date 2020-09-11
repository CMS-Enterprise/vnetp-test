import { ModalMode } from '../other/modal-mode';
import { Vlan } from 'api_client';

export class VlanModalDto {
  TierId: string;
  Vlan: Vlan;
  ModalMode: ModalMode;
}
