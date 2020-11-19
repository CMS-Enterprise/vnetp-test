import { ModalMode } from '../other/modal-mode';
import { LoadBalancerVlan } from 'api_client';

export class LoadBalancerVlanModalDto {
  TierId: string;
  Vlan: LoadBalancerVlan;
  ModalMode: ModalMode;
}
