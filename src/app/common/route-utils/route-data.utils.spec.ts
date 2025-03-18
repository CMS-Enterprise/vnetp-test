import { ApplicationMode } from '../../models/other/application-mode-enum';
import { TENANT_V2_ROUTE_DATA, NETCENTRIC_ROUTE_DATA, APPCENTRIC_ROUTE_DATA, mergeRouteData } from './route-data.utils';

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
  });

  describe('mergeRouteData', () => {
    const defaultData = {
      mode: 'test-mode',
      baseTitle: 'Base Title',
      section: 'test-section',
    };

    it('should merge default data with route data', () => {
      const routeData = {
        breadcrumb: 'Test Breadcrumb',
        title: 'Test Title',
      };

      const result = mergeRouteData(defaultData, routeData);

      expect(result).toEqual({
        mode: 'test-mode',
        baseTitle: 'Base Title',
        section: 'test-section',
        breadcrumb: 'Test Breadcrumb',
        title: 'Base Title - Test Title',
      });
    });

    it('should format title with baseTitle when not already included', () => {
      const routeData = { title: 'Simple Title' };
      const result = mergeRouteData(defaultData, routeData);

      expect(result.title).toEqual('Base Title - Simple Title');
    });

    it('should not modify title when it already includes baseTitle', () => {
      const routeData = { title: 'Base Title - Already Formatted' };
      const result = mergeRouteData(defaultData, routeData);

      expect(result.title).toEqual('Base Title - Already Formatted');
    });

    it('should handle undefined routeData', () => {
      const result = mergeRouteData(defaultData);

      expect(result).toEqual(defaultData);
    });

    it('should handle null or undefined title in routeData', () => {
      const routeData = { breadcrumb: 'Test' };
      const result = mergeRouteData(defaultData, routeData);

      expect(result.title).toBeUndefined();
    });

    it('should handle undefined baseTitle in defaultData', () => {
      const customDefaultData = { mode: 'test' };
      const routeData = { title: 'Test Title' };

      const result = mergeRouteData(customDefaultData, routeData);

      expect(result.title).toEqual('Test Title');
    });

    it('should override default data with route data when properties overlap', () => {
      const routeData = {
        section: 'overridden-section',
        title: 'Test Title',
      };

      const result = mergeRouteData(defaultData, routeData);

      expect(result.section).toEqual('overridden-section');
      expect(result.title).toEqual('Base Title - Test Title');
    });
  });
});
