import { LoadBalancerPool } from 'client';

export interface PoolModalDto {
  tierId: string;
  pool?: LoadBalancerPool;
}
