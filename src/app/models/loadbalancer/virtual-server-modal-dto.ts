import {
  LoadBalancerPool,
  LoadBalancerIrule,
  LoadBalancerVirtualServer,
} from 'api_client';

export class VirtualServerModalDto {
  Pools: LoadBalancerPool[];

  IRules: LoadBalancerIrule[];

  // Is this right?
  VirtualServer: LoadBalancerVirtualServer;
}
