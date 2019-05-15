import { PoolMember } from './pool-member';

export class Pool {
    Name: string;

    LoadBalanceMethod: string;

    Members: Array<PoolMember>;
}
