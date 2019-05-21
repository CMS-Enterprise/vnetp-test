import { Pool } from './pool';
import { VirtualServer } from './virtual-server';
import { IRule } from './irule';

export class LoadBalancerDto {
    Pools: Array<Pool>;

    VirtualServers: Array<VirtualServer>;

    VrfId: number;

    IRules: Array<IRule>;
}
