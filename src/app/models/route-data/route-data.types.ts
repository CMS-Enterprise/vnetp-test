import { ApplicationMode } from '../other/application-mode-enum';

// Common route data for TenantV2 module
export const TENANT_V2_ROUTE_DATA = {
  // Common properties for all TenantV2 routes
  mode: ApplicationMode.TENANTV2,
  baseTitle: 'vNETP - TenantV2',
  section: 'tenant-v2',
};

// Common route data for NetCentric module
export const NETCENTRIC_ROUTE_DATA = {
  // Common properties for all NetCentric routes
  mode: ApplicationMode.NETCENTRIC,
  baseTitle: 'vNETP',
  section: 'netcentric',
};

// Common route data for AppCentric module
export const APPCENTRIC_ROUTE_DATA = {
  // Common properties for all AppCentric routes
  mode: ApplicationMode.APPCENTRIC,
  baseTitle: 'vNETP - AppCentric',
  section: 'appcentric',
};

// Common route data for AdminPortal module
export const ADMINPORTAL_ROUTE_DATA = {
  // Common properties for all AdminPortal routes
  mode: ApplicationMode.ADMINPORTAL,
  baseTitle: 'vNETP - Admin Portal',
  section: 'adminportal',
};
