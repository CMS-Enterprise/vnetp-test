import { UniqueNameObject } from '../interfaces/unique-name-object.interface';
import { NetworkObject } from './network-object';

export class NetworkObjectGroup implements UniqueNameObject {
  Name: string;

  Description: string;

  NetworkObjects: Array<NetworkObject>;
}
