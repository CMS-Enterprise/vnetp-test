import { SelfServiceModalInterface } from './self-service-modal-interface-dto';
import { SelfServiceModalInterfaceMatrix } from './self-service-modal-interface-matrix-dto';

export interface SelfServiceModalHostWithInterfaces {
  hostname: string;
  interfaces: SelfServiceModalInterface[];
  interfaceMatrix?: SelfServiceModalInterfaceMatrix;
  namespace?: string;
  hostnameIndex?: number;
  range?: { min: number; max: number };
}
