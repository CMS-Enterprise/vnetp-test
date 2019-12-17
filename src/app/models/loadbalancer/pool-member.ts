import { LoadBalancerNodeType, Tier } from 'api_client';

export class PoolMember {
  name: string;
  description: string;
  type: LoadBalancerNodeType;
  ipAddress: string;
  fqdn: string;
  // do you want to add this to API?
  servicePort: number;
  priority: number;

  autoPopulate: boolean;
  tier: Tier;
  tierId: string;
}
