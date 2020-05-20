import { LoadBalancerHealthMonitor, LoadBalancerPool, LoadBalancerNode } from 'api_client';
import { Pool } from './pool';
import { ModalMode } from '../other/modal-mode';

export class PoolModalDto {
  pool: LoadBalancerPool;

  healthMonitors: LoadBalancerHealthMonitor[];

  nodes: LoadBalancerNode[];

  ModalMode: ModalMode;

  TierId: string;
}
