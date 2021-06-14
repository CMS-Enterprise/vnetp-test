import { NetworkObjectGroup } from 'client';
import { ModalMode } from '../other/modal-mode';

export class NetworkObjectGroupModalDto {
  TierId: string;
  NetworkObjectGroup: NetworkObjectGroup;
  ModalMode: ModalMode;
}
