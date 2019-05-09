export class SolarisLdom {
    Name: string;
    Memory: number;
    vCPU: number;
    LUNs = new Array<string>();
    VLANs = new Array<number>();
    AssociatedCDOM: string;
    Variables: string;
    VCSDevs: string;
    Vswitch: string;
    VNet: string;
    Commands: string;
}
