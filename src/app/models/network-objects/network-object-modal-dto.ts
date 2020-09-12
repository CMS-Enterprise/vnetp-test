import { NetworkObject } from 'api_client';
import { ModalMode } from '../other/modal-mode';

export class NetworkObjectModalDto {
  TierId: string;
  NetworkObject: NetworkObject;
  ModalMode: ModalMode;
}
