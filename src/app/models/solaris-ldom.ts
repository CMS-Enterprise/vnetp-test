export class SolarisLdom {
    name: string;
    devicetype: string;
    ram: number;
    ram_size_type: string;
    cpucount: number;
    cpucore: number;
    vcpu: number;
    luns = new Array<string>();
    vlans = new Array<number>();
    associatedcdom: string;
    variables: string;
    vcsdevs: string;
    vswitch: string;
    vnet: string;
    Commands: string;
}
