import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WanFormRequestComponent } from './wan-form-request.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { V3GlobalWanFormRequestService } from '../../../../../client/api/v3GlobalWanFormRequest.service';
import { TenantStateService } from '../../../services/tenant-state.service';
import { V1NetworkScopeFormsWanFormService } from '../../../../../client/api/v1NetworkScopeFormsWanForm.service';
import { MockComponent } from '../../../../test/mock-components';
import { of } from 'rxjs';
import { GetManyWanFormRequestResponseDto, WanForm, WanFormRequest } from '../../../../../client';
import { NO_ERRORS_SCHEMA } from '@angular/core';

// Mock SubscriptionUtil since it's used statically
jest.mock('../../../utils/SubscriptionUtil', () => ({
  __esModule: true,
  default: {
    subscribeToYesNoModal: jest.fn(),
  },
}));
import SubscriptionUtil from '../../../utils/SubscriptionUtil';

describe('WanFormRequestComponent', () => {
  let component: WanFormRequestComponent;
  let fixture: ComponentFixture<WanFormRequestComponent>;
  let mockWanFormRequestService: Partial<V3GlobalWanFormRequestService>;
  let mockTenantStateService: Partial<TenantStateService>;
  let mockWanFormService: Partial<V1NetworkScopeFormsWanFormService>;

  const MOCK_WAN_FORM_REQUEST: WanFormRequest = {
    id: 'wfr-1',
    wanFormId: 'wf-1',
    tenant: 'Tenant A',
    status: 'PENDING' as any,
    createdAt: new Date().toISOString(),
  };

  const MOCK_WAN_FORM: WanForm = {
    id: 'wf-1',
    name: 'WAN Form 1',
    tenant: { id: 't-1', name: 'ACI Tenant A' } as any,
    datacenter: { id: 'dc-1', name: 'DC A' } as any,
  };

  const MOCK_RESPONSE: GetManyWanFormRequestResponseDto = {
    data: [MOCK_WAN_FORM_REQUEST],
    count: 1,
    total: 1,
    page: 1,
    pageCount: 1,
    totalPages: 1,
  };

  beforeEach(async () => {
    mockWanFormRequestService = {
      getManyWanFormRequests: jest.fn().mockReturnValue(of(JSON.parse(JSON.stringify(MOCK_RESPONSE)))),
      approveOneWanFormRequest: jest.fn().mockReturnValue(of(null)),
      rejectOneWanFormRequest: jest.fn().mockReturnValue(of(null)),
    };

    mockTenantStateService = {
      setTenant: jest.fn(),
      clearTenant: jest.fn(),
    };

    mockWanFormService = {
      getOneWanForm: jest.fn().mockReturnValue(of(MOCK_WAN_FORM)),
    };

    await TestBed.configureTestingModule({
      declarations: [WanFormRequestComponent, MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'searchColumns'] })],
      imports: [HttpClientTestingModule],
      providers: [
        { provide: NgxSmartModalService, useValue: {} },
        { provide: V3GlobalWanFormRequestService, useValue: mockWanFormRequestService },
        { provide: TenantStateService, useValue: mockTenantStateService },
        { provide: V1NetworkScopeFormsWanFormService, useValue: mockWanFormService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(WanFormRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getAllWanFormRequests on init', () => {
    expect(mockWanFormRequestService.getManyWanFormRequests).toHaveBeenCalled();
  });

  describe('getAllWanFormRequests', () => {
    it('should call the service with default params if no event is passed', () => {
      (mockWanFormRequestService.getManyWanFormRequests as jest.Mock).mockClear();
      component.getAllWanFormRequests();
      expect(mockWanFormRequestService.getManyWanFormRequests).toHaveBeenCalledWith({
        filter: [undefined, 'status||eq||PENDING'],
        page: 1,
        perPage: 20,
      });
    });

    it('should call the service with params from event object', () => {
      const event = { page: 2, perPage: 50, searchColumn: 'tenant', searchText: 'test' };
      component.getAllWanFormRequests(event);
      expect(mockWanFormRequestService.getManyWanFormRequests).toHaveBeenCalledWith({
        filter: ['tenant||cont||test', 'status||eq||PENDING'],
        page: 2,
        perPage: 50,
      });
    });

    it('should handle event with no search column', () => {
      const event = { page: 3, perPage: 10 };
      component.getAllWanFormRequests(event);
      expect(mockWanFormRequestService.getManyWanFormRequests).toHaveBeenCalledWith({
        filter: [undefined, 'status||eq||PENDING'],
        page: 3,
        perPage: 10,
      });
    });

    it('should use default page and perPage if not provided in event', () => {
      const event = { searchColumn: 'tenant', searchText: 'test' }; // No page or perPage
      component.getAllWanFormRequests(event);
      expect(component.tableComponentDto.page).toBe(1);
      expect(component.tableComponentDto.perPage).toBe(20);
      expect(mockWanFormRequestService.getManyWanFormRequests).toHaveBeenCalledWith({
        filter: ['tenant||cont||test', 'status||eq||PENDING'],
        page: 1,
        perPage: 20,
      });
    });

    it('should call createWanFormTableDto on success', () => {
      const createDtoSpy = jest.spyOn(component, 'createWanFormTableDto');
      component.getAllWanFormRequests();
      expect(createDtoSpy).toHaveBeenCalled();
    });
  });

  describe('createWanFormTableDto and setWanForm', () => {
    beforeEach(() => {
      // Reset state before each test in this block
      component.wanFormRequestTableDto = undefined;
      component.wanFormRequests = { data: [], count: 0, total: 0, page: 0, pageCount: 0, totalPages: 0 };
    });

    it('should call setWanForm for each request and then clear tenant', () => {
      const setWanFormSpy = jest.spyOn(component, 'setWanForm');
      component.wanFormRequests = JSON.parse(JSON.stringify(MOCK_RESPONSE));
      component.createWanFormTableDto();
      expect(setWanFormSpy).toHaveBeenCalledWith(MOCK_WAN_FORM_REQUEST.wanFormId, MOCK_WAN_FORM_REQUEST);
      expect(mockTenantStateService.clearTenant).toHaveBeenCalled();
    });

    it('setWanForm should correctly build the table DTO', () => {
      // Initial state is now reliably undefined
      expect(component.wanFormRequestTableDto).toBeUndefined();

      // First call
      component.setWanForm(MOCK_WAN_FORM_REQUEST.wanFormId, MOCK_WAN_FORM_REQUEST);

      expect(mockTenantStateService.setTenant).toHaveBeenCalledWith(MOCK_WAN_FORM_REQUEST.tenant);
      expect(mockWanFormService.getOneWanForm).toHaveBeenCalledWith({
        id: MOCK_WAN_FORM_REQUEST.wanFormId,
        join: ['internalRoutes', 'externalRoutes', 'tenant', 'datacenter'],
      });

      expect(component.wanFormRequestTableDto).toBeDefined();
      expect(component.wanFormRequestTableDto.data.length).toBe(1);
      expect(component.wanFormRequestTableDto.data[0].wanFormName).toBe(MOCK_WAN_FORM.name);
      expect(component.wanFormRequestTableDto.data[0].aciTenant).toBe(MOCK_WAN_FORM.tenant.name);

      // Second call to test the ternary branch
      const secondRequest = { ...MOCK_WAN_FORM_REQUEST, id: 'wfr-2', wanFormId: 'wf-2' };
      const secondForm = { ...MOCK_WAN_FORM, id: 'wf-2', name: 'WAN Form 2' };
      (mockWanFormService.getOneWanForm as jest.Mock).mockReturnValue(of(secondForm));

      component.setWanForm(secondRequest.wanFormId, secondRequest);
      expect(component.wanFormRequestTableDto.data.length).toBe(2);
      expect(component.wanFormRequestTableDto.data[1].wanFormName).toBe('WAN Form 2');
    });
  });

  describe('approveWanFormRequest', () => {
    it('should call approve service on confirm', () => {
      const getAllSpy = jest.spyOn(component, 'getAllWanFormRequests').mockImplementation();
      (SubscriptionUtil.subscribeToYesNoModal as jest.Mock).mockImplementation((dto, ngx, onConfirm) => {
        onConfirm();
      });

      component.approveWanFormRequest('test-id');

      expect(mockWanFormRequestService.approveOneWanFormRequest).toHaveBeenCalledWith({ id: 'test-id' });
      expect(getAllSpy).toHaveBeenCalledTimes(1); // Called in the 'next' block
    });

    it('should refresh list on close', () => {
      const getAllSpy = jest.spyOn(component, 'getAllWanFormRequests').mockImplementation();
      (SubscriptionUtil.subscribeToYesNoModal as jest.Mock).mockImplementation((dto, ngx, onConfirm, onClose) => {
        onClose();
      });

      component.approveWanFormRequest('test-id');

      expect(mockWanFormRequestService.approveOneWanFormRequest).not.toHaveBeenCalled();
      expect(getAllSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('rejectWanFormRequest', () => {
    it('should call reject service on confirm', () => {
      const getAllSpy = jest.spyOn(component, 'getAllWanFormRequests').mockImplementation();
      (SubscriptionUtil.subscribeToYesNoModal as jest.Mock).mockImplementation((dto, ngx, onConfirm) => {
        onConfirm();
      });

      component.rejectWanFormRequest('test-id');

      expect(mockWanFormRequestService.rejectOneWanFormRequest).toHaveBeenCalledWith({ id: 'test-id' });
      expect(getAllSpy).toHaveBeenCalledTimes(1);
    });

    it('should refresh list on close', () => {
      const getAllSpy = jest.spyOn(component, 'getAllWanFormRequests').mockImplementation();
      (SubscriptionUtil.subscribeToYesNoModal as jest.Mock).mockImplementation((dto, ngx, onConfirm, onClose) => {
        onClose();
      });

      component.rejectWanFormRequest('test-id');

      expect(mockWanFormRequestService.rejectOneWanFormRequest).not.toHaveBeenCalled();
      expect(getAllSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('onTableEvent', () => {
    it('should update dto and call getAllWanFormRequests', () => {
      const getAllSpy = jest.spyOn(component, 'getAllWanFormRequests');
      const event = { page: 5, perPage: 10 };
      component.onTableEvent(event as any);
      expect(component.tableComponentDto).toEqual(event);
      expect(getAllSpy).toHaveBeenCalledWith(event);
    });
  });
});
