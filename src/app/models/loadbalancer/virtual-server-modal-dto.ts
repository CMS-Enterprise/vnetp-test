import { Pool } from './pool';
import { VirtualServer } from './virtual-server';
import { IRule } from './irule';

export class VirtualServerModalDto {
    Pools: Array<Pool>;

    IRules: Array<IRule>;

    VirtualServer: VirtualServer;
}
