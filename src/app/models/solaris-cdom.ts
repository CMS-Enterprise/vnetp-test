export class SolarisCdom {
  name: string;
  make: string;
  location: string;
  IPAddress: string;
  ram: number;
  ram_size_type: string;
  vcpu: number;
  cpucount: number;
  cpucore: number;
  luns = new Array<string>();
  vlans = new Array<number>();
  associatedldoms = new Array<string>();
  vcc: string;
  vcsdevs: string;
  vswitch: string;
  vnet: string;
  ilomname: string;
  ilomipaddress: string;
  variables: string;
  commands: string;
}

