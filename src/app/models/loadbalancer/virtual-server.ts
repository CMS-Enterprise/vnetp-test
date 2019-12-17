import { LoadBalancerPool, LoadBalancerIrule } from 'api_client';

export class VirtualServer {
  name: string;
  description: string;
  sourceIpAddress: string;
  destinationIpAddress: string;
  defaultPoolId: string;
  defaultPool: LoadBalancerPool;
  irules: LoadBalancerIrule[];
}
