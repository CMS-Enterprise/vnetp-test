import { PoolMember } from './pool-member';

export class Pool {
    Name: string;

    LoadBalancingMethod: string;

    HealthMonitors: Array<string>; // TODO: Refactor

    Members: Array<PoolMember>;
}
