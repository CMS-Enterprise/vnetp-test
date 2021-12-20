import { ServiceObject } from 'client';
import { ModalMode } from '../other/modal-mode';

export class ServiceObjectModalDto {
  TierId: string;
  ServiceObject: ServiceObject;
  ModalMode: ModalMode;
}
