import { LoadBalancerHealthMonitor } from 'api_client';

export interface HealthMonitorModalDto {
  tierId: string;
  healthMonitor?: LoadBalancerHealthMonitor;
}
