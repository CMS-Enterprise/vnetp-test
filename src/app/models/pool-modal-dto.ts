import { HealthMonitor } from './loadbalancer/health-monitor';
import { Pool } from './loadbalancer/pool';

export class PoolModalDto {
    Pool: Pool;

    HealthMonitors: Array<HealthMonitor>;
}
