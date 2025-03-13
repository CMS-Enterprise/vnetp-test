import { applicationMode } from '../../models/other/application-mode-enum';

// Common route data for TenantV2 module
export const TENANT_V2_ROUTE_DATA = {
  // Common properties for all TenantV2 routes
  mode: applicationMode.TENANTV2,
  baseTitle: 'vNETP - TenantV2',
  section: 'tenant-v2',
};

// Common route data for NetCentric module
export const NETCENTRIC_ROUTE_DATA = {
  // Common properties for all NetCentric routes
  mode: applicationMode.NETCENTRIC,
  baseTitle: 'vNETP',
  section: 'netcentric',
};

// Common route data for AppCentric module
export const APPCENTRIC_ROUTE_DATA = {
  // Common properties for all AppCentric routes
  mode: applicationMode.APPCENTRIC,
  baseTitle: 'vNETP - AppCentric',
  section: 'appcentric',
};

// Common route data for AdminPortal module
export const ADMINPORTAL_ROUTE_DATA = {
  // Common properties for all AdminPortal routes
  mode: applicationMode.ADMINPORTAL,
  baseTitle: 'vNETP - AdminPortal',
  section: 'adminportal',
};

/**
 * Helper function to merge default data with route-specific data
 * Ensures all routes have consistent mode setting and title formatting
 *
 * @param defaultData The default data for the module
 * @param routeData The route-specific data to merge
 * @returns The merged route data
 */
export function mergeRouteData(defaultData: any, routeData: any = {}): any {
  // Create a new object with the defaults first
  const mergedData = { ...defaultData, ...routeData };

  // Handle title formatting
  if (routeData.title && defaultData.baseTitle) {
    if (!routeData.title.includes(defaultData.baseTitle)) {
      mergedData.title = `${defaultData.baseTitle} - ${routeData.title}`;
    }
  }

  return mergedData;
}
