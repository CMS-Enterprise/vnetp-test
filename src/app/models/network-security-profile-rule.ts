export class NetworkSecurityProfileRule {
    Id: number;

    Name: string;

    Description: string;

    Protocol: number;

    Direction: number;

    SourcePorts: string;

    DestinationPorts: string;

    SourceIP: string;

    DestinationIP: string;

    NetworkSecurityProfileId: number;

    ProjectId: number;

    Edit: boolean;
}
