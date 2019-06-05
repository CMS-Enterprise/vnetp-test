import { SolarisVariable } from './solaris-variable';
import {SolarisVswitch } from './solaris-vswitch';
import { CustomField } from '../interfaces/custom-fields-object.interface';

export class SolarisCdom {
  public custom_fields: Array<CustomField>;
  name: string;
  customer_name: string;
  devicetype: string;
  make: string;
  location: string;

  // Storage
  /** Virtual Disks */
  vds = new Array<any>();

  /** Indicates whether Alternate VDS should be created. */
  alternatevds: boolean;

  // Networking
  /** Virtual Network */
  vnet: string;
  /** VLANs */
  vlans = new Array<number>();
  /** Virtual Switch */
  vsw: Array<SolarisVswitch>;
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



