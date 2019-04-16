export class NetworkSecurityProfileRule {
    Id: number;

    Name: string;

    Description: string;

    Index: number;

    Action: number;

    Protocol: number;

    Direction: number;

    SourcePorts: string;

    DestinationPorts: string;

    SourceIP: string;

    DestinationIP: string;

    NetworkSecurityProfileId: number;

    ProjectId: number;

    Edit: boolean;

    Deleted: boolean;

    Updated: boolean;
}
