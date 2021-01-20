import { LoadBalancerVlan } from 'api_client';

export interface VlanModalDto {
  tierId: string;
  vlan?: LoadBalancerVlan;
}
