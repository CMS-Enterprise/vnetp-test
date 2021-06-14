import { LoadBalancerVirtualServer } from 'client';

export interface VirtualServerModalDto {
  tierId: string;
  virtualServer?: LoadBalancerVirtualServer;
}
