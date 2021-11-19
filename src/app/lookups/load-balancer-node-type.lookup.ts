import { LoadBalancerNodeTypeEnum } from 'client';

export const nodeTypeLookup: Record<LoadBalancerNodeTypeEnum, string> = {
  [LoadBalancerNodeTypeEnum.Fqdn]: 'FQDN',
  [LoadBalancerNodeTypeEnum.IpAddress]: 'IP Address',
};
