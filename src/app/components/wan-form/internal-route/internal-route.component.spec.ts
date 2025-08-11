import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { of, Subject, throwError } from 'rxjs';
import {
  V1NetworkScopeFormsInternalRoutesService,
  V1NetworkScopeFormsWanFormService,
  V1NetworkSubnetsService,
  V2AppCentricAppCentricSubnetsService,
  WanForm,
} from '../../../../../client';
import { InternalRouteModalDto } from '../../../models/network-scope-forms/internal-route-modal.dto';
import { ModalMode } from '../../../models/other/modal-mode';
import { TableContextService } from '../../../services/table-context.service';
import { MockComponent, MockFontAwesomeComponent, MockNgxSmartModalComponent } from '../../../../test/mock-components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApplicationMode } from '../../../models/other/application-mode-enum';
import { InternalRouteComponent } from './internal-route.component';

describe('InternalRoutesComponent', () => {
  let component: InternalRouteComponent;
  let fixture: ComponentFixture<InternalRouteComponent>;
  let mockNgxSmartModalService: any;
  let mockInternalRouteService: any;
  let mockWanFormService: any;
  let mockNetcentricSubnetService: any;
  let mockAppcentricSubnetService: any;
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

    mockInternalRouteService = {
      getManyInternalRoute: jest.fn().mockReturnValue(of({})),
      createOneInternalRoute: jest.fn().mockReturnValue(of({})),
      updateOneInternalRoute: jest.fn().mockReturnValue(of({})),
      deleteOneInternalRoute: jest.fn().mockReturnValue(of({})),
      softDeleteOneInternalRoute: jest.fn().mockReturnValue(of({})),
      restoreOneInternalRoute: jest.fn().mockReturnValue(of({})),
    };

    mockWanFormService = {
      getOneWanForm: jest.fn().mockReturnValue(of({})),
    };

    mockNetcentricSubnetService = {
      getSubnetsByDatacenterIdSubnet: jest.fn().mockReturnValue(of([])),
    };

    mockAppcentricSubnetService = {
      getManyAppCentricSubnet: jest.fn().mockReturnValue(of([])),
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
      declarations: [
        MockNgxSmartModalComponent,
        InternalRouteComponent,
        MockFontAwesomeComponent,
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
        MockComponent({ selector: 'app-internal-route-modal', inputs: ['vrfId'] }),
      ],
      imports: [FormsModule, ReactiveFormsModule],
      providers: [
        { provide: NgxSmartModalService, useValue: mockNgxSmartModalService },
        { provide: V1NetworkScopeFormsInternalRoutesService, useValue: mockInternalRouteService },
        { provide: V1NetworkScopeFormsWanFormService, useValue: mockWanFormService },
        { provide: V1NetworkSubnetsService, useValue: mockNetcentricSubnetService },
        { provide: V2AppCentricAppCentricSubnetsService, useValue: mockAppcentricSubnetService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockRoute },
        { provide: TableContextService, useValue: mockTableContextService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InternalRouteComponent);
    component = fixture.componentInstance;
    component.wanForm = { id: 'testWanFormId' } as WanForm;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should fetch WAN form subnets on initialization', () => {
      const getInternalRoutesSpy = jest.spyOn(component, 'getInternalRoutes');
      const getChildrenSpy = jest.spyOn(component, 'getChildren');
      component.ngOnInit();
      expect(getInternalRoutesSpy).toHaveBeenCalled();
      expect(getChildrenSpy).toHaveBeenCalled();
    });
  });

  describe('getInternalRoutes', () => {
    it('should call service and unset loading (default params)', () => {
      component.getInternalRoutes();
      expect(mockInternalRouteService.getManyInternalRoute).toHaveBeenCalled();
      expect(component.isLoading).toBe(false);
    });

    it('should update internalRoutes and set isLoading to false on success', () => {
      const internalRoutesMock = { data: [{ id: '1' }, { id: '2' }] };
      mockInternalRouteService.getManyInternalRoute.mockReturnValue(of(internalRoutesMock));
      component.getInternalRoutes();
      expect(component.internalRoutes).toEqual(internalRoutesMock);
      expect(component.isLoading).toBe(false);
    });

    it('should apply event paging and search filter when provided', () => {
      const evt: any = { page: 3, perPage: 50, searchColumn: 'description', searchText: 'term' };
      mockInternalRouteService.getManyInternalRoute.mockClear();
      component.getInternalRoutes(evt);
      const args = mockInternalRouteService.getManyInternalRoute.mock.calls[0][0];
      expect(args.filter).toEqual(['wanFormId||eq||testWanFormId', 'description||cont||term']);
      expect(args.page).toBe(3);
      expect(args.perPage).toBe(50);
    });

    it('should default page/perPage when event has nullish values and omit search filter when incomplete', () => {
      const evt: any = { page: undefined, perPage: undefined, searchColumn: 'description', searchText: '' };
      mockInternalRouteService.getManyInternalRoute.mockClear();
      component.getInternalRoutes(evt);
      const args = mockInternalRouteService.getManyInternalRoute.mock.calls[0][0];
      expect(args.filter).toEqual(['wanFormId||eq||testWanFormId']);
      expect(args.page).toBe(1);
      expect(args.perPage).toBe(20);
    });

    it('should unset loading on error', () => {
      mockInternalRouteService.getManyInternalRoute.mockReturnValue(throwError(() => new Error('boom')));
      component.getInternalRoutes();
      expect(component.isLoading).toBe(false);
    });
  });

  describe('openModal', () => {
    it('should set modal data and open the modal', () => {
      const subSpy = jest.spyOn(component as any, 'subscribeToModal');
      const dto = new InternalRouteModalDto();
      dto.modalMode = ModalMode.Create;
      dto.wanForm = component.wanForm;

      component.openModal(ModalMode.Create);
      expect(subSpy).toHaveBeenCalled();
      expect(mockNgxSmartModalService.setModalData).toHaveBeenCalledWith(dto, 'internalRouteModal');
      expect(mockNgxSmartModalService.getModal('internalRouteModal').open).toHaveBeenCalled();
    });
  });

  describe('subscribeToModal', () => {
    it('should reset modal data and fetch WAN form subnets on modal close without filters', () => {
      const subject = new Subject<any>();
      mockNgxSmartModalService.getModal.mockReturnValue({ onCloseFinished: subject.asObservable() });
      const getSpy = jest.spyOn(component, 'getInternalRoutes');
      (component as any).subscribeToModal();
      expect((component as any).modalSubscription).toBeTruthy();
      // no filteredResults
      (mockTableContextService.getSearchLocalStorage as jest.Mock).mockReturnValue({});
      subject.next({});
      expect(mockNgxSmartModalService.resetModalData).toHaveBeenCalledWith('internalRouteModal');
      expect(getSpy).toHaveBeenCalledWith();
    });

    it('should fetch with params when filteredResults present', () => {
      const subject = new Subject<any>();
      mockNgxSmartModalService.getModal.mockReturnValue({ onCloseFinished: subject.asObservable() });
      const getSpy = jest.spyOn(component, 'getInternalRoutes');
      (component as any).subscribeToModal();
      const params = { filteredResults: true, page: 2, perPage: 10 } as any;
      (mockTableContextService.getSearchLocalStorage as jest.Mock).mockReturnValue(params);
      subject.next({});
      expect(getSpy).toHaveBeenCalledWith(params);
    });
  });

  describe('deleteInternalRoute', () => {
    it('should call delete service and fetch WAN form subnets', () => {
      const internalRouteMock = { id: '1', deletedAt: null } as any;
      component.deleteInternalRoute(internalRouteMock);
      expect(mockInternalRouteService.softDeleteOneInternalRoute).toHaveBeenCalledWith({ id: '1' });
    });

    it('should call hard delete service if deletedAt is set and fetch WAN form subnets', () => {
      const internalRouteMock = { id: '1', deletedAt: new Date() } as any;
      component.deleteInternalRoute(internalRouteMock);
      expect(mockInternalRouteService.deleteOneInternalRoute).toHaveBeenCalledWith({ id: '1' });
    });
  });

  describe('restoreInternalRoute', () => {
    it('should call restore service and fetch WAN form subnets', () => {
      const internalRouteMock = { id: '1' } as any;
      component.restoreInternalRoute(internalRouteMock);
      expect(mockInternalRouteService.restoreOneInternalRoute).toHaveBeenCalledWith({ id: '1' });
    });
  });

  it('onTableEvent should update dto and call getInternalRoutes with event', () => {
    const evt = { page: 7, perPage: 15, searchColumn: 'description', searchText: 'x' } as any;
    const spy = jest.spyOn(component, 'getInternalRoutes');
    component.onTableEvent(evt);
    expect(component.tableComponentDto).toBe(evt);
    expect(spy).toHaveBeenCalledWith(evt);
  });

  describe('getChildren', () => {
    it('should call getSubnetVlans if dcsMode is netcentric', () => {
      const getSubnetVlansSpy = jest.spyOn(component, 'getSubnetVlans');
      component.applicationMode = ApplicationMode.NETCENTRIC;
      component.getChildren();
      expect(getSubnetVlansSpy).toHaveBeenCalled();
    });

    it('should call getSubnetBridgeDomains if dcsMode is appcentric', () => {
      const getSubnetBridgeDomainsSpy = jest.spyOn(component, 'getSubnetBridgeDomains');
      component.applicationMode = ApplicationMode.APPCENTRIC;
      component.getChildren();
      expect(getSubnetBridgeDomainsSpy).toHaveBeenCalled();
    });
  });

  describe('getSubnetVlans', () => {
    it('should fetch subnet VLANs for netcentric mode', () => {
      const netcentricSubnetsMock = [{ id: '1', vlan: {} }];
      mockNetcentricSubnetService.getSubnetsByDatacenterIdSubnet.mockReturnValue(of(netcentricSubnetsMock));
      component.getSubnetVlans();
      expect(component.subnetVlans.get('1')).toEqual({});
    });
  });

  describe('getSubnetBridgeDomains', () => {
    it('should fetch subnet bridge domains for appcentric mode', () => {
      const appcentricSubnetsMock = [{ id: '1', bridgeDomain: {} }];
      mockAppcentricSubnetService.getManyAppCentricSubnet.mockReturnValue(of(appcentricSubnetsMock));
      component.getSubnetBridgeDomains();
      expect(component.subnetBridgeDomains.get('1')).toEqual({});
    });

    it('should handle error path', () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined as any);
      component.wanForm = { id: 'testWanFormId', tenantId: 'tenant-1' } as any;
      mockAppcentricSubnetService.getManyAppCentricSubnet.mockReturnValue(throwError(() => new Error('fail')));
      component.getSubnetBridgeDomains();
      expect(logSpy).toHaveBeenCalledWith('tenant-1');
      logSpy.mockRestore();
    });
  });
});
