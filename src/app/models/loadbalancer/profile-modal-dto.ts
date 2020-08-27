import { LoadBalancerProfile } from 'api_client';
import { ModalMode } from '../other/modal-mode';

export class ProfileModalDto {
  TierId: string;

  Profile: LoadBalancerProfile;

  ModalMode: ModalMode;
}
