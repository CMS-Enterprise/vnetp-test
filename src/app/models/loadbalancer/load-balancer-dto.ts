import { Pool } from './pool';
import { VirtualServer } from './virtual-server';
import { IRule } from './irule';
import { HealthMonitor } from './health-monitor';
import {
  LoadBalancerPool,
  LoadBalancerVirtualServer,
  LoadBalancerIrule,
  LoadBalancerHealthMonitor,
} from 'api_client';

export class LoadBalancerDto {
  Pools: LoadBalancerPool[];

  VirtualServers: LoadBalancerVirtualServer[];

  VrfId: number;

  IRules: LoadBalancerIrule[];

  HealthMonitors: LoadBalancerHealthMonitor[];
}
