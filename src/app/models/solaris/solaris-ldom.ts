import { SolarisVariable } from './solaris-variable';
import { CustomField } from '../interfaces/custom-fields-object.interface';
import { SolarisCdom } from './solaris-cdom';
import { SolarisVnic } from './solaris-vnic';
import { SolarisImage } from './solaris-image';
export class SolarisLdom {
  public custom_fields: Array<CustomField>;
  name: string;
  device_id: string;
  customer_name: string;
  devicetype: string;

  /** CDOM that LDOM is assigned to. */
  associatedcdom: SolarisCdom;

  // Compute
  /** Virtual CPU */
  vcpu: number;
  /** Memory in GB */
  memory: number;

  /** Net Install */
  net_install: boolean;

  /** Assigned vNics */
  vnic = new Array<SolarisVnic>();

  /** Solaris Variables */
  variables: Array<SolarisVariable>;

  // TODO: Is this neeeded?
  // create_manifest: string;
  // add_vds_cmd = new Array<string>();
  // add_vdisk_cmd = new Array<string>();
  // add_vnic_cmd = new Array<string>();

  // TODO: Review with Praveen
  add_vdsdev: string;
  add_vdisk = new Array<string>();
  vds = new Array<any>();

  /** D42 Property for Parent */
  virtual_host_name: string;

  //** Boot image information */
  solarisImage = new SolarisImage();
}



