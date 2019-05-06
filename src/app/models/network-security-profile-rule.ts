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

    SourceNetworkObject: string;

    SourceNetworkObjectGroup: string;

    SourcePorts: string;

    SourceServiceObject: string;

    SourceServiceObjectGroup: string;

    DestinationIP: string;

    DestinationNetworkObject: string;

    DestinationNetworkObjectGroup: string;

    DestinationPorts: string;

    DestinationServiceObject: string;

    DestinationServiceObjectGroup: string;

    Log: boolean;

    // TODO: Refactor
    // When objects are assigned they will be denormalized and attached
    // to these properties. Post-MVP if we migrate to a true RDBMS this
    // won't be required.

    _sourceNetworkObject?: NetworkObject;

    _sourceNetworkObjectGroup?: NetworkObjectGroup;

    _sourceServiceObject?: ServiceObject;

    _sourceServiceObjectGroup?: ServiceObjectGroup;

    _destinationNetworkObject?: NetworkObject;

    _destinationNetworkObjectGroup?: NetworkObjectGroup;

    _destinationServiceObject?: ServiceObject;

    _destinationServiceObjectGroup?: ServiceObjectGroup;

    Edit?: boolean;

    Deleted?: boolean;

    Updated?: boolean;
}
