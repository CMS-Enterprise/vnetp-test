import { LoadBalancerIrule } from 'api_client';

export interface IRuleModalDto {
  tierId: string;
  iRule?: LoadBalancerIrule;
}
