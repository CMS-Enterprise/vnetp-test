import { LoadBalancerNodeType } from 'api_client';

export const nodeTypeLookup: Record<LoadBalancerNodeType, string> = {
  [LoadBalancerNodeType.Fqdn]: 'FQDN',
  [LoadBalancerNodeType.IpAddress]: 'IP Address',
};
