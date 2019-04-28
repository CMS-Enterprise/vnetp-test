import { NetworkObject } from './network-object';
import { NetworkObjectGroup } from './network-object-group';

// Orphaned network objects and parent/child groups with object
// members are stored in two seperate arrays.
export class NetworkObjectDto {
    NetworkObjects: Array<NetworkObject>;

    NetworkObjectGroups: Array<NetworkObjectGroup>;
}