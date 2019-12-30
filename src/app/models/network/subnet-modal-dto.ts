import { ModalMode } from '../other/modal-mode';
import { Subnet } from 'api_client';

export class SubnetModalDto {
  TierId: string;

  Subnet: Subnet;

  ModalMode: ModalMode;
}
