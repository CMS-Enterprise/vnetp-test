import { SolarisVariable } from './solaris-variable';

export class SolarisLdom {
  name: string;
  device_id: string;
  customer_name: string;
  devicetype: string;

  /** CDOM that LDOM is assigned to. */
  associatedcdom: string;

  // Compute
  /** Virtual CPU */
  vcpu: number;
  /** Memory in GB */
  memory: number;

  /** Net Install */
  net_install: boolean;

  /** Assigned vNets */
  vnet = new Array<string>();

  /** Solaris Variables */
  variables: Array<SolarisVariable>;

  // TODO: Is this neeeded?
  // create_manifest: string;
  // add_vds_cmd = new Array<string>();
  // add_vdisk_cmd = new Array<string>();
  // add_vnet_cmd = new Array<string>();

  // TODO: Review with Praveen
  add_vdsdev: string;
  add_vdisk = new Array<string>();
  vds = new Array<any>();
}



