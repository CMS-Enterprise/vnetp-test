import { UniqueNameObject } from '../interfaces/unique-name-object.interface';
import { NetworkObjectInterface } from 'model/models';

export class NetworkObject implements NetworkObjectInterface {
  name: string;
  description?: string;
  type: string;
  ipAddress: string;
  endIpAddress: string;
  tierId: string;
}
