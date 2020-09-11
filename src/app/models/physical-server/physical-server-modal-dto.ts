import { PhysicalServer } from 'api_client';
import { ModalMode } from '../other/modal-mode';

export class PhysicalServerModalDto {
  PhysicalServer: PhysicalServer;
  DatacenterId: string;
  ModalMode: ModalMode;
}
