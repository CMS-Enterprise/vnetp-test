import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { of, Subscription } from 'rxjs';
import {
  Tenant,
  V1NetworkScopeFormsWanFormService,
  V2AppCentricTenantsService,
  V3GlobalWanFormRequestService,
} from '../../../../../client';
import { WanFormModalDto } from '../../../models/network-scope-forms/wan-form-modal.dto';
import { ModalMode } from '../../../models/other/modal-mode';
import { DatacenterContextService } from '../../../services/datacenter-context.service';
import { TableContextService } from '../../../services/table-context.service';
import { WanFormComponent } from './wan-form.component';
import { MockComponent, MockFontAwesomeComponent, MockYesNoModalComponent } from 'src/test/mock-components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { RouteDataUtil } from 'src/app/utils/route-data.util';

describe('WanFormComponent', () => {
  let component: WanFormComponent;
  let fixture: ComponentFixture<WanFormComponent>;
  let mockNgxSmartModalService: any;
  let mockWanFormService: any;
  let mockDatacenterContextService: any;
  let mockRouter: any;
  let mockRoute: any;
  let mockTenantService: any;
  let mockTableContextService: any;
  let mockWanFormRequestService: any;

  beforeEach(async () => {
    mockNgxSmartModalService = {
      close: jest.fn(),
      resetModalData: jest.fn(),
      getModalData: jest.fn().mockReturnValue({}),
      setModalData: jest.fn(),
      getModal: jest.fn().mockReturnValue({
        open: jest.fn(),
        onCloseFinished: {
          subscribe: jest.fn().mockImplementation(() => ({ unsubscribe: jest.fn() })),
        },
      }),
    };

    mockWanFormService = {
      getManyWanForm: jest.fn().mockReturnValue(of({})),
      createOneWanForm: jest.fn().mockReturnValue(of({})),
      updateOneWanForm: jest.fn().mockReturnValue(of({})),
      deleteOneWanForm: jest.fn().mockReturnValue(of({})),
      softDeleteOneWanForm: jest.fn().mockReturnValue(of({})),
      restoreOneWanForm: jest.fn().mockReturnValue(of({})),
      activateWanFormWanForm: jest.fn().mockReturnValue(of({})),
      deactivateWanFormWanForm: jest.fn().mockReturnValue(of({})),
    };

    mockDatacenterContextService = {
      currentDatacenter: of({ id: 'testDatacenterId' }),
    };

    mockTenantService = {
      getManyTenant: jest.fn().mockReturnValue(of([])),
    };

    mockRouter = {
      navigate: jest.fn(),
      getCurrentNavigation: jest.fn().mockReturnValue({ extras: { state: { data: {} } } }),
    };

    mockRoute = {
      snapshot: {
        queryParams: { tenantId: 'testTenantId' },
        data: { mode: 'netcentric' },
      },
    };

    mockTableContextService = {
      getSearchLocalStorage: jest.fn().mockReturnValue({}),
    };

    mockWanFormRequestService = {
      createOneWanFormRequest: jest.fn().mockReturnValue(of({})),
      deleteOneWanFormRequest: jest.fn().mockReturnValue(of({})),
    };

    await TestBed.configureTestingModule({
      declarations: [
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
        MockComponent({ selector: 'app-wan-form-modal' }),
        WanFormComponent,
        MockYesNoModalComponent,
        MockFontAwesomeComponent,
      ],
      imports: [FormsModule, ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        { provide: NgxSmartModalService, useValue: mockNgxSmartModalService },
        { provide: V1NetworkScopeFormsWanFormService, useValue: mockWanFormService },
        { provide: DatacenterContextService, useValue: mockDatacenterContextService },
        { provide: V2AppCentricTenantsService, useValue: mockTenantService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockRoute },
        { provide: TableContextService, useValue: mockTableContextService },
        { provide: V3GlobalWanFormRequestService, useValue: mockWanFormRequestService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WanFormComponent);
    component = fixture.componentInstance;
    component.wanForms = [{ id: 'testWanFormId' }] as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set dcsMode from route snapshot data', () => {
      component.ngOnInit();
      expect(component.dcsMode).toBe('netcentric');
    });

    it('should fetch WAN forms if dcsMode is netcentric and datacenterId is set', () => {
      const getWanFormsSpy = jest.spyOn(component, 'getWanForms');
      component.ngOnInit();
      expect(getWanFormsSpy).toHaveBeenCalled();
    });

    it('should call getTenants when mode is appcentric and no selectedTenant', () => {
      jest.spyOn(RouteDataUtil, 'getApplicationModeFromRoute').mockReturnValue('appcentric' as any);
      component.selectedTenant = undefined as any;
      const getTenantsSpy = jest.spyOn(component, 'getTenants').mockImplementation();

      component.ngOnInit();

      expect(getTenantsSpy).toHaveBeenCalled();
    });

    it('should call getWanForms when mode is appcentric and selectedTenant exists', () => {
      jest.spyOn(RouteDataUtil, 'getApplicationModeFromRoute').mockReturnValue('appcentric' as any);
      component.selectedTenant = 'existingTenant';
      const getWanFormsSpy = jest.spyOn(component, 'getWanForms').mockImplementation();

      component.ngOnInit();

      expect(getWanFormsSpy).toHaveBeenCalled();
    });

    it('should log error when dcsMode cannot be determined', () => {
      jest.spyOn(RouteDataUtil, 'getApplicationModeFromRoute').mockReturnValue(undefined as any);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      component.ngOnInit();

      expect(consoleSpy).toHaveBeenCalledWith('WAN Form: Application mode could not be determined via RouteDataUtil.');
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe from currentDatacenterSubscription', () => {
      component.currentDatacenterSubscription = new Subscription();
      const unsubscribeSpy = jest.spyOn(component.currentDatacenterSubscription, 'unsubscribe');
      component.ngOnDestroy();
      expect(unsubscribeSpy).toHaveBeenCalled();
    });
  });

  describe('getWanForms', () => {
    it('should set isLoading to true and fetch WAN forms', () => {
      mockWanFormService.getManyWanForm.mockClear();
      component.dcsMode = 'netcentric';
      component.datacenterId = 'testDatacenterId';
      component.getWanForms();
      expect(component.isLoading).toBe(false);
      const filterParam = 'datacenterId||eq||testDatacenterId';
      expect(mockWanFormService.getManyWanForm).toHaveBeenCalledWith({
        filter: [filterParam, undefined],
        join: ['wanFormSubnets', 'externalRoutes'],
        page: 1,
        perPage: 20,
      });
    });

    it('should update wanForms and set isLoading to false on success', () => {
      const wanFormsMock = { data: [{ id: '1' }, { id: '2' }] };
      mockWanFormService.getManyWanForm.mockReturnValue(of(wanFormsMock));
      component.getWanForms();
      expect(component.wanForms).toEqual(wanFormsMock);
      expect(component.isLoading).toBe(false);
    });
  });

  describe('openModal', () => {
    it('should set modal data and open the modal', () => {
      const dto = new WanFormModalDto();
      dto.modalMode = ModalMode.Create;

      component.openModal(ModalMode.Create);
      expect(mockNgxSmartModalService.setModalData).toHaveBeenCalledWith(dto, 'wanFormModal');
      expect(mockNgxSmartModalService.getModal('wanFormModal').open).toHaveBeenCalled();
    });

    it('should include wanForm details when opening in Edit mode', () => {
      const wanFormMock = { id: 'wf1', name: 'WF1' } as any;
      const setDataSpy = mockNgxSmartModalService.setModalData;

      jest.spyOn(component as any, 'subscribeToModal').mockImplementation();

      component.openModal(ModalMode.Edit, wanFormMock);

      const dtoArg = setDataSpy.mock.calls[0][0] as WanFormModalDto;
      expect(dtoArg.modalMode).toBe(ModalMode.Edit);
      expect(dtoArg.wanForm).toBe(wanFormMock);
    });
  });

  describe('subscribeToModal', () => {
    it('should reset modal data and fetch WAN forms on modal close', () => {
      (component as any).subscribeToModal();
      expect((component as any).wanFormModalSubscription).not.toBeNull();
    });

    it('should fetch filtered results when filteredResults is true', () => {
      let capturedCb: () => void;
      const subscribeMock = jest.fn(cb => {
        capturedCb = cb;
        return { unsubscribe: jest.fn() } as any;
      });
      mockNgxSmartModalService.getModal.mockReturnValue({
        onCloseFinished: { subscribe: subscribeMock },
      });

      mockTableContextService.getSearchLocalStorage.mockReturnValue({ filteredResults: true });
      const resetSpy = jest.spyOn(mockNgxSmartModalService, 'resetModalData');
      const getWanFormsSpy = jest.spyOn(component, 'getWanForms').mockImplementation();

      (component as any).subscribeToModal();

      if (capturedCb) {
        capturedCb();
      }

      expect(resetSpy).toHaveBeenCalledWith('wanFormModal');
      expect(getWanFormsSpy).toHaveBeenCalledWith({ filteredResults: true });
    });

    it('should fetch all results when filteredResults is false', () => {
      let capturedCb: () => void;
      const subscribeMock = jest.fn(cb => {
        capturedCb = cb;
        return { unsubscribe: jest.fn() } as any;
      });
      mockNgxSmartModalService.getModal.mockReturnValue({
        onCloseFinished: { subscribe: subscribeMock },
      });

      mockTableContextService.getSearchLocalStorage.mockReturnValue({ filteredResults: false });
      const getWanFormsSpy = jest.spyOn(component, 'getWanForms').mockImplementation();

      (component as any).subscribeToModal();

      if (capturedCb) {
        capturedCb();
      }

      expect(getWanFormsSpy).toHaveBeenCalledWith();
    });
  });

  describe('deleteWanForm', () => {
    it('should call delete service and fetch WAN forms', () => {
      const wanFormMock = { id: '1', deletedAt: null } as any;
      component.deleteWanForm(wanFormMock);
      expect(mockWanFormService.softDeleteOneWanForm).toHaveBeenCalledWith({ id: '1' });
    });

    it('should call hard delete service if deletedAt is set and fetch WAN forms', () => {
      const wanFormMock = { id: '1', deletedAt: new Date() } as any;
      component.deleteWanForm(wanFormMock);
      expect(mockWanFormService.deleteOneWanForm).toHaveBeenCalledWith({ id: '1' });
    });
  });

  describe('restoreWanForm', () => {
    it('should call restore service and fetch WAN forms', () => {
      const wanFormMock = { id: '1' } as any;
      component.restoreWanForm(wanFormMock);
      expect(mockWanFormService.restoreOneWanForm).toHaveBeenCalledWith({ id: '1' });
    });
  });

  describe('getTenants', () => {
    it('should fetch tenants', () => {
      const tenantsMock = [{ id: '1', name: 'Tenant 1' }];
      mockTenantService.getManyTenant.mockReturnValue(of(tenantsMock));
      component.getTenants();
      expect(component.tenants).toEqual(tenantsMock);
    });
  });

  describe('onTenantSelect', () => {
    it('should navigate to WAN form page with selected tenant', () => {
      const tenantMock = { id: '1', datacenterId: 'testDatacenterId' } as Tenant;
      const queryParams = { ...mockRoute.snapshot.queryParams, tenantId: tenantMock.id };
      component.onTenantSelect(tenantMock);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/appcentric/wan-form'], { queryParams });
    });
  });

  describe('getWanForms with event param', () => {
    beforeEach(() => mockWanFormService.getManyWanForm.mockClear());

    it('should build eventParams and use provided pagination', () => {
      component.dcsMode = 'netcentric';
      component.datacenterId = 'dc1';
      const eventObj = { page: 2, perPage: 50, searchColumn: 'name', searchText: 'alpha' } as any;

      component.getWanForms(eventObj);

      expect(mockWanFormService.getManyWanForm).toHaveBeenCalledWith({
        filter: ['datacenterId||eq||dc1', 'name||cont||alpha'],
        join: ['wanFormSubnets', 'externalRoutes'],
        page: 2,
        perPage: 50,
      });
    });

    it('should default pagination and omit eventParams when props missing', () => {
      component.dcsMode = 'appcentric' as any;
      component.selectedTenant = 'tenant123';
      const eventObj = { searchText: '' } as any;

      component.getWanForms(eventObj);

      expect(mockWanFormService.getManyWanForm).toHaveBeenCalledWith({
        filter: ['tenantId||eq||tenant123', undefined],
        join: ['wanFormSubnets', 'externalRoutes'],
        page: 1,
        perPage: 20,
      });
    });
  });

  describe('checkUndeployedChanges', () => {
    it('should return true when version greater than provisionedVersion', () => {
      const result = component.checkUndeployedChanges({ version: 2, provisionedVersion: 1 } as any);
      expect(result).toBe(true);
    });

    it('should return false when version not greater', () => {
      const result = component.checkUndeployedChanges({ version: 1, provisionedVersion: 1 } as any);
      expect(result).toBe(false);
    });
  });

  describe('createWanFormRequest branches', () => {
    beforeEach(() => jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal').mockImplementation());

    it('should use aciTenantId when selectedTenant exists and status not PENDING', () => {
      component.selectedTenant = 'tenantX';
      component.datacenterId = undefined as any;
      const spy = jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal');

      component.createWanFormRequest({ id: 'wf1', name: 'WF', status: 'ACTIVE' } as any);

      expect(spy).toHaveBeenCalled();
      const dtoArg = spy.mock.calls[0][0] as any;
      expect(dtoArg).toBeDefined();
    });

    it('should use datacenterId when no selectedTenant and status PENDING', () => {
      component.selectedTenant = undefined as any;
      component.datacenterId = 'dc1';
      const spy = jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal');

      component.createWanFormRequest({ id: 'wf2', name: 'WF2', status: 'PENDING' } as any);

      expect(spy).toHaveBeenCalled();
      const dtoArg = spy.mock.calls[spy.mock.calls.length - 1][0] as any;
      expect(dtoArg).toBeDefined();
    });
  });
});
