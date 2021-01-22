import { LoadBalancerPolicy } from 'api_client';

export interface PolicyModalDto {
  tierId: string;
  policy?: LoadBalancerPolicy;
}
