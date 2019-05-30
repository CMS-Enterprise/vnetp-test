import { SolarisVariable } from "./solaris-ldom";

export class SolarisCdom {
  name: string;
  customer_name: string;
  devicetype: string;
  make: string;
  location: string;

  // Storage
  /** Virtual Disks */
  vds = new Array<any>();

  // Networking
  /** Virtual Network */
  vnet: string;
  /** VLANs */
  vlans = new Array<number>();
  /** Virtual Switch */
  vsw: string;
  // Related to Logical Interface from Network Module.
  net_device: string;

  /** Variables */
  variables: Array<SolarisVariable>;

  // Virtual Console
  /** Virtual Console Concentrator */
  vcc: string;
  /** Virtual Console Concentrator Name */
  vccname: string;
  /** Virtual Console Concentrator Ports */
  vccports: string;

  // Compute
  /** Virtual CPU */
  vcpu: number;
  /** Memory in GB */
  memory: number;

  /** Associated LDOMs */
  associatedldoms = new Array<string>();

  // TODO: Do we need these??
  // ilomname: string;
  // ilomipaddress: string;

  /** Virtual Devices */
  vcsdevs: string; // TODO: Is this valid?
}

export interface SolarisCdomResponse {
  total_count: number;
  offset: number;
  limit: number;
  Devices: SolarisCdom[];
}

export interface KeyValuePair {
  key: string;
  value: any;
}
