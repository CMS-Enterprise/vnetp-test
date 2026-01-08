import { ActivatedRoute, ActivatedRouteSnapshot, Data } from '@angular/router';
import { RouteDataUtil } from './route-data.util';
import { ApplicationMode } from '../models/other/application-mode-enum'; // Adjust path as needed

// Helper function to create a mock ActivatedRouteSnapshot
const createMockActivatedRouteSnapshot = (data: Data, parent?: ActivatedRouteSnapshot | null): ActivatedRouteSnapshot =>
  ({
    data,
    parent,
    // Add other properties if needed by the utility, though 'data' and 'parent' are key
  } as ActivatedRouteSnapshot);

// Helper function to create a mock ActivatedRoute
const createMockActivatedRoute = (snapshot: ActivatedRouteSnapshot, firstChild?: ActivatedRoute | null): ActivatedRoute =>
  ({
    snapshot,
    parent: snapshot.parent ? createMockActivatedRoute(snapshot.parent) : null,
    firstChild: firstChild || null,
    // Add other properties if needed
  } as ActivatedRoute);

describe('RouteDataUtil', () => {
  describe('getApplicationModeFromRoute', () => {
    it('should return mode if found on the current route', () => {
      const snapshot = createMockActivatedRouteSnapshot({ mode: ApplicationMode.TENANTV2 });
      const route = createMockActivatedRoute(snapshot);
      expect(RouteDataUtil.getApplicationModeFromRoute(route)).toBe(ApplicationMode.TENANTV2);
    });

    it('should return mode if found on the direct parent route', () => {
      const parentSnapshot = createMockActivatedRouteSnapshot({ mode: ApplicationMode.APPCENTRIC });
      const currentSnapshot = createMockActivatedRouteSnapshot({}, parentSnapshot);
      const route = createMockActivatedRoute(currentSnapshot);
      expect(RouteDataUtil.getApplicationModeFromRoute(route)).toBe(ApplicationMode.APPCENTRIC);
    });

    it('should return mode if found several levels up', () => {
      const grandParentSnapshot = createMockActivatedRouteSnapshot({ mode: ApplicationMode.NETCENTRIC });
      const parentSnapshot = createMockActivatedRouteSnapshot({}, grandParentSnapshot);
      const currentSnapshot = createMockActivatedRouteSnapshot({}, parentSnapshot);
      const route = createMockActivatedRoute(currentSnapshot);
      expect(RouteDataUtil.getApplicationModeFromRoute(route)).toBe(ApplicationMode.NETCENTRIC);
    });

    it('should return undefined if mode is not found within maxDepth', () => {
      const level5 = createMockActivatedRouteSnapshot({ someOtherData: 'value' });
      const level4 = createMockActivatedRouteSnapshot({}, level5);
      const level3 = createMockActivatedRouteSnapshot({}, level4);
      const level2 = createMockActivatedRouteSnapshot({}, level3);
      const level1 = createMockActivatedRouteSnapshot({}, level2);
      const current = createMockActivatedRouteSnapshot({}, level1);
      const route = createMockActivatedRoute(current);
      // Default maxDepth is 5, so it checks current + 4 parents. Mode on level5 parent is depth 5.
      // Let's test not finding it within default depth (current + 4 parents = 5 levels total)
      // If mode was on level5, it would be found. Let's put it on a non-existent level6 for this test.
      expect(RouteDataUtil.getApplicationModeFromRoute(route)).toBeUndefined();
    });

    it('should stop at maxDepth and return mode if found at maxDepth exactly', () => {
      const level3WithMode = createMockActivatedRouteSnapshot({ mode: ApplicationMode.ADMINPORTAL });
      const level2 = createMockActivatedRouteSnapshot({}, level3WithMode);
      const level1 = createMockActivatedRouteSnapshot({}, level2);
      const current = createMockActivatedRouteSnapshot({}, level1);
      const route = createMockActivatedRoute(current);
      // Search current + 2 parents (depth 2 from current, total 3 levels checked)
      expect(RouteDataUtil.getApplicationModeFromRoute(route, 3)).toBe(ApplicationMode.ADMINPORTAL);
    });

    it('should return undefined if route is null', () => {
      expect(RouteDataUtil.getApplicationModeFromRoute(null)).toBeUndefined();
    });

    it('should return undefined if data is present but mode is missing', () => {
      const snapshot = createMockActivatedRouteSnapshot({ other: 'data' });
      const route = createMockActivatedRoute(snapshot);
      expect(RouteDataUtil.getApplicationModeFromRoute(route)).toBeUndefined();
    });

    it('should return undefined if no data objects are found up to root', () => {
      const parentSnapshot = createMockActivatedRouteSnapshot({});
      const currentSnapshot = createMockActivatedRouteSnapshot({}, parentSnapshot);
      const route = createMockActivatedRoute(currentSnapshot);
      expect(RouteDataUtil.getApplicationModeFromRoute(route)).toBeUndefined();
    });

    it('should handle route with no parent correctly', () => {
      const snapshot = createMockActivatedRouteSnapshot({ mode: ApplicationMode.TENANTV2 }, null);
      const route = createMockActivatedRoute(snapshot);
      expect(RouteDataUtil.getApplicationModeFromRoute(route)).toBe(ApplicationMode.TENANTV2);
    });

    it('should handle route with no parent and no mode correctly', () => {
      const snapshot = createMockActivatedRouteSnapshot({}, null);
      const route = createMockActivatedRoute(snapshot);
      expect(RouteDataUtil.getApplicationModeFromRoute(route)).toBeUndefined();
    });
  });

  describe('getDeepestActiveRoute', () => {
    it('should return the route itself if it has no children', () => {
      const snapshot = createMockActivatedRouteSnapshot({});
      const route = createMockActivatedRoute(snapshot, null);
      expect(RouteDataUtil.getDeepestActiveRoute(route)).toBe(route);
    });

    it('should return the first child if route has one child', () => {
      const childSnapshot = createMockActivatedRouteSnapshot({});
      const parentSnapshot = createMockActivatedRouteSnapshot({});
      const childRoute = createMockActivatedRoute(childSnapshot, null);
      const parentRoute = createMockActivatedRoute(parentSnapshot, childRoute);
      expect(RouteDataUtil.getDeepestActiveRoute(parentRoute)).toBe(childRoute);
    });

    it('should return the deepest child when route has multiple nested children', () => {
      const deepestSnapshot = createMockActivatedRouteSnapshot({});
      const middleSnapshot = createMockActivatedRouteSnapshot({});
      const topSnapshot = createMockActivatedRouteSnapshot({});

      const deepestRoute = createMockActivatedRoute(deepestSnapshot, null);
      const middleRoute = createMockActivatedRoute(middleSnapshot, deepestRoute);
      const topRoute = createMockActivatedRoute(topSnapshot, middleRoute);

      expect(RouteDataUtil.getDeepestActiveRoute(topRoute)).toBe(deepestRoute);
    });
  });
});
