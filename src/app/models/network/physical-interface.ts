export class PhysicalInterface {
    Name: string;

    LogicalInterfaceName: string; // TODO: This would be replaced with an Id.

    Speed: number;

    LeafSwitch: string;

    // TODO: Should users be able to control CDP, LLDP, Duplex, etc?
}
