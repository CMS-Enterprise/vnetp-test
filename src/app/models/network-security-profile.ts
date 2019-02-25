import { NetworkSecurityProfileRule } from './network-security-profile-rule';
import { Network } from './network';

export class NetworkSecurityProfile {
    Id: number;

    Name: string;

    Networks = new Array<Network>();

    NetworkSecurityProfileRules = new Array<NetworkSecurityProfileRule>();
}
