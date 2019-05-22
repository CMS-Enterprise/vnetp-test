import { Pool } from './loadbalancer/pool';
import { VirtualServer } from './loadbalancer/virtual-server';
import { IRule } from './loadbalancer/irule';

export class VirtualServerModalDto {
    Pools: Array<Pool>;

    IRules: Array<IRule>;

    VirtualServer: VirtualServer;
}
