import { ModalMode } from '../other/modal-mode';
import { Subnet, Vlan } from 'client';

export class SubnetModalDto {
  TierId: string;
  Subnet: Subnet;
  Vlans: Vlan[];
  ModalMode: ModalMode;
}
