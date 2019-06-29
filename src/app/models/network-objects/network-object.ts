import { UniqueNameObject } from '../interfaces/unique-name-object.interface';

// TODO: Add destination subnet (source would be FW interface towards ACI L3 Out)
export class NetworkObject implements UniqueNameObject {
  Name: string;

  Type: string;

  IpVersion: string;

  CidrAddress: string;

  HostAddress: string;

  StartAddress: string;

  SourceSubnet: any;

  DestinationSubnet: any;

  Nat: boolean;

  TranslatedIpAddress: string;

  NatService: boolean;

  NatProtocol: string;

  SourcePort: string;

  TranslatedPort: string;

  EndAddress: string;
}
