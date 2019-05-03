export class SolarisCdom {
  Name: string;
  Make: string;
  Location: string;
  IPAddress: string;
  Memory: number;
  CPU: number;
  LUNs = new Array<string>();
  VLANs = new Array<number>();
  AssociatedLDOMS = new Array<string>();
  VCC: string;
  VCSDevs: string;
  Vswitch: string;
  VNet: string;
  ILOMName: string;
  ILOMIPAddress: string;
  Variables: string;
  Commands: string;
}

