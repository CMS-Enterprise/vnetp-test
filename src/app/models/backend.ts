import { NetworkAdapter } from './network-adapter';

export class Backend {
    Id: number;
    Name: string;
    NetworkId: number;
    NetworkAdapters: Array<NetworkAdapter>;
}
