import { LoadBalancerNode } from 'api_client';
import { ModalMode } from '../other/modal-mode';

export class NodeModalDto {
  node: LoadBalancerNode;

  ModalMode: ModalMode;

  TierId: string;

  PoolId: string;
}
