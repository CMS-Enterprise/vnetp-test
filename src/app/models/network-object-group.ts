import { NetworkObject } from './network-object';
import { UniqueNameObject } from './unique-name-object.interface';

export class NetworkObjectGroup implements UniqueNameObject {
    Name: string;

    Description: string;

    NetworkObjects: Array<NetworkObject>;
}
