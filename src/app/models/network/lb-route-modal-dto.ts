import { ModalMode } from '../other/modal-mode';
import { LoadBalancerRoute } from 'api_client';

export class LoadBalancerRouteModalDto {
  TierId: string;
  Route: LoadBalancerRoute;
  ModalMode: ModalMode;
}
