import { UniqueNameObject } from './unique-name-object.interface';

export class NetworkObject implements UniqueNameObject {
    Name: string;

    Type: string;

    IpVersion: string;

    CidrAddress: string;

    HostAddress: string;

    StartAddress: string;

    EndAddress: string;

    Nat: boolean;

    TranslatedIpAddress: string;

    NatService: boolean;

    NatProtocol: string;

    SourcePort: string;

    TranslatedPort: string;
}
