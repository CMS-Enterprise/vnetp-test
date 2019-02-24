export class NetworkSecurityProfileRule {
    Id: number;

    Protocol: number;

    Direction: number;

    SourcePorts: string;

    DestinationPorts: string;

    SourceIP: string;

    DestinationIP: string;

    NetworkSecurityProfileId: number;

    ProjectId: number;
}
