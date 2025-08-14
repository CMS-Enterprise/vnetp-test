import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import {
  V3GlobalWanFormRequestService,
  V2AppCentricTenantsService,
  WanFormRequest,
  Tenant,
  TenantWanFormChanges,
} from '../../../../../client';
import { of, throwError } from 'rxjs';
import { WanFormRequestComponent } from './wan-form-request.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('WanFormRequestComponent', () => {
  let component: WanFormRequestComponent;
  let fixture: ComponentFixture<WanFormRequestComponent>;
  let mockWanFormRequestService: Partial<V3GlobalWanFormRequestService>;
  let mockTenantService: Partial<V2AppCentricTenantsService>;
  let mockRouter: Partial<Router>;

  const MOCK_REQUESTS: WanFormRequest[] = [
    { id: 'req-1', tenantId: 't-1', createdAt: new Date().toISOString() } as WanFormRequest,
    { id: 'req-2', tenantId: 't-2', createdAt: new Date().toISOString() } as WanFormRequest,
  ];

  const MOCK_TENANTS: Tenant[] = [{ id: 't-1', name: 'Tenant A' } as Tenant, { id: 't-2', name: 'Tenant B' } as Tenant];

  const MOCK_CHANGES: TenantWanFormChanges = {
    tenantName: 'Tenant A',
    tenantId: 't-1',
    wanFormChanges: [
      {
        vrfName: 'VRF1',
        vrfId: 'vrf-1',
        wanFormId: 'wf-1',
        addedInternalRoutes: [{ name: 'route1' } as any],
        addedExternalRoutes: [],
        removedInternalRoutes: [],
        removedExternalRoutes: [],
      },
    ],
  };

  beforeEach(async () => {
    mockWanFormRequestService = {
      getManyWanFormRequests: jest.fn().mockReturnValue(of(MOCK_REQUESTS)),
    };

    mockTenantService = {
      getManyTenant: jest.fn().mockReturnValue(of(MOCK_TENANTS)),
      getWanFormChangesTenant: jest.fn().mockReturnValue(of(MOCK_CHANGES)),
    };

    mockRouter = {
      navigate: jest.fn(),
    };

    await TestBed.configureTestingModule({
      declarations: [WanFormRequestComponent],
      providers: [
        { provide: V3GlobalWanFormRequestService, useValue: mockWanFormRequestService },
        { provide: V2AppCentricTenantsService, useValue: mockTenantService },
        { provide: Router, useValue: mockRouter },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(WanFormRequestComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call getPendingWanFormRequests on initialization', () => {
      const spy = jest.spyOn(component, 'getPendingWanFormRequests');
      fixture.detectChanges(); // ngOnInit is called here
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('getPendingWanFormRequests', () => {
    it('should fetch and process requests and tenants successfully', fakeAsync(() => {
      fixture.detectChanges();
      tick(); // allow forkJoin to complete

      expect(component.isLoading).toBe(false);
      expect(component.wanFormRequests.length).toBe(2);
      expect(component.wanFormRequests[0].tenantName).toBe('Tenant A');
      expect(component.wanFormRequests[1].tenantName).toBe('Tenant B');
      expect(component.wanFormRequests[0].additions).toBe(1);
    }));

    it('should handle an empty list of requests gracefully', fakeAsync(() => {
      (mockWanFormRequestService.getManyWanFormRequests as jest.Mock).mockReturnValue(of([]));
      fixture.detectChanges();
      tick();

      expect(component.isLoading).toBe(false);
      expect(component.wanFormRequests.length).toBe(0);
    }));

    it('should set isLoading to false on API error', fakeAsync(() => {
      (mockWanFormRequestService.getManyWanFormRequests as jest.Mock).mockReturnValue(throwError(() => new Error('API Error')));
      fixture.detectChanges();
      tick();

      expect(component.isLoading).toBe(false);
      expect(component.wanFormRequests.length).toBe(0);
    }));
  });

  describe('viewRequestDetails', () => {
    it('should navigate to the correct detail route with the request ID', () => {
      const requestId = 'req-123';
      component.viewRequestDetails(requestId);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/adminportal/wan-form-request', requestId], {
        queryParamsHandling: 'merge',
      });
    });
  });
});
