import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { of, throwError } from 'rxjs';
import {
  V2RoutingInternalRoutesService,
  V1NetworkSubnetsService,
  V2AppCentricAppCentricSubnetsService,
  ExternalVrfConnection,
  V2RoutingExternalVrfConnectionsService,
} from '../../../../../client';
// import { InternalRouteModalDto } from '../../../models/network-scope-forms/internal-route-modal.dto';
import { ModalMode } from '../../../models/other/modal-mode';
import { TableContextService } from '../../../services/table-context.service';
import { MockComponent, MockFontAwesomeComponent, MockNgxSmartModalComponent } from '../../../../test/mock-components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { ApplicationMode } from '../../../models/other/application-mode-enum';
import { InternalRouteComponent } from './internal-route.component';

describe('InternalRoutesComponent', () => {
  let component: InternalRouteComponent;
  let fixture: ComponentFixture<InternalRouteComponent>;
  let mockNgxSmartModalService: any;
  let mockInternalRouteService: any;
  let mockExternalVrfConnectionService: any;
  let mockNetcentricSubnetService: any;
  let mockAppcentricSubnetService: any;
  let mockRouter: any;
  let mockRoute: any;
  let mockTableContextService: any;

  beforeEach(async () => {
    let capturedCloseCb: (() => void) | null = null;
    mockNgxSmartModalService = {
      close: jest.fn(),
      resetModalData: jest.fn(),
      getModalData: jest.fn().mockReturnValue({}),
      setModalData: jest.fn(),
      getModal: jest.fn().mockReturnValue({
        open: jest.fn(),
        onCloseFinished: {
          subscribe: jest.fn((cb: () => void) => {
            capturedCloseCb = cb;
            return { unsubscribe: jest.fn() };
          }),
        },
      }),
    };

    mockInternalRouteService = {
      getManyInternalRoute: jest.fn().mockReturnValue(of({ data: [{ id: 'ir-1' }] })),
      createOneInternalRoute: jest.fn().mockReturnValue(of({})),
      updateOneInternalRoute: jest.fn().mockReturnValue(of({})),
      deleteOneInternalRoute: jest.fn().mockReturnValue(of({})),
      softDeleteOneInternalRoute: jest.fn().mockReturnValue(of({})),
      restoreOneInternalRoute: jest.fn().mockReturnValue(of({})),
    };

    mockExternalVrfConnectionService = {
      getOneExternalVrfConnection: jest.fn().mockReturnValue(of({ id: 'testExternalVrfConnectionId' })),
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
        params: { id: 'testExternalVrfConnectionId' },
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
        MockComponent({ selector: 'app-internal-route-modal', inputs: ['externalVrfConnection'] }),
      ],
      imports: [FormsModule, ReactiveFormsModule],
      providers: [
        { provide: NgxSmartModalService, useValue: mockNgxSmartModalService },
        { provide: V2RoutingInternalRoutesService, useValue: mockInternalRouteService },
        { provide: V2RoutingExternalVrfConnectionsService, useValue: mockExternalVrfConnectionService },
        { provide: V1NetworkSubnetsService, useValue: mockNetcentricSubnetService },
        { provide: V2AppCentricAppCentricSubnetsService, useValue: mockAppcentricSubnetService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockRoute },
        { provide: TableContextService, useValue: mockTableContextService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InternalRouteComponent);
    component = fixture.componentInstance;
    component.externalVrfConnection = { id: 'testExternalVrfConnectionId' } as ExternalVrfConnection;
    fixture.detectChanges();
  });

  it('ngOnInit loads connection, routes, and children', () => {
    const spyGetInternal = jest.spyOn(component, 'getInternalRoutes');
    const spyChildren = jest.spyOn(component, 'getChildren');
    component.ngOnInit();
    expect(mockExternalVrfConnectionService.getOneExternalVrfConnection).toHaveBeenCalledWith({
      id: 'testExternalVrfConnectionId',
      relations: ['externalFirewall.externalVrfConnections'],
    });
    expect(spyGetInternal).toHaveBeenCalled();
    expect(spyChildren).toHaveBeenCalled();
  });

  it('getConnectionChildren requests relations', done => {
    component.getConnectionChildren().subscribe(() => {
      expect(mockExternalVrfConnectionService.getOneExternalVrfConnection).toHaveBeenCalled();
      done();
    });
  });

  it('onTableEvent forwards event to getInternalRoutes', () => {
    const evt = { page: 2, perPage: 50 } as any;
    const spy = jest.spyOn(component, 'getInternalRoutes');
    component.onTableEvent(evt);
    expect(spy).toHaveBeenCalledWith(evt);
  });

  it('openModal sets modal data and opens', () => {
    const spySub = jest.spyOn<any, any>(component as any, 'subscribeToModal');
    component.tenantId = 'tenant-1';
    const route = { id: 'ir-1' } as any;
    component.openModal(ModalMode.Create, route);
    expect(spySub).toHaveBeenCalled();
    expect(mockNgxSmartModalService.setModalData).toHaveBeenCalled();
    expect(mockNgxSmartModalService.getModal).toHaveBeenCalledWith('internalRouteModal');
  });

  it('subscribeToModal refreshes routes with and without filteredResults', () => {
    const spyGet = jest.spyOn(component, 'getInternalRoutes');
    // else branch
    (component as any).subscribeToModal();
    // simulate modal close
    const modalInstance = mockNgxSmartModalService.getModal.mock.results[0].value;
    const subscribeMock = modalInstance.onCloseFinished.subscribe as jest.Mock;
    const cb = (subscribeMock.mock.calls[0] || [])[0] as () => void;
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    cb && cb();
    expect(spyGet).toHaveBeenCalled();

    // filteredResults true branch
    spyGet.mockClear();
    mockTableContextService.getSearchLocalStorage.mockReturnValue({ filteredResults: true });
    (component as any).subscribeToModal();
    const subscribeMock2 = modalInstance.onCloseFinished.subscribe as jest.Mock;
    const cb2 = (subscribeMock2.mock.calls[1] || [])[0] as () => void;
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    cb2 && cb2();
    expect(spyGet).toHaveBeenCalled();
  });

  it('getInternalRoutes success without event', () => {
    component.getInternalRoutes();
    expect(mockInternalRouteService.getManyInternalRoute).toHaveBeenCalledWith({
      filter: ['externalVrfConnectionId||eq||testExternalVrfConnectionId'],
      join: ['appcentricSubnet'],
      page: component.tableComponentDto.page,
      perPage: component.tableComponentDto.perPage,
    });
    expect(component.isLoading).toBe(false);
    expect(component.internalRoutes).toEqual({ data: [{ id: 'ir-1' }] });
  });

  it('getInternalRoutes success with event', () => {
    const evt = { page: 3, perPage: 10 };
    component.getInternalRoutes(evt);
    expect(mockInternalRouteService.getManyInternalRoute).toHaveBeenCalledWith({
      filter: ['externalVrfConnectionId||eq||testExternalVrfConnectionId'],
      join: ['appcentricSubnet'],
      page: 3,
      perPage: 10,
    });
  });

  it('getInternalRoutes error clears loading', () => {
    mockInternalRouteService.getManyInternalRoute.mockReturnValueOnce(throwError(() => new Error('fail')));
    component.getInternalRoutes();
    expect(component.isLoading).toBe(false);
  });

  it('deleteInternalRoute calls hard delete when deletedAt is truthy', () => {
    const spyRefresh = jest.spyOn(component, 'getInternalRoutes');
    component.deleteInternalRoute({ id: 'ir-1', deletedAt: 'now' } as any);
    expect(mockInternalRouteService.deleteOneInternalRoute).toHaveBeenCalledWith({ id: 'ir-1' });
    expect(spyRefresh).toHaveBeenCalled();
  });

  it('deleteInternalRoute calls soft delete when not deleted', () => {
    const spyRefresh = jest.spyOn(component, 'getInternalRoutes');
    component.deleteInternalRoute({ id: 'ir-2' } as any);
    expect(mockInternalRouteService.softDeleteOneInternalRoute).toHaveBeenCalledWith({ id: 'ir-2' });
    expect(spyRefresh).toHaveBeenCalled();
  });

  it('restoreInternalRoute calls restore and refresh', () => {
    const spyRefresh = jest.spyOn(component, 'getInternalRoutes');
    component.restoreInternalRoute({ id: 'ir-3' } as any);
    expect(mockInternalRouteService.restoreOneInternalRoute).toHaveBeenCalledWith({ id: 'ir-3' });
    expect(spyRefresh).toHaveBeenCalled();
  });

  it('getChildren calls correct branch by mode', () => {
    const spyBD = jest.spyOn(component, 'getSubnetBridgeDomains');
    (component as any).applicationMode = 'netcentric';
    component.getChildren();
    expect(spyBD).not.toHaveBeenCalled();

    spyBD.mockClear();
    (component as any).applicationMode = 'appcentric';
    component.getChildren();
    expect(spyBD).toHaveBeenCalled();
  });

  it('getSubnetBridgeDomains populates map', () => {
    mockAppcentricSubnetService.getManyAppCentricSubnet.mockReturnValueOnce(
      of([
        { id: 's1', bridgeDomain: { id: 'bd1', name: 'BD 1' } },
        { id: 's2', bridgeDomain: { id: 'bd2', name: 'BD 2' } },
      ]),
    );
    component.tenantId = 'tenant-1';
    component.getSubnetBridgeDomains();
    expect(component.subnetBridgeDomains.get('s1')?.name).toBe('BD 1');
    expect(component.subnetBridgeDomains.get('s2')?.name).toBe('BD 2');
  });
});
