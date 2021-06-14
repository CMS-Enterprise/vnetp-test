import { LoadBalancerPolicy } from 'client';

export interface PolicyModalDto {
  tierId: string;
  policy?: LoadBalancerPolicy;
}
