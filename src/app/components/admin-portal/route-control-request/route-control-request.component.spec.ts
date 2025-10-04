import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { RouteControlRequest, Tenant, V2AppCentricTenantsService, V3GlobalRouteControlRequestService } from '../../../../../client';
import { RouteControlRequestComponent } from './route-control-request.component';

describe('RouteControlRequestComponent', () => {
  let component: RouteControlRequestComponent;
  let fixture: ComponentFixture<RouteControlRequestComponent>;
  let mockRcrService: any;
  let mockTenantService: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockRcrService = {
      getManyRouteControlRequests: jest.fn(),
    } as Partial<V3GlobalRouteControlRequestService> as any;

    mockTenantService = {
      getManyTenant: jest.fn(),
      getRouteControlChangesTenant: jest.fn(),
    } as Partial<V2AppCentricTenantsService> as any;

    mockRouter = { navigate: jest.fn() } as Partial<Router> as any;

    await TestBed.configureTestingModule({
      declarations: [RouteControlRequestComponent],
      providers: [
        { provide: V3GlobalRouteControlRequestService, useValue: mockRcrService },
        { provide: V2AppCentricTenantsService, useValue: mockTenantService },
        { provide: Router, useValue: mockRouter },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(RouteControlRequestComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit triggers getPendingRouteControlRequests', () => {
    mockRcrService.getManyRouteControlRequests.mockReturnValue(of([]));
    const spy = jest.spyOn(component, 'getPendingRouteControlRequests');
    fixture.detectChanges();
    expect(spy).toHaveBeenCalled();
  });

  it('getPendingRouteControlRequests handles empty list', () => {
    mockRcrService.getManyRouteControlRequests.mockReturnValue(of([]));
    fixture.detectChanges();
    expect(component.isLoading).toBe(false);
    expect(component.routeControlRequests.length).toBe(0);
  });

  it('getPendingRouteControlRequests fetches tenants and changes and builds items', () => {
    const requests: RouteControlRequest[] = [
      { id: 'r1', tenantId: 't1', createdAt: '2025-01-01T00:00:00Z' } as any,
      { id: 'r2', tenantId: 't2', createdAt: '2025-01-02T00:00:00Z' } as any,
    ];
    mockRcrService.getManyRouteControlRequests.mockReturnValue(of(requests));

    const tenants: Tenant[] = [{ id: 't1', name: 'Tenant One' } as Tenant, { id: 't2', name: 'Tenant Two' } as Tenant];
    mockTenantService.getManyTenant.mockReturnValue(of(tenants));

    const t1Changes = {
      routeControlChanges: [
        {
          addedInternalRoutes: [{}],
          addedExternalRoutes: [{}],
          modifiedInternalRoutes: [{}],
          modifiedExternalRoutes: [],
          removedInternalRoutes: [],
          removedExternalRoutes: [{}],
        },
      ],
    };
    const t2Changes = {
      wanFormChanges: [
        {
          addedInternalRoutes: [],
          addedExternalRoutes: [{}],
          modifiedInternalRoutes: [],
          modifiedExternalRoutes: [{}],
          removedInternalRoutes: [{}],
          removedExternalRoutes: [],
        },
      ],
    };
    mockTenantService.getRouteControlChangesTenant.mockReturnValueOnce(of(t1Changes)).mockReturnValueOnce(of(t2Changes));

    fixture.detectChanges();

    expect(component.isLoading).toBe(false);
    expect(component.routeControlRequests.length).toBe(2);
    const item1 = component.routeControlRequests.find(i => i.tenantId === 't1');
    const item2 = component.routeControlRequests.find(i => i.tenantId === 't2');
    expect(item1?.tenantName).toBe('Tenant One');
    expect(item1?.additions).toBe(2);
    expect(item1?.modifications).toBe(1);
    expect(item1?.deletions).toBe(1);
    expect(item2?.additions).toBe(1);
    expect(item2?.modifications).toBe(1);
    expect(item2?.deletions).toBe(1);

    expect(mockTenantService.getManyTenant).toHaveBeenCalledWith({ filter: ['id||in||t1,t2'] });
  });

  it('getPendingRouteControlRequests sets isLoading false on error', () => {
    mockRcrService.getManyRouteControlRequests.mockReturnValue(throwError(() => new Error('fail')));
    component.getPendingRouteControlRequests();
    expect(component.isLoading).toBe(false);
    expect(component.routeControlRequests.length).toBe(0);
  });

  it('buildDisplayItems handles missing changes and empty arrays', () => {
    (component as any).pendingRequests = [
      { id: 'r1', tenantId: 't1', createdAt: 'x' },
      { id: 'r2', tenantId: 't2', createdAt: 'y' },
    ];
    (component as any).tenantNames = new Map<string, string>([
      ['t1', 'T1'],
      ['t2', 'T2'],
    ]);
    (component as any).changesByTenantId = new Map<string, any>([
      ['t1', {}],
      ['t2', { routeControlChanges: [] }],
    ]);

    (component as any).buildDisplayItems();
    expect(component.routeControlRequests.length).toBe(2);
    expect(component.routeControlRequests[0].additions).toBe(0);
    expect(component.routeControlRequests[1].modifications).toBe(0);
  });

  it('viewRequestDetails navigates to details route', () => {
    component.viewRequestDetails('req-123');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/adminportal/route-control-request', 'req-123'], {
      queryParamsHandling: 'merge',
    });
  });
});
