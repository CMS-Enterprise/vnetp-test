import { UniqueNameObject } from '../interfaces/unique-name-object.interface';

export class NetworkObject {
  name: string;
  description?: string;
  type: string;
  ipAddress: string;
  endIpAddress: string;
  tierId: string;
}
