import { LoadBalancerPolicy } from 'api_client';
import { ModalMode } from '../other/modal-mode';

export class PolicyModalDto {
  TierId: string;

  Policy: LoadBalancerPolicy;

  ModalMode: ModalMode;
}
