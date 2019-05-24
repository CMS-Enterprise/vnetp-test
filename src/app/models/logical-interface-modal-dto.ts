import { LogicalInterface } from './network/logical-interface';
import { PhysicalInterface } from './network/physical-interface';
import { Subnet } from './d42/subnet';

export class LogicalInterfaceModalDto {

    LogicalInterface: LogicalInterface;

    Subnets: Array<Subnet>;

    PhysicalInterfaces: Array<PhysicalInterface>;
}
