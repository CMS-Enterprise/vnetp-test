import { ServiceObjectGroup } from 'client';
import { ModalMode } from '../other/modal-mode';

export class ServiceObjectGroupModalDto {
  TierId: string;
  ServiceObjectGroup: ServiceObjectGroup;
  ModalMode: ModalMode;
}
