import { HealthMonitor } from './health-monitor';
import { Pool } from './pool';

export class PoolModalDto {
  Pool: Pool;

  HealthMonitors: Array<HealthMonitor>;
}
