import { UniqueNameObject } from '../interfaces/unique-name-object.interface';

export class FirewallRule implements UniqueNameObject {
    Id: number;

    Name: string;

    Description: string;

    Action: number;

    Protocol: number;

    Direction: string;

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
}
