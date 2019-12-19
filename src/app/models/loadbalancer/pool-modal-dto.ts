import { LoadBalancerHealthMonitor, LoadBalancerPool } from 'api_client';
import { Pool } from './pool';

export class PoolModalDto {
  pool: LoadBalancerPool;

  healthMonitors: LoadBalancerHealthMonitor[];
}
