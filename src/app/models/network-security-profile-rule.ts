export class NetworkSecurityProfileRule {
    Id: number;

    Name: string;

    Description: string;

    Action: number;

    Protocol: number;

    Direction: number;

    DestinationIP: string;

    DestinationObject: string;

    DestinationObjectGroup: string;

    DestinationPorts: string;

    DestinationServiceGroup: string;

    SourceIP: string;

    SourceObject: string;

    SourceObjectGroup: string;

    SourcePorts: string;

    SourceServiceGroup: string;

    Log: boolean;

    Edit: boolean;

    Deleted: boolean;

    Updated: boolean;
}
