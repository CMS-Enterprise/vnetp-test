import { LoadBalancerPool, LoadBalancerIrule } from 'api_client';

export class VirtualServer {
  name: string;
  type: string;
  description: string;
  sourceIpAddress: string;
  destinationIpAddress: string;
  servicePort: number;
  defaultPoolId: string;
  defaultPool: LoadBalancerPool;
  irules: LoadBalancerIrule[];
}
