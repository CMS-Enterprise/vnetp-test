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

    Edit: boolean;

    Deleted: boolean;

    Updated: boolean;
}
