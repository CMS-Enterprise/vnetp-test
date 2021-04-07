import { LoadBalancerNode } from 'api_client';

export interface NodeModalDto {
  tierId: string;
  node?: LoadBalancerNode;
}
