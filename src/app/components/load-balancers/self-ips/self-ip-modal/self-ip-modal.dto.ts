import { LoadBalancerSelfIp } from 'client';

export interface SelfIpModalDto {
  tierId: string;
  selfIp?: LoadBalancerSelfIp;
}
