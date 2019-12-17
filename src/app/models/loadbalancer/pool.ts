import { LoadBalancerHealthMonitor, LoadBalancerPool } from 'api_client';

export class Pool {
  Name: string;

  LoadBalancingMethod: string;

  HealthMonitors: LoadBalancerHealthMonitor[];

  Members: LoadBalancerPool[];
}
