import { LoadBalancerRoute } from 'api_client';

export interface RouteModalDto {
  tierId: string;
  route?: LoadBalancerRoute;
}
