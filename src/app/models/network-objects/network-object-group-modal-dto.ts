import { NetworkObjectGroup } from 'api_client';
import { ModalMode } from '../other/modal-mode';

export class NetworkObjectGroupModalDto {
  TierId: string;
  NetworkObjectGroup: NetworkObjectGroup;
  ModalMode: ModalMode;
}
