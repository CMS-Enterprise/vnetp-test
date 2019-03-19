import { NetworkSecurityProfile } from './network-security-profile';

export class Network {
    Id: number;

    Name: string;

    NetworkAddress: string;

    SubnetMask: string;

    SubnetMaskBits: number;

    VlanId: number;

    NetworkSecurityProfileId: number;

    NetworkSecurityProfile: NetworkSecurityProfile;
}
