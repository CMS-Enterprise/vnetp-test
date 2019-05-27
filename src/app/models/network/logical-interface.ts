import { PhysicalInterface } from './physical-interface';

export class LogicalInterface {
    Name: string;

    Description: string;


    // Array of strings for now.
    NativeSubnet: string;

    TaggedSubnets: Array<string>;

    PhysicalInterfaces: Array<string>;
}
