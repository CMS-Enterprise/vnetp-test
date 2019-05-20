import { Pool } from './pool';
import { VirtualServer } from './virtual-server';

export class LoadBalancerDto {
    Pools: Array<Pool>;

    VirtualServers: Array<VirtualServer>;

    VrfId: number;
}
