import { PhysicalInterface } from './physical-interface';

export class LogicalInterface {
    Name: string;

    Description: string;

    PhysicalInterfaces: Array<PhysicalInterface>;

    // Array of strings for now.
    NativeSubnet: string;

    TaggedSubnets: Array<string>;
}
