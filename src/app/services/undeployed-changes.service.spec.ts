import { TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { skip, take } from 'rxjs/operators';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { UndeployedChangesService } from './undeployed-changes.service';
import { DatacenterContextService } from './datacenter-context.service';
import { V1TiersService } from '../../../client';
import { ApplicationMode } from '../models/other/application-mode-enum';
import { RouteDataUtil } from '../utils/route-data.util';

// Mock RouteDataUtil
jest.mock('../utils/route-data.util', () => ({
  RouteDataUtil: {
    getApplicationModeFromRoute: jest.fn(),
    getDeepestActiveRoute: jest.fn((route: ActivatedRoute) => {
      let deepestRoute = route;
      while (deepestRoute.firstChild) {
        deepestRoute = deepestRoute.firstChild;
      }
      return deepestRoute;
    }),
  },
}));

describe('UndeployedChangesService', () => {
  let service: UndeployedChangesService;
  let mockDatacenterContextService: any;
  let mockV1TiersService: any;
  let mockRouter: any;
  let routerEventsSubject: Subject<any>;
  let datacenterSubject: Subject<any>;

  const createMockActivatedRoute = (data: any, parent: ActivatedRoute | null = null, firstChild: ActivatedRoute | null = null) => ({
    snapshot: { data },
    parent,
    firstChild,
  } as any as ActivatedRoute);

  beforeEach(() => {
    routerEventsSubject = new Subject();
    datacenterSubject = new Subject();

    // Mock DatacenterContextService
    mockDatacenterContextService = {
      currentDatacenter: datacenterSubject.asObservable(),
    };

    // Mock V1TiersService
    mockV1TiersService = {
      getManyTier: jest.fn().mockReturnValue(of({ data: [{ id: 'tier1', name: 'Tier 1' }] })),
    };

    // Mock Router with routerState.root - create child first, then root with child as firstChild
    const mockChildRoute = createMockActivatedRoute({ mode: ApplicationMode.NETCENTRIC });
    const mockRootRoute = createMockActivatedRoute({}, null, mockChildRoute);
    // Set parent on child route (cast to any to allow assignment to read-only property)
    (mockChildRoute as any).parent = mockRootRoute;

    mockRouter = {
      routerState: {
        root: mockRootRoute,
      },
      events: routerEventsSubject.asObservable(),
    };

    TestBed.configureTestingModule({
      providers: [
        UndeployedChangesService,
        { provide: DatacenterContextService, useValue: mockDatacenterContextService },
        { provide: V1TiersService, useValue: mockV1TiersService },
        { provide: Router, useValue: mockRouter },
      ],
    });

    // Reset RouteDataUtil mock
    (RouteDataUtil.getApplicationModeFromRoute as jest.Mock).mockReturnValue(ApplicationMode.NETCENTRIC);

    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      service = TestBed.inject(UndeployedChangesService);
      expect(service).toBeTruthy();
    });

    it('should set application mode from router on initialization', () => {
      (RouteDataUtil.getApplicationModeFromRoute as jest.Mock).mockReturnValue(ApplicationMode.TENANTV2);
      service = TestBed.inject(UndeployedChangesService);
      expect(RouteDataUtil.getApplicationModeFromRoute).toHaveBeenCalled();
      expect(service.applicationMode).toBe(ApplicationMode.TENANTV2);
    });

    it('should subscribe to datacenter changes on initialization', () => {
      service = TestBed.inject(UndeployedChangesService);
      const spy = jest.spyOn(service, 'getUndeployedChanges');
      datacenterSubject.next({ id: 'datacenter2' });
      expect(spy).toHaveBeenCalled();
    });

    it('should set up periodic interval to fetch undeployed changes', () => {
      service = TestBed.inject(UndeployedChangesService);
      const spy = jest.spyOn(service, 'getUndeployedChanges');

      jest.advanceTimersByTime(30 * 1000);
      expect(spy).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(30 * 1000);
      expect(spy).toHaveBeenCalledTimes(2);
    });
  });

  describe('getDeepestActiveRoute', () => {
    it('should find deepest route in route tree', () => {
      // Create routes bottom-up: grandchild first, then child with grandchild as firstChild, then root
      const grandChildRoute = createMockActivatedRoute({ mode: ApplicationMode.NETCENTRIC });
      const childRoute = createMockActivatedRoute({}, null, grandChildRoute);
      // Set parent on grandchild (cast to any to allow assignment to read-only property)
      (grandChildRoute as any).parent = childRoute;
      const rootRoute = createMockActivatedRoute({}, null, childRoute);
      // Set parent on child (cast to any to allow assignment to read-only property)
      (childRoute as any).parent = rootRoute;

      mockRouter.routerState.root = rootRoute;
      (RouteDataUtil.getApplicationModeFromRoute as jest.Mock).mockImplementation((route: ActivatedRoute) => route.snapshot.data.mode);

      service = TestBed.inject(UndeployedChangesService);
      expect(RouteDataUtil.getApplicationModeFromRoute).toHaveBeenCalledWith(grandChildRoute);
    });

    it('should return root route if no children exist', () => {
      const rootRoute = createMockActivatedRoute({ mode: ApplicationMode.NETCENTRIC });
      mockRouter.routerState.root = rootRoute;

      (RouteDataUtil.getApplicationModeFromRoute as jest.Mock).mockImplementation((route: ActivatedRoute) => route.snapshot.data.mode);

      service = TestBed.inject(UndeployedChangesService);
      expect(RouteDataUtil.getApplicationModeFromRoute).toHaveBeenCalledWith(rootRoute);
    });
  });

  describe('setApplicationModeFromRouter', () => {
    it('should update application mode on navigation end', () => {
      service = TestBed.inject(UndeployedChangesService);
      (RouteDataUtil.getApplicationModeFromRoute as jest.Mock).mockReturnValue(ApplicationMode.APPCENTRIC);

      routerEventsSubject.next(new NavigationEnd(1, '/appcentric', '/appcentric'));
      expect(service.applicationMode).toBe(ApplicationMode.APPCENTRIC);
      expect(RouteDataUtil.getApplicationModeFromRoute).toHaveBeenCalledTimes(2); // Once on init, once on navigation
    });

    it('should handle undefined mode gracefully', () => {
      (RouteDataUtil.getApplicationModeFromRoute as jest.Mock).mockReturnValue(undefined);
      service = TestBed.inject(UndeployedChangesService);
      expect(service.applicationMode).toBeUndefined();
    });
  });

  describe('getUndeployedChanges', () => {
    beforeEach(() => {
      service = TestBed.inject(UndeployedChangesService);
    });

    it('should return early for APPCENTRIC mode', () => {
      service.applicationMode = ApplicationMode.APPCENTRIC;
      const spy = jest.spyOn(service, 'getNetcentricChanges');
      service.getUndeployedChanges();
      expect(spy).not.toHaveBeenCalled();
    });

    it('should return early for TENANTV2 mode', () => {
      service.applicationMode = ApplicationMode.TENANTV2;
      const spy = jest.spyOn(service, 'getNetcentricChanges');
      service.getUndeployedChanges();
      expect(spy).not.toHaveBeenCalled();
    });

    it('should return early for ADMINPORTAL mode', () => {
      service.applicationMode = ApplicationMode.ADMINPORTAL;
      const spy = jest.spyOn(service, 'getNetcentricChanges');
      service.getUndeployedChanges();
      expect(spy).not.toHaveBeenCalled();
    });

    it('should call getNetcentricChanges for NETCENTRIC mode', () => {
      service.applicationMode = ApplicationMode.NETCENTRIC;
      service.currentDatacenter = { id: 'datacenter1' } as any;
      const spy = jest.spyOn(service, 'getNetcentricChanges');
      service.getUndeployedChanges();
      expect(spy).toHaveBeenCalled();
    });

    it('should not call getNetcentricChanges when mode is undefined', () => {
      service.applicationMode = undefined;
      const spy = jest.spyOn(service, 'getNetcentricChanges');
      service.getUndeployedChanges();
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('getNetcentricChanges', () => {
    beforeEach(() => {
      service = TestBed.inject(UndeployedChangesService);
    });

    it('should return early if no datacenter is set', () => {
      service.currentDatacenter = null;
      service.getNetcentricChanges();
      expect(mockV1TiersService.getManyTier).not.toHaveBeenCalled();
    });

    it('should fetch tiers with correct filters when datacenter is set', () => {
      service.currentDatacenter = { id: 'datacenter1' } as any;
      service.getNetcentricChanges();

      expect(mockV1TiersService.getManyTier).toHaveBeenCalledWith({
        filter: ['datacenterId||eq||datacenter1', 'version||gt_prop||provisionedVersion', 'deletedAt||isnull'],
        sort: ['updatedAt,DESC'],
        fields: ['id', 'name'],
        page: 1,
        perPage: 1000,
      });
    });

    it('should update undeployedChangeObjects observable with fetched data', done => {
      service.currentDatacenter = { id: 'datacenter1' } as any;
      const mockData = [{ id: 'tier1', name: 'Tier 1' }];
      mockV1TiersService.getManyTier.mockReturnValue(of({ data: mockData }));

      service.undeployedChangeObjects.pipe(skip(1), take(1)).subscribe(objects => {
        expect(objects).toEqual(mockData);
        done();
      });

      service.getNetcentricChanges();
    });

    it('should update undeployedChanges observable to true when changes exist', done => {
      service.currentDatacenter = { id: 'datacenter1' } as any;
      mockV1TiersService.getManyTier.mockReturnValue(of({ data: [{ id: 'tier1' }] }));

      service.undeployedChanges.pipe(skip(1), take(1)).subscribe(hasChanges => {
        expect(hasChanges).toBeTruthy();
        done();
      });

      service.getNetcentricChanges();
    });

    it('should update undeployedChanges observable to false when no changes exist', done => {
      service.currentDatacenter = { id: 'datacenter1' } as any;
      mockV1TiersService.getManyTier.mockReturnValue(of({ data: [] }));

      service.undeployedChanges.pipe(skip(1), take(1)).subscribe(hasChanges => {
        expect(hasChanges).toBeFalsy();
        done();
      });

      service.getNetcentricChanges();
    });
  });

  describe('setupSubscriptions', () => {
    it('should update currentDatacenter when datacenter changes', () => {
      service = TestBed.inject(UndeployedChangesService);
      const newDatacenter = { id: 'datacenter2' } as any;
      datacenterSubject.next(newDatacenter);
      expect(service.currentDatacenter).toEqual(newDatacenter);
    });

    it('should call getUndeployedChanges when datacenter changes', () => {
      service = TestBed.inject(UndeployedChangesService);
      const spy = jest.spyOn(service, 'getUndeployedChanges');
      datacenterSubject.next({ id: 'datacenter2' });
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('getAppCentricChanges', () => {
    it('should throw "Not implemented" error', () => {
      service = TestBed.inject(UndeployedChangesService);
      expect(() => service.getAppCentricChanges()).toThrow('Not implemented');
    });
  });

  describe('Observables', () => {
    beforeEach(() => {
      service = TestBed.inject(UndeployedChangesService);
    });

    it('should expose undeployedChangeObjects as observable', () => {
      expect(service.undeployedChangeObjects).toBeDefined();
      expect(service.undeployedChangeObjects.subscribe).toBeDefined();
    });

    it('should expose undeployedChanges as observable', () => {
      expect(service.undeployedChanges).toBeDefined();
      expect(service.undeployedChanges.subscribe).toBeDefined();
    });
  });
});
