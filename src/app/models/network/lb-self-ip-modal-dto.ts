import { ModalMode } from '../other/modal-mode';
import { LoadBalancerSelfIp } from 'api_client';

export class LoadBalancerSelfIpModalDto {
  TierId: string;

  SelfIp: LoadBalancerSelfIp;

  ModalMode: ModalMode;
}
