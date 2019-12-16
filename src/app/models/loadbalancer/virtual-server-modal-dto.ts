import {
  LoadBalancerPool,
  LoadBalancerIrule,
  LoadBalancerVirtualServer,
} from 'api_client';

export class VirtualServerModalDto {
  Pools: LoadBalancerPool[];

  IRules: LoadBalancerIrule[];

  VirtualServer: LoadBalancerVirtualServer;
}
