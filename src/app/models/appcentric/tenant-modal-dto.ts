import { Tenant } from 'client';
import { ModalMode } from '../other/modal-mode';

export class TenantModalDto {
  Tenant: Tenant;
  ModalMode: ModalMode;
  isAdminPortalMode?: boolean;
  isTenantV2Mode?: boolean;

  // AdminPortal specific properties
  tenantSize?: 'x-small' | 'small' | 'medium' | 'large' | 'x-large';
  northSouthFirewallVendor?: 'ASA' | 'PANOS';
  northSouthFirewallArchitecture?: 'Physical' | 'Virtual';
  northSouthHa?: boolean;
  northSouthHaMode?: 'Active-Passive' | 'Active-Active';
  eastWestFirewallVendor?: 'ASA' | 'PANOS';
  eastWestFirewallArchitecture?: 'Physical' | 'Virtual';
  eastWestHa?: boolean;
  eastWestHaMode?: 'Active-Passive' | 'Active-Active';

  // Regional HA options
  regionalHa?: boolean;
  primaryDatacenter?: 'East' | 'West';
  secondaryDatacenter?: string;
  deploymentMode?: 'Hot Site First' | 'Cold Site First' | 'Scheduled Sync';

  // VMware Cloud Director Integration
  vcdLocation?: 'VCD-East' | 'VCD-West';
  vcdTenantType?: 'new' | 'existing';
  vcdTenantId?: string;

  // Feature flags
  featureFlags?: {
    northSouthAppId: boolean;
    eastWestAppId: boolean;
    nat64NorthSouth: boolean;
    eastWestAllowSgBypass: boolean;
    eastWestNat: boolean;
  };

  // Template file
  tenantTemplateFile?: File;
}
