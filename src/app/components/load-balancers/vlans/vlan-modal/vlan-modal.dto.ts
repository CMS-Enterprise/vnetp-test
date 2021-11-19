import { LoadBalancerVlan } from 'client';

export interface VlanModalDto {
  tierId: string;
  vlan?: LoadBalancerVlan;
}
