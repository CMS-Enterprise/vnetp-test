import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { TenantWanFormChanges, V2AppCentricTenantsService, V3GlobalWanFormRequestService, WanFormRequest } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { of } from 'rxjs';
import { YesNoModalDto } from '../../../../models/other/yes-no-modal-dto';
import SubscriptionUtil from '../../../../utils/SubscriptionUtil';
import { WanFormRequestDetailComponent } from './wan-form-request-detail.component';

describe('WanFormRequestDetailComponent', () => {
  let component: WanFormRequestDetailComponent;
  let fixture: ComponentFixture<WanFormRequestDetailComponent>;
  let mockWanFormRequestService: Partial<V3GlobalWanFormRequestService>;
  let mockTenantService: Partial<V2AppCentricTenantsService>;
  let mockRouter: Partial<Router>;
  let mockActivatedRoute;
  let mockNgxSmartModalService: Partial<NgxSmartModalService>;
  let subscribeToYesNoModalSpy: jest.SpyInstance;

  const requestId = 'test-request-id';
  const tenantId = 'test-tenant-id';

  const mockWanFormRequest: WanFormRequest = {
    id: requestId,
    tenantId,
    status: 'PENDING',
    tenantName: 'test-tenant',
  } as any;

  const mockWanFormChanges: TenantWanFormChanges = {
    wanFormChanges: [
      {
        vrfName: 'vrf1',
        addedInternalRoutes: [{ name: 'route1' } as any],
        addedExternalRoutes: [{ network: '1.1.1.1/32' } as any],
        removedInternalRoutes: [],
        removedExternalRoutes: [],
      },
      {
        vrfName: 'vrf2',
        addedInternalRoutes: [],
        addedExternalRoutes: [],
        removedInternalRoutes: [{ name: 'route2' } as any],
        removedExternalRoutes: [{ network: '2.2.2.2/32' } as any],
      },
      {
        vrfName: 'vrf1',
        addedInternalRoutes: [{ name: 'route3' } as any],
        addedExternalRoutes: [],
        removedInternalRoutes: [],
        removedExternalRoutes: [],
      },
    ],
  } as any;

  beforeEach(async () => {
    mockWanFormRequestService = {
      getManyWanFormRequests: jest.fn().mockReturnValue(of([mockWanFormRequest])),
      approveOneWanFormRequest: jest.fn().mockReturnValue(of(null)),
      rejectOneWanFormRequest: jest.fn().mockReturnValue(of(null)),
    };

    mockTenantService = {
      getWanFormChangesTenant: jest.fn().mockReturnValue(of(mockWanFormChanges)),
    };

    mockRouter = {
      navigate: jest.fn(),
    };

    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jest.fn().mockReturnValue(requestId),
        },
      },
    };

    mockNgxSmartModalService = {};

    subscribeToYesNoModalSpy = jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal').mockImplementation();

    await TestBed.configureTestingModule({
      declarations: [WanFormRequestDetailComponent],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: mockRouter },
        { provide: V3GlobalWanFormRequestService, useValue: mockWanFormRequestService },
        { provide: V2AppCentricTenantsService, useValue: mockTenantService },
        { provide: NgxSmartModalService, useValue: mockNgxSmartModalService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WanFormRequestDetailComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    subscribeToYesNoModalSpy.mockRestore();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load request details and WAN form changes on init', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      expect(mockActivatedRoute.snapshot.paramMap.get).toHaveBeenCalledWith('id');
      expect(mockWanFormRequestService.getManyWanFormRequests).toHaveBeenCalledWith({ filter: [`id||eq||${requestId}`] });
      expect(component.wanFormRequest).toEqual(mockWanFormRequest);

      expect(mockTenantService.getWanFormChangesTenant).toHaveBeenCalledWith({ id: tenantId });
      expect(component.wanFormChanges).toEqual(mockWanFormChanges);
      expect(component.isLoading).toBe(false);
    }));

    it('should set isLoading to false if no request id is present', () => {
      mockActivatedRoute.snapshot.paramMap.get.mockReturnValue(null);
      component.ngOnInit();
      expect(mockWanFormRequestService.getManyWanFormRequests).not.toHaveBeenCalled();
      expect(component.isLoading).toBe(false);
    });

    it('should handle error if tenantId is missing on the request', fakeAsync(() => {
      const requestWithoutTenant = { id: requestId, tenantId: null, tenantName: null };
      (mockWanFormRequestService.getManyWanFormRequests as jest.Mock).mockReturnValue(of([requestWithoutTenant]));
      jest.spyOn(console, 'error').mockImplementation(() => {});

      component.ngOnInit();
      tick();

      expect(component.wanFormRequest).toEqual(requestWithoutTenant);
      expect(mockTenantService.getWanFormChangesTenant).not.toHaveBeenCalled();
      expect(component.isLoading).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Tenant ID not found on WAN form request.');
      (console.error as jest.Mock).mockRestore();
    }));
  });

  describe('Data Grouping', () => {
    it('should group changes by wan form name (vrfName)', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      expect(component.groupedChanges.length).toBe(2);

      const vrf1Group = component.groupedChanges.find(g => g.wanFormName === 'vrf1');
      expect(vrf1Group).toBeDefined();
      expect(vrf1Group.additions.length).toBe(3);
      expect(vrf1Group.modifications.length).toBe(0);
      expect(vrf1Group.deletions.length).toBe(0);

      const vrf2Group = component.groupedChanges.find(g => g.wanFormName === 'vrf2');
      expect(vrf2Group).toBeDefined();
      expect(vrf2Group.additions.length).toBe(0);
      expect(vrf2Group.modifications.length).toBe(0);
      expect(vrf2Group.deletions.length).toBe(2);
    }));
  });

  describe('User Actions', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();
      tick();
    }));

    it('should navigate back to the request list when goBack is called', () => {
      component.goBack();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/adminportal/wan-form-request'], {
        queryParamsHandling: 'merge',
      });
    });

    it('should open a confirmation modal for approveRequest', () => {
      component.approveRequest();
      const expectedDto = new YesNoModalDto(
        'Approve WAN Form Request',
        'Are you sure you want to approve this request? It will be applied immediately.',
      );
      expect(subscribeToYesNoModalSpy).toHaveBeenCalledWith(expectedDto, mockNgxSmartModalService, expect.any(Function));
    });

    it('should call approve service and navigate on modal confirm for approveRequest', () => {
      component.approveRequest();
      const onConfirm = subscribeToYesNoModalSpy.mock.calls[0][2];
      onConfirm();

      expect(mockWanFormRequestService.approveOneWanFormRequest).toHaveBeenCalledWith({ id: requestId });
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/wan-form-requests']);
    });

    it('should open a confirmation modal for rejectRequest', () => {
      component.rejectRequest();
      const expectedDto = new YesNoModalDto(
        'Reject WAN Form Request',
        'Are you sure you want to reject this request? It cannot be undone.',
      );
      expect(subscribeToYesNoModalSpy).toHaveBeenCalledWith(expectedDto, mockNgxSmartModalService, expect.any(Function));
    });

    it('should call reject service and navigate on modal confirm for rejectRequest', () => {
      component.rejectRequest();
      const onConfirm = subscribeToYesNoModalSpy.mock.calls[0][2];
      onConfirm();

      expect(mockWanFormRequestService.rejectOneWanFormRequest).toHaveBeenCalledWith({ id: requestId });
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/wan-form-requests']);
    });
  });
});
