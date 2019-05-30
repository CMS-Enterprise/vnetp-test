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

  // Network Info
  /** IP Address */
  bip: string;
  /** Netmask */
  bmask: string;
  /** Gateway */
  bgw: string;
 /** Assigned vNets */
  vnet = new Array<string>();

  // TODO: Is this neeeded?
  // create_manifest: string;
  // add_vds_cmd = new Array<string>();
  // add_vdisk_cmd = new Array<string>();
  // add_vnet_cmd = new Array<string>();

  // TODO: Review with Praveen
  add_vdsdev: string;
  add_vdisk = new Array<string>();
  vds = new Array<any>();

  /** Solaris Variables */
  variables: Array<SolarisVariable>;
}

export interface SolarisLdomResponse {
  total_count: number;
  offset: number;
  limit: number;
  Devices: SolarisLdom[];
}

export class SolarisVariable implements KeyValuePair {
  key: string;
  value: string;
}
