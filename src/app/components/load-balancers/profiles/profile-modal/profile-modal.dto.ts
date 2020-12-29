import { LoadBalancerProfile } from 'api_client';

export interface ProfileModalDto {
  tierId: string;
  profile?: LoadBalancerProfile;
}
