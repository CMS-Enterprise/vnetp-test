import { SolarisLdom } from '../solaris/solaris-ldom';

export interface SolarisLdomResponse {
    total_count: number;
    offset: number;
    limit: number;
    Devices: SolarisLdom[];
  }
  