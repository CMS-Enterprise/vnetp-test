import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import {
  AppCentricSubnet,
  ExternalVrfConnection,
  RouteControlRequest,
  V2AppCentricAppCentricSubnetsService,
  V2AppCentricTenantsService,
  V2RoutingExternalVrfConnectionsService,
  V3GlobalExternalRoutesService,
  V3GlobalRouteControlRequestService,
} from 'client';
import { of } from 'rxjs';
import { RouteControlRequestDetailComponent } from './route-control-request-detail.component';

describe('RouteControlRequestDetailComponent', () => {
  let component: RouteControlRequestDetailComponent;
  let fixture: ComponentFixture<RouteControlRequestDetailComponent>;

  let mockActivatedRoute: any;
  let mockRouter: any;
  let mockRcrService: any;
  let mockTenantService: any;
  let mockSubnetsService: any;
  let mockExtVrfConnService: any;
  let mockGlobalRoutesService: any;
  let mockDialog: any;

  const requestId = 'req-1';
  const tenantId = 't-1';

  beforeEach(async () => {
    mockActivatedRoute = {
      snapshot: { paramMap: { get: jest.fn().mockReturnValue(requestId) } },
    };

    mockRouter = { navigate: jest.fn() } as Partial<Router> as any;

    mockRcrService = {
      getManyRouteControlRequests: jest.fn().mockReturnValue(of([{ id: requestId, tenantId } as RouteControlRequest])),
    } as Partial<V3GlobalRouteControlRequestService> as any;

    mockTenantService = {
      getOneTenant: jest.fn().mockReturnValue(of({ id: tenantId, name: 'Tenant One', environmentId: 'env-1' })),
      getRouteControlChangesTenant: jest.fn().mockReturnValue(
        of({
          routeControlChanges: [
            {
              vrfName: 'VRF-A',
              addedInternalRoutes: [{ externalVrfConnectionId: 'e1' }],
              addedExternalRoutes: [{ externalVrfConnectionId: 'e2' }],
              modifiedInternalRoutes: [],
              modifiedExternalRoutes: [],
              removedInternalRoutes: [],
              removedExternalRoutes: [],
            },
          ],
        }),
      ),
    } as Partial<V2AppCentricTenantsService> as any;

    mockSubnetsService = {
      getOneAppCentricSubnet: jest.fn().mockReturnValue(of({ id: 's1', name: 'Subnet 1' } as AppCentricSubnet)),
    } as Partial<V2AppCentricAppCentricSubnetsService> as any;

    mockExtVrfConnService = {
      getOneExternalVrfConnection: jest.fn().mockReturnValue(of({ id: 'e1', name: 'Conn 1' } as ExternalVrfConnection)),
      getManyExternalVrfConnection: jest.fn().mockReturnValue(
        of([
          { id: 'e1', name: 'Conn 1' },
          { id: 'e2', name: 'Conn 2' },
        ] as any),
      ),
    } as Partial<V2RoutingExternalVrfConnectionsService> as any;

    mockGlobalRoutesService = {
      getManyExternalRoutes: jest.fn().mockReturnValue(of([{ id: 'gr1', externalVrf: 'VRF-A' }] as any)),
    } as Partial<V3GlobalExternalRoutesService> as any;

    mockDialog = { open: jest.fn() } as Partial<MatDialog> as any;

    await TestBed.configureTestingModule({
      declarations: [RouteControlRequestDetailComponent],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: mockRouter },
        { provide: V3GlobalRouteControlRequestService, useValue: mockRcrService },
        { provide: V2AppCentricTenantsService, useValue: mockTenantService },
        { provide: V2AppCentricAppCentricSubnetsService, useValue: mockSubnetsService },
        { provide: V2RoutingExternalVrfConnectionsService, useValue: mockExtVrfConnService },
        { provide: V3GlobalExternalRoutesService, useValue: mockGlobalRoutesService },
        { provide: MatDialog, useValue: mockDialog },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(RouteControlRequestDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit with missing id sets isLoading false', () => {
    mockActivatedRoute.snapshot.paramMap.get.mockReturnValueOnce(null);
    component.ngOnInit();
    expect(component.isLoading).toBe(false);
  });

  it('loadRequestDetails loads request and triggers changes load', fakeAsync(() => {
    component.ngOnInit();
    tick();
    // allow inner forkJoin to resolve as well
    tick();
    expect(mockRcrService.getManyRouteControlRequests).toHaveBeenCalledWith({ filter: [`id||eq||${requestId}`] });
    expect(mockTenantService.getOneTenant).toHaveBeenCalledWith({ id: tenantId });
    expect(mockTenantService.getRouteControlChangesTenant).toHaveBeenCalledWith({ tenantId });
    expect(component.routeControlChanges.tenantName).toBe('Tenant One');
  }));

  it('loadRequestDetails logs error and stops when tenantId missing', fakeAsync(() => {
    mockRcrService.getManyRouteControlRequests.mockReturnValueOnce(of([{ id: requestId, tenantId: null } as any]));
    jest.spyOn(console, 'error').mockImplementation(() => {});
    component.ngOnInit();
    tick();
    expect(component.isLoading).toBe(false);
    expect(console.error).toHaveBeenCalledWith('Tenant ID not found on Route Control Request.');
    (console.error as jest.Mock).mockRestore();
  }));

  it('_collectExternalVrfConnectionIds collects ids from change sets', () => {
    const ids = (component as any)._collectExternalVrfConnectionIds({
      routeControlChanges: [
        {
          addedInternalRoutes: [{ externalVrfConnectionId: 'a' }],
          addedExternalRoutes: [{ externalVrfConnectionId: 'b' }],
          modifiedInternalRoutes: [{ externalVrfConnectionId: 'a' }],
          modifiedExternalRoutes: [],
          removedInternalRoutes: [],
          removedExternalRoutes: [{ externalVrfConnectionId: 'c' }],
        },
      ],
    });
    expect(ids.sort()).toEqual(['a', 'b', 'c']);
  });

  it('prefetchExternalVrfConnections caches fetched connections', async () => {
    await (component as any).prefetchExternalVrfConnections(['e1', 'e2']);
    const name1 = (component as any).externalVrfConnectionCache.get('e1')?.name;
    const name2 = (component as any).externalVrfConnectionCache.get('e2')?.name;
    expect(name1).toBe('Conn 1');
    expect(name2).toBe('Conn 2');
  });

  it('_groupChangesByExternalVrfConnection groups by name and consolidates arrays', () => {
    const changes = {
      routeControlChanges: [
        {
          vrfName: 'VRF-X',
          addedInternalRoutes: [{ x: 1 }],
          addedExternalRoutes: [{ y: 1 }],
          modifiedInternalRoutes: [{ z: 1 }],
          modifiedExternalRoutes: [],
          removedInternalRoutes: [],
          removedExternalRoutes: [{ q: 1 }],
        },
      ],
    };
    (component as any)._groupChangesByExternalVrfConnection(changes);
    expect(component.groupedChanges.length).toBe(1);
    const g = component.groupedChanges[0];
    expect(g.externalVrfConnectionName).toBe('VRF-X');
    expect(g.internalAdditions.length).toBe(1);
    expect(g.externalDeletions.length).toBe(1);
  });

  it('getColumnsFor, trackByColumn, getCellValue, formatCellValue', () => {
    expect(component.getColumnsFor([])).toEqual([]);
    const cols = component.getColumnsFor([
      { a: 1, b: 2 },
      { b: 3, c: 4 },
    ]);
    expect(new Set(cols)).toEqual(new Set(['a', 'b', 'c']));

    expect(component.trackByColumn(0, 'col')).toBe('col');
    expect(component.getCellValue({ a: 1 }, 'a')).toBe(1);
    expect(component.getCellValue('v', 'x')).toBe('v');

    expect(component.formatCellValue(null)).toBe('');
    expect(component.formatCellValue(['x', { y: 1 }])).toContain('x');
    expect(component.formatCellValue({ a: 1 })).toBe(JSON.stringify({ a: 1 }));
    expect(component.formatCellValue(5)).toBe('5');
  });

  it('resolveExternalVrfName and resolveGroupExternalVrfName', () => {
    (component as any).externalVrfConnectionCache.set('e1', { id: 'e1', name: 'Name 1' });
    expect(component.resolveExternalVrfName('e1')).toBe('Name 1');
    expect(component.resolveExternalVrfName('eX')).toBe('eX');

    const group: any = {
      internalAdditions: [{ externalVrfConnectionId: 'e1' }],
      externalAdditions: [],
      internalModifications: [],
      externalModifications: [],
      internalDeletions: [],
      externalDeletions: [],
      externalVrfConnectionName: 'Fallback',
    };
    expect(component.resolveGroupExternalVrfName(group)).toBe('Name 1');
  });

  it('openSubnetDetails fetches (if needed) and opens dialog', async () => {
    await component.openSubnetDetails('s1');
    expect(mockSubnetsService.getOneAppCentricSubnet).toHaveBeenCalledWith({ id: 's1' });
    expect(mockDialog.open).toHaveBeenCalled();
    mockSubnetsService.getOneAppCentricSubnet.mockClear();
    await component.openSubnetDetails('s1');
    expect(mockSubnetsService.getOneAppCentricSubnet).not.toHaveBeenCalled();
  });

  it('openExternalVrfConnectionDetails fetches then caches and opens dialog', async () => {
    // ensure cache miss first
    (component as any).externalVrfConnectionCache.clear();
    await component.openExternalVrfConnectionDetails('e1');
    expect(mockExtVrfConnService.getOneExternalVrfConnection).toHaveBeenCalledWith({ id: 'e1' });
    expect(mockDialog.open).toHaveBeenCalled();
    mockExtVrfConnService.getOneExternalVrfConnection.mockClear();
    // second call should hit cache
    await component.openExternalVrfConnectionDetails('e1');
    expect(mockExtVrfConnService.getOneExternalVrfConnection).not.toHaveBeenCalled();
  });

  it('openGlobalExternalRouteDetails fetches by id and opens dialog', async () => {
    (component as any).environmentId = 'env-1';
    await component.openGlobalExternalRouteDetails('gr1');
    expect(mockGlobalRoutesService.getManyExternalRoutes).toHaveBeenCalledWith({
      environmentId: 'env-1',
      filter: ['id||eq||gr1'],
      limit: 1,
    });
    expect(mockDialog.open).toHaveBeenCalled();
  });

  it('goBack navigates to list', () => {
    component.goBack();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/adminportal/route-control-request'], { queryParamsHandling: 'merge' });
  });
});
