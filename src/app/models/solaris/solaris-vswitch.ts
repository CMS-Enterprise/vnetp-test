export class SolarisVswitch {
    vSwitchName: String;
    //array of all untagged/tagged vlan ids
    vlansUntagged: number;
    vlansTagged: Array<number>;
    netDevice: string;
}
