import { ServiceObject } from './service-object';
import { UniqueNameObject } from './unique-name-object.interface';

export class ServiceObjectGroup implements UniqueNameObject {
    Name: string;

    Description: string;

    ServiceObjects: Array<ServiceObject>;
}
