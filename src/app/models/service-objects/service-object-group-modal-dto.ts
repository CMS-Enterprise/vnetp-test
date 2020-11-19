import { ServiceObjectGroup } from 'api_client';
import { ModalMode } from '../other/modal-mode';

export class ServiceObjectGroupModalDto {
  TierId: string;
  ServiceObjectGroup: ServiceObjectGroup;
  ModalMode: ModalMode;
}
