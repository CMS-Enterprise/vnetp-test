import { LoadBalancerProfile } from 'client';

export interface ProfileModalDto {
  tierId: string;
  profile?: LoadBalancerProfile;
}
