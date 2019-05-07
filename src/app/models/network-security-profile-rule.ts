import { NetworkObjectGroup } from './network-object-group';
import { ServiceObject } from './service-object';
import { NetworkObject } from './network-object';
import { ServiceObjectGroup } from './service-object-group';

export class NetworkSecurityProfileRule {
    Id: number;

    Name: string;

    Description: string;

    Action: number;

    Protocol: number;

    Direction: number;

    SourceIP: string;

    SourceNetworkObject: NetworkObject;

    SourceNetworkObjectGroup: NetworkObjectGroup;

    SourcePorts: string;

    SourceServiceObject: ServiceObject;

    SourceServiceObjectGroup: ServiceObjectGroup;

    DestinationIP: string;

    DestinationNetworkObject: NetworkObject;

    DestinationNetworkObjectGroup: NetworkObjectGroup;

    DestinationPorts: string;

    DestinationServiceObject: ServiceObject;

    DestinationServiceObjectGroup: ServiceObjectGroup;

    Log: boolean;

    Edit?: boolean;

    Deleted?: boolean;

    Updated?: boolean;
}
