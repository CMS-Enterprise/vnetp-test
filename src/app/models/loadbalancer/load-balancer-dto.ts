import { Pool } from './pool';
import { VirtualServer } from './virtual-server';

export class LoadBalancerDto {
    Pools: Pool;

    VirtualServer: Array<VirtualServer>;
}
