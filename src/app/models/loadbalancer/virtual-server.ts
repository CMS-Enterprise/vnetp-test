import { IRule } from './irule';

export class VirtualServer {
    Name: string;

    Description: string;

    SourceAddress: string;

    DestinationAddress: string;

    ServicePort: string;

    Type: string;

    Pool: string;

    IRules: Array<string>;
}
