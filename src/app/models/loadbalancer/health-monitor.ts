import { LoadBalancerHealthMonitorType } from 'api_client';

export class HealthMonitor {
  name: string;
  description: string;
  type: LoadBalancerHealthMonitorType;
  servicePort: number;
  interval: number;
  timeout: number;
}
