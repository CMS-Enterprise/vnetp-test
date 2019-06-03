import { UniqueNameObject } from './interfaces/unique-name-object.interface';

export class ServiceObject implements UniqueNameObject {
    Name: string;

    Type: string;

    SourcePort: string;

    DestinationPort: string;
}