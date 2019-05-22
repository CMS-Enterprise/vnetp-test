import { HealthMonitor } from './loadbalancer/health-monitor';
import { Pool } from './loadbalancer/pool';

export class PoolModalDto {
    pool: Pool;

    HealthMonitors: Array<HealthMonitor>;
}
