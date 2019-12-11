import { Subnet } from '../d42/subnet';
import { NetworkObject } from './network-object';

export class NetworkObjectModalDto {
  TierId: string;

  Subnets: Array<Subnet>;

  NetworkObject: NetworkObject;
}
