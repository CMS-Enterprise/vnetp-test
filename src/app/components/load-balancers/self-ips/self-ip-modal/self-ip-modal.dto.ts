import { LoadBalancerSelfIp } from 'api_client';

export interface SelfIpModalDto {
  tierId: string;
  selfIp?: LoadBalancerSelfIp;
}
