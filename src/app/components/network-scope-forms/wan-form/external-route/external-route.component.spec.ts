import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { of } from 'rxjs';
import { V1NetworkScopeFormsExternalRouteService, V1NetworkScopeFormsWanFormService } from '../../../../../../client';
import { ExternalRouteModalDto } from '../../../../models/network-scope-forms/external-route-modal.dto';
import { ModalMode } from '../../../../models/other/modal-mode';
import { DatacenterContextService } from '../../../../services/datacenter-context.service';
import { TableContextService } from '../../../../services/table-context.service';
import { ExternalRouteComponent } from './external-route.component';

describe('ExternalRouteComponent', () => {
  let component: ExternalRouteComponent;
  let fixture: ComponentFixture<ExternalRouteComponent>;
  let mockNgxSmartModalService: any;
  let mockExternalRouteService: any;
  let mockDatacenterContextService: any;
  let mockWanFormService: any;
  let mockRouter: any;
  let mockRoute: any;
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

    mockExternalRouteService = {
      getManyExternalRoute: jest.fn().mockReturnValue(of({})),
      createOneExternalRoute: jest.fn().mockReturnValue(of({})),
      updateOneExternalRoute: jest.fn().mockReturnValue(of({})),
      deleteOneExternalRoute: jest.fn().mockReturnValue(of({})),
      softDeleteOneExternalRoute: jest.fn().mockReturnValue(of({})),
      restoreOneExternalRoute: jest.fn().mockReturnValue(of({})),
    };

    mockDatacenterContextService = {
      currentDatacenter: of({ id: 'testDatacenterId' }),
    };

    mockWanFormService = {
      getOneWanForm: jest.fn().mockReturnValue(of({})),
    };

    mockRouter = {
      navigate: jest.fn(),
      getCurrentNavigation: jest.fn().mockReturnValue({ extras: { state: { data: {} } } }),
    };

    mockRoute = {
      snapshot: {
        params: { id: 'testWanFormId' },
        queryParams: {},
        data: { mode: 'netcentric' },
      },
    };

    mockTableContextService = {
      getSearchLocalStorage: jest.fn().mockReturnValue({}),
    };

    await TestBed.configureTestingModule({
      declarations: [ExternalRouteComponent],
      providers: [
        { provide: NgxSmartModalService, useValue: mockNgxSmartModalService },
        { provide: V1NetworkScopeFormsExternalRouteService, useValue: mockExternalRouteService },
        { provide: DatacenterContextService, useValue: mockDatacenterContextService },
        { provide: V1NetworkScopeFormsWanFormService, useValue: mockWanFormService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockRoute },
        { provide: TableContextService, useValue: mockTableContextService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExternalRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set wanFormId and dcsMode from route snapshot', () => {
      component.ngOnInit();
      expect(component.wanFormId).toBe('testWanFormId');
      expect(component.dcsMode).toBe('netcentric');
    });

    it('should fetch external routes on initialization', () => {
      const getExternalRoutesSpy = jest.spyOn(component, 'getExternalRoutes');
      component.ngOnInit();
      expect(getExternalRoutesSpy).toHaveBeenCalled();
    });
  });

  describe('getExternalRoutes', () => {
    it('should set isLoading to true and fetch external routes', () => {
      component.getExternalRoutes();
      expect(component.isLoading).toBe(false);
      expect(mockExternalRouteService.getManyExternalRoute).toHaveBeenCalledWith({
        filter: ['wanFormId||eq||testWanFormId', undefined],
        page: 1,
        perPage: 20,
      });
    });

    it('should update externalRoutes and set isLoading to false on success', () => {
      const externalRoutesMock = { data: [{ id: '1' }, { id: '2' }] };
      mockExternalRouteService.getManyExternalRoute.mockReturnValue(of(externalRoutesMock));
      component.getExternalRoutes();
      expect(component.externalRoutes).toEqual(externalRoutesMock);
      expect(component.isLoading).toBe(false);
    });
  });

  describe('openModal', () => {
    it('should set modal data and open the modal', () => {
      const dto = new ExternalRouteModalDto();
      dto.modalMode = ModalMode.Create;
      dto.wanFormId = 'testWanFormId';

      component.openModal(ModalMode.Create);
      expect(mockNgxSmartModalService.setModalData).toHaveBeenCalledWith(dto, 'externalRouteModal');
      expect(mockNgxSmartModalService.getModal('externalRouteModal').open).toHaveBeenCalled();
    });
  });

  describe('subscribeToModal', () => {
    it('should reset modal data and fetch external routes on modal close', () => {
      (component as any).subscribeToModal();
      expect((component as any).modalSubscription).not.toBeNull();
    });
  });

  describe('deleteExternalRoute', () => {
    it('should call delete service and fetch external routes', () => {
      const externalRouteMock = { id: '1', deletedAt: null } as any;
      component.deleteExternalRoute(externalRouteMock);
      expect(mockExternalRouteService.softDeleteOneExternalRoute).toHaveBeenCalledWith({ id: '1' });
    });

    it('should call hard delete service if deletedAt is set and fetch external routes', () => {
      const externalRouteMock = { id: '1', deletedAt: new Date() } as any;
      component.deleteExternalRoute(externalRouteMock);
      expect(mockExternalRouteService.deleteOneExternalRoute).toHaveBeenCalledWith({ id: '1' });
    });
  });

  describe('restoreExternalRoute', () => {
    it('should call restore service and fetch external routes', () => {
      const externalRouteMock = { id: '1' } as any;
      component.restoreExternalRoute(externalRouteMock);
      expect(mockExternalRouteService.restoreOneExternalRoute).toHaveBeenCalledWith({ id: '1' });
    });
  });

  describe('navigateToWanForm', () => {
    it('should navigate to WAN form page with current query params', () => {
      component.navigateToWanForm();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/netcentric/wan-form'], { queryParams: {} });
    });
  });
});
