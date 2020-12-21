import { LoadBalancerVirtualServer } from 'api_client';

export interface VirtualServerModalDto {
  tierId: string;
  virtualServer?: LoadBalancerVirtualServer;
}
