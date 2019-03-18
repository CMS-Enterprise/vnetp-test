
import { NetworkSecurityProfileRule } from './network-security-profile-rule';

export class UserDefinedRoute {

    Index: number;

    NextHop: string;

    Rules: Array<NetworkSecurityProfileRule>;
}
