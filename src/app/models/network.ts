import { NetworkAdapter } from './network-adapter';
import { NetworkSecurityProfile } from './network-security-profile';
import { Project } from './project';

export class Network {
    Id: number;

    Name: string;

    NetworkAddress: string;

    SubnetMask: string;

    SubnetMaskBits: number;

    VlanId: number;

    NetworkAdapters: Array<NetworkAdapter>;

    NetworkSecurityProfileId: number;

    NetworkSecurityProfile: NetworkSecurityProfile;

    ProjectId: number;

    Project: Project;
}
