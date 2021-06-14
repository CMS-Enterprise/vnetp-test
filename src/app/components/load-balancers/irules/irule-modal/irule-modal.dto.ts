import { LoadBalancerIrule } from 'client';

export interface IRuleModalDto {
  tierId: string;
  iRule?: LoadBalancerIrule;
}
