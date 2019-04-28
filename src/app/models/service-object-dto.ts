import { ServiceObject } from './Service-object';
import { ServiceObjectGroup } from './Service-object-group';

// Orphaned service objects and parent/child groups with object
// members are stored in two seperate arrays.
export class ServiceObjectDto {
    ServiceObjects: Array<ServiceObject>;

    ServiceObjectGroups: Array<ServiceObjectGroup>;
}