
import { NetworkSecurityProfileRule } from './network-security-profile-rule';

export class UserDefinedRoute {

    NextHop: string;

    Rules: Array<NetworkSecurityProfileRule>;
}
