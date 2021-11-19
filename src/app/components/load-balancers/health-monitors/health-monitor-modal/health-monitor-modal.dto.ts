import { LoadBalancerHealthMonitor } from 'client';

export interface HealthMonitorModalDto {
  tierId: string;
  healthMonitor?: LoadBalancerHealthMonitor;
}
