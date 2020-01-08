import {
  LoadBalancerHealthMonitor,
  LoadBalancerPool,
  Tier,
  LoadBalancerNode,
} from 'api_client';

export class Pool {
  name: string;
  description?: string;
  loadBalancingMethod: any;
  healthMonitors: LoadBalancerHealthMonitor[];
  nodes: LoadBalancerNode[];
  servicePort: number;
  tier: Tier;
  tierId: string;
}
