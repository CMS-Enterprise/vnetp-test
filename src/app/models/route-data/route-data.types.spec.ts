import { ApplicationMode } from '../other/application-mode-enum';
import { TENANT_V2_ROUTE_DATA, NETCENTRIC_ROUTE_DATA, APPCENTRIC_ROUTE_DATA, ADMINPORTAL_ROUTE_DATA } from './route-data.types';

describe('Route Data Utilities', () => {
  describe('Default Route Data Constants', () => {
    it('should export TENANT_V2_ROUTE_DATA with correct values', () => {
      expect(TENANT_V2_ROUTE_DATA).toBeDefined();
      expect(TENANT_V2_ROUTE_DATA.mode).toEqual(ApplicationMode.TENANTV2);
      expect(TENANT_V2_ROUTE_DATA.baseTitle).toEqual('vNETP - TenantV2');
      expect(TENANT_V2_ROUTE_DATA.section).toEqual('tenant-v2');
    });

    it('should export NETCENTRIC_ROUTE_DATA with correct values', () => {
      expect(NETCENTRIC_ROUTE_DATA).toBeDefined();
      expect(NETCENTRIC_ROUTE_DATA.mode).toEqual(ApplicationMode.NETCENTRIC);
      expect(NETCENTRIC_ROUTE_DATA.baseTitle).toEqual('vNETP');
      expect(NETCENTRIC_ROUTE_DATA.section).toEqual('netcentric');
    });

    it('should export APPCENTRIC_ROUTE_DATA with correct values', () => {
      expect(APPCENTRIC_ROUTE_DATA).toBeDefined();
      expect(APPCENTRIC_ROUTE_DATA.mode).toEqual(ApplicationMode.APPCENTRIC);
      expect(APPCENTRIC_ROUTE_DATA.baseTitle).toEqual('vNETP - AppCentric');
      expect(APPCENTRIC_ROUTE_DATA.section).toEqual('appcentric');
    });

    it('should export ADMINPORTAL_ROUTE_DATA with correct values', () => {
      expect(ADMINPORTAL_ROUTE_DATA).toBeDefined();
      expect(ADMINPORTAL_ROUTE_DATA.mode).toEqual(ApplicationMode.ADMINPORTAL);
      expect(ADMINPORTAL_ROUTE_DATA.baseTitle).toEqual('vNETP - Admin Portal');
      expect(ADMINPORTAL_ROUTE_DATA.section).toEqual('adminportal');
    });
  });
});
