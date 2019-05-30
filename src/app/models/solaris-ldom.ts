export class SolarisLdom {
    name: string;
    device_id: string;
    customer_name: string;
    devicetype: string;
    associatedcdom: string;
    add_domain: string;
    add_vcpu: number;
    add_memory: string;
    add_vnet = new Array<string>();
    add_vnet_cmd = new Array<string>();
    set_variable: string;
    add_vdsdev: string;
    add_vdisk = new Array<string>();
    add_vdisk_cmd = new Array<string>();
    add_vds = new Array<string>();
    add_vds_cmd = new Array<string>();
    bind_domain: boolean;
    start_domain: boolean;
    net_install: string;
    add_config: string;
    bip: string;
    bmask: string;
    bgw: string;
    create_manifest: string;
    cmds: string;
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