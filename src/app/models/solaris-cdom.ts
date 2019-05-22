export class SolarisCdom {
  name: string;
  customer_name: string;
  devicetype: string;
  make: string;
  location: string;
  set_vcpu: number;
  set_mem: string;
  add_config: string;
  luns = new Array<string>();
  vlans = new Array<number>();
  associatedldoms = new Array<string>();
  vccports: string;
  vccname: string;
  add_vcc: string;
  add_vsw = new Array<string>();
  vcsdevs: string;
  vswitch: string;
  vnet: string;
  ilomname: string;
  ilomipaddress: string;
  variables: string;
  add_vds = new Array<string>();
}

