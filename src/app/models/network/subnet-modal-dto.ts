import { ModalMode } from '../other/modal-mode';
import { GetManyVlanResponseDto, Subnet } from 'client';

export class SubnetModalDto {
  TierId: string;
  Subnet: Subnet;
  Vlans: GetManyVlanResponseDto;
  ModalMode: ModalMode;
}
