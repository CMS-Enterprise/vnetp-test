import { Pool } from './loadbalancer/pool';
import { VirtualServer } from './loadbalancer/virtual-server';

export class VirtualServerModalDto {
    Pools: Array<Pool>;

    VirtualServer: VirtualServer;

    // TODO: IRules: Array<IRule>;
}
