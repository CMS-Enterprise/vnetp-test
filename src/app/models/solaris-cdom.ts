export class SolarisCdom {
  name: string;
  customer_name: string;
  devicetype: string;
  make: string;
  location: string;
  luns = new Array<string>();
  vlans = new Array<number>();
  associatedldoms = new Array<string>();
  vccports: string;
  vccname: string;
  vcsdevs: string;
  vswitch: string;
  vnet: string;
  ilomname: string;
  ilomipaddress: string;
  variables: string;
  
  vds = new Array<string>();
  vcc: string;
  vsw: string;
  config: string;

  /** Virtual CPU */
  vcpu: number;
  /** Memory in GB */
  mem: string;

  // Related to Logical Interface from Network Module.
  net_device: string;
}

export interface SolarisCdomResponse {
    total_count: number;
    offset: number;
    limit: number;
    Devices: SolarisCdom[];
}

