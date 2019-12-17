import {
  LoadBalancerPool,
  LoadBalancerVirtualServer,
  LoadBalancerIrule,
  LoadBalancerHealthMonitor,
} from 'api_client';

export class LoadBalancerDto {
  Pools: LoadBalancerPool[];

  VirtualServers: LoadBalancerVirtualServer[];

  VrfId: string;

  IRules: LoadBalancerIrule[];

  HealthMonitors: LoadBalancerHealthMonitor[];
}
