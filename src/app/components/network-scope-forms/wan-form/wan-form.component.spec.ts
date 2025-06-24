import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { of, Subscription } from 'rxjs';
import { Tenant, V1NetworkScopeFormsWanFormService, V2AppCentricTenantsService } from '../../../../../client';
import { WanFormModalDto } from '../../../models/network-scope-forms/wan-form-modal.dto';
import { ModalMode } from '../../../models/other/modal-mode';
import { DatacenterContextService } from '../../../services/datacenter-context.service';
import { TableContextService } from '../../../services/table-context.service';
import SubscriptionUtil from '../../../utils/SubscriptionUtil';
import { WanFormComponent } from './wan-form.component';
import { MockComponent, MockFontAwesomeComponent, MockYesNoModalComponent } from 'src/test/mock-components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';

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
  });

  describe('subscribeToModal', () => {
    it('should reset modal data and fetch WAN forms on modal close', () => {
      (component as any).subscribeToModal();
      expect((component as any).wanFormModalSubscription).not.toBeNull();
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
});
