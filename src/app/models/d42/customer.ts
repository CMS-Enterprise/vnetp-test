import { Vrf } from './vrf';

export class Customer {
  id: number;

  name: string;

  vrfs?: Array<Vrf>;
}

export interface CustomerResponse {
  total_count: number;
  offset: number;
  limit: number;
  Customers: Customer[];
}
