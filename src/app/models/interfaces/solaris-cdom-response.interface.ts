import { SolarisCdom } from '../solaris/solaris-cdom';

export interface SolarisCdomResponse {
    total_count: number;
    offset: number;
    limit: number;
    Devices: SolarisCdom[];
  }