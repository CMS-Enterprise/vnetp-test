import { LoadBalancerHealthMonitor, LoadBalancerPool } from 'api_client';

export class PoolModalDto {
  Pool: LoadBalancerPool;

  HealthMonitors: LoadBalancerHealthMonitor[];
}
