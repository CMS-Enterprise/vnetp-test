import { UniqueNameObject } from '../interfaces/unique-name-object.interface';
import { ServiceObject } from './service-object';


export class ServiceObjectGroup implements UniqueNameObject {
    Name: string;

    Description: string;

    Type: string;

    ServiceObjects: Array<ServiceObject>;
}
