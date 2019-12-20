import { LoadBalancerHealthMonitor, LoadBalancerPool } from 'api_client';
import { Pool } from './pool';
import { ModalMode } from '../other/modal-mode';

export class PoolModalDto {
  pool: LoadBalancerPool;

  healthMonitors: LoadBalancerHealthMonitor[];

  ModalMode: ModalMode;

  TierId: string;
}
