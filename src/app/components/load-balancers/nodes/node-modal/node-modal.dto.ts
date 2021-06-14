import { LoadBalancerNode } from 'client';

export interface NodeModalDto {
  tierId: string;
  node?: LoadBalancerNode;
}
