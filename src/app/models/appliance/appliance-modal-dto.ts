import { Appliance } from 'api_client';
import { ModalMode } from '../other/modal-mode';

export class ApplianceModalDto {
  Appliance: Appliance;
  ModalMode: ModalMode;
  DatacenterId: string;
}
