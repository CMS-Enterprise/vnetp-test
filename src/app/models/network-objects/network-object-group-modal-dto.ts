import { Subnet } from '../d42/subnet';
import { NetworkObjectGroup } from './network-object-group';

export class NetworkObjectGroupModalDto {
    Subnets: Array<Subnet>;

    NetworkObjectGroup: NetworkObjectGroup;
}
