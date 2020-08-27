import { Tier } from 'api_client';

export class IRule {
  name: string;
  description: string;
  content: string;
  tierId: string;
  tier: Tier;
}
