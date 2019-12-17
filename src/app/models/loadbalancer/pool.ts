import { LoadBalancerHealthMonitor, LoadBalancerPool, Tier } from 'api_client';

export class Pool {
  name: string;
  description: string;
  loadBalancingMethod: string;
  healthMonitors: LoadBalancerHealthMonitor[];
  nodes: LoadBalancerPool[];
  servicePort: number;
  tierId: string;
  tier: Tier;
}
