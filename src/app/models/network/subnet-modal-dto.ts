import { ModalMode } from '../other/modal-mode';
import { Subnet, Vlan } from 'api_client';

export class SubnetModalDto {
  TierId: string;
  Subnet: Subnet;
  Vlans: Vlan[];
  ModalMode: ModalMode;
}
