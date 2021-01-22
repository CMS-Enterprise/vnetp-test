import { LoadBalancerPool } from 'api_client';

export interface PoolModalDto {
  tierId: string;
  pool?: LoadBalancerPool;
}
