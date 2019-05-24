import { LogicalInterface } from './logical-interface';
import { PhysicalInterface } from './physical-interface';

export class NetworkInterfacesDto {
    LogicalInterfaces: Array<LogicalInterface>;

    PhysicalInterfaces: Array<PhysicalInterface>;

    VrfId: number;
}
