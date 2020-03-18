import { LoadBalancerPool, LoadBalancerIrule, LoadBalancerVirtualServer } from 'api_client';
import { ModalMode } from '../other/modal-mode';

export class VirtualServerModalDto {
  Pools: LoadBalancerPool[];

  IRules: LoadBalancerIrule[];

  VirtualServer: LoadBalancerVirtualServer;

  TierId: string;

  ModalMode: ModalMode;
}
