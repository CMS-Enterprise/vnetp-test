import { isUndefined } from 'util';

export class NetworkAdapter {

    constructor(name?: string) {
        if (!isUndefined(name)) {
            this.Name = name;
        }
    }

    Id: number;
    Name: string;
    IpAddress: string;
    NetworkId: number;
    VirtualMachineId: number;
}
