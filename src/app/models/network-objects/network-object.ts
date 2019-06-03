import { UniqueNameObject } from '../interfaces/unique-name-object.interface';

export class NetworkObject implements UniqueNameObject {
    Name: string;

    Type: string;

    IpVersion: string;

    CidrAddress: string;

    HostAddress: string;

    StartAddress: string;

    EndAddress: string;
}