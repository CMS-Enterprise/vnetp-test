import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExternalRouteComponent } from './external-route.component';
import { ActivatedRoute, Router } from '@angular/router';
import { V1NetworkScopeFormsWanFormService, V1RuntimeDataExternalRouteService } from '../../../../../../client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { RuntimeDataService } from '../../../../services/runtime-data.service';
import { MockComponent, MockFontAwesomeComponent } from '../../../../../test/mock-components';
import { of, throwError } from 'rxjs';

describe('ExternalRouteComponent', () => {
  let component: ExternalRouteComponent;
  let fixture: ComponentFixture<ExternalRouteComponent>;
  let mockActivatedRoute: any;
  let mockExternalRouteService: any;
  let mockWanFormService: any;
  let mockRuntimeDataService: any;
  let mockRouter: any;
  let mockNgx: any;

  beforeEach(async () => {
    mockActivatedRoute = {
      snapshot: {
        params: {
          id: 'id',
        },
        data: {
          mode: 'mode',
        },
        queryParams: { id: 'id' },
      },
    };
    mockExternalRouteService = {
      getManyExternalRoute: jest.fn(),
      createRuntimeDataJobExternalRoute: jest.fn(),
      deleteOneExternalRoute: jest.fn(),
    };
    mockWanFormService = {
      getOneWanForm: jest.fn().mockReturnValue(of({})),
      addRouteToWanFormWanForm: jest.fn(),
      removeRouteFromWanFormWanForm: jest.fn(),
    };
    mockRuntimeDataService = {
      isRecentlyRefreshed: jest.fn(),
      pollJobStatus: jest.fn(),
    };
    mockRouter = {
      navigate: jest.fn(),
    };
    mockNgx = {
      setModalData: jest.fn(),
      getModal: jest.fn().mockReturnValue({
        open: jest.fn(),
        onCloseFinished: of({}),
      }),
      resetModalData: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [],
      declarations: [ExternalRouteComponent, MockFontAwesomeComponent, MockComponent({ selector: 'app-external-route-modal' })],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: V1NetworkScopeFormsWanFormService, useValue: mockWanFormService },
        { provide: V1RuntimeDataExternalRouteService, useValue: mockExternalRouteService },
        { provide: NgxSmartModalService, useValue: mockNgx },
        { provide: Router, useValue: mockRouter },
        { provide: RuntimeDataService, useValue: mockRuntimeDataService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExternalRouteComponent);
    component = fixture.componentInstance;
    component.getAllRoutes = jest.fn().mockImplementation(() => {});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('sortedRoutes', () => {
    it('should sort routes with wanForm before routes without wanForm', () => {
      component.filteredRoutes = [
        { wanForms: null, protocol: 'manual' },
        { wanForms: [{ id: 'wan1' }], protocol: 'auto' },
      ] as any;
      component.wanFormId = 'wan1';

      const sorted = component.sortedRoutes;

      expect(sorted).toEqual([
        { wanForms: [{ id: 'wan1' }], protocol: 'auto' },
        { wanForms: null, protocol: 'manual' },
      ]);
    });

    it('should sort routes without wanForm after routes with wanForm', () => {
      component.filteredRoutes = [
        { wanForms: [{ id: 'wan1' }], protocol: 'auto' },
        { wanForms: null, protocol: 'manual' },
      ] as any;
      component.wanFormId = 'wan1';

      const sorted = component.sortedRoutes;

      expect(sorted).toEqual([
        { wanForms: [{ id: 'wan1' }], protocol: 'auto' },
        { wanForms: null, protocol: 'manual' },
      ]);
    });

    it('should sort routes with protocol "manual" before other protocols', () => {
      component.filteredRoutes = [
        { wanForms: null, protocol: 'auto' },
        { wanForms: null, protocol: 'manual' },
      ] as any;

      const sorted = component.sortedRoutes;

      expect(sorted).toEqual([
        { wanForms: null, protocol: 'manual' },
        { wanForms: null, protocol: 'auto' },
      ]);
    });

    it('should sort routes with non-manual protocol after manual protocol', () => {
      component.filteredRoutes = [
        { wanForms: null, protocol: 'manual' },
        { wanForms: null, protocol: 'auto' },
      ] as any;

      const sorted = component.sortedRoutes;

      expect(sorted).toEqual([
        { wanForms: null, protocol: 'manual' },
        { wanForms: null, protocol: 'auto' },
      ]);
    });

    it('should keep routes in order if they have the same wanForm and protocol', () => {
      component.filteredRoutes = [
        { wanForms: null, protocol: 'auto' },
        { wanForms: null, protocol: 'auto' },
      ] as any;

      const sorted = component.sortedRoutes;

      expect(sorted).toEqual([
        { wanForms: null, protocol: 'auto' },
        { wanForms: null, protocol: 'auto' },
      ]);
    });

    it('should handle empty filteredRoutes', () => {
      component.filteredRoutes = [];

      const sorted = component.sortedRoutes;

      expect(sorted).toEqual([]);
    });

    it('should handle null filteredRoutes', () => {
      component.filteredRoutes = null;

      const sorted = component.sortedRoutes;

      expect(sorted).toBeUndefined();
    });
  });

  it('should add route to wanForm and call getAllRoutes', () => {
    jest.spyOn(mockWanFormService, 'addRouteToWanFormWanForm').mockReturnValue(of({}));
    component.wanForm = { id: 'wan1' } as any;
    const route = { id: 'route1' } as any;
    component.addRouteToWanForm(route);

    expect(mockWanFormService.addRouteToWanFormWanForm).toHaveBeenCalledWith({ wanId: 'wan1', routeId: 'route1' });
    expect(component.getAllRoutes).toHaveBeenCalled();
  });

  it('should remove route from wanForm and call getAllRoutes', () => {
    jest.spyOn(mockWanFormService, 'removeRouteFromWanFormWanForm').mockReturnValue(of({}));
    component.wanForm = { id: 'wan1' } as any;
    const route = { id: 'route1' } as any;
    component.removeRouteFromWanForm(route);

    expect(mockWanFormService.removeRouteFromWanFormWanForm).toHaveBeenCalledWith({ wanId: 'wan1', routeId: 'route1' });
    expect(component.getAllRoutes).toHaveBeenCalled();
  });

  describe('refreshRuntimeData', () => {
    it('should return if isRecentlyRefreshed is true', () => {
      jest.spyOn(component, 'isRecentlyRefreshed').mockReturnValue(true);
      const serviceSpy = jest.spyOn(mockExternalRouteService, 'createRuntimeDataJobExternalRoute');
      component.refreshRuntimeData();
      expect(serviceSpy).not.toHaveBeenCalled();
    });

    it('should return if isRefreshingRuntimeData is true', () => {
      jest.spyOn(component, 'isRecentlyRefreshed').mockReturnValue(false);
      const serviceSpy = jest.spyOn(mockExternalRouteService, 'createRuntimeDataJobExternalRoute');
      component.isRefreshingRuntimeData = true;
      component.refreshRuntimeData();
      expect(serviceSpy).not.toHaveBeenCalled();
    });

    it('should call getAciRuntimeData when polling is complete', () => {
      jest.spyOn(component, 'isRecentlyRefreshed').mockReturnValue(false);
      component.isRefreshingRuntimeData = false;
      jest.spyOn(mockExternalRouteService, 'createRuntimeDataJobExternalRoute').mockReturnValue(of({ id: '1' }));
      jest.spyOn(mockRuntimeDataService, 'pollJobStatus').mockReturnValue(of({ status: 'successful' }));
      const getAciRuntimeDataSpy = jest.spyOn(component, 'getAllRoutes');
      component.refreshRuntimeData();
      expect(getAciRuntimeDataSpy).toHaveBeenCalled();
      expect(component.jobStatus).toEqual('successful');
    });

    it('should set jobStatus to error when polling errors', () => {
      jest.spyOn(component, 'isRecentlyRefreshed').mockReturnValue(false);
      component.isRefreshingRuntimeData = false;
      jest.spyOn(mockExternalRouteService, 'createRuntimeDataJobExternalRoute').mockReturnValue(of({ id: '1' }));
      jest.spyOn(mockRuntimeDataService, 'pollJobStatus').mockReturnValue(throwError('Polling error'));
      component.refreshRuntimeData();
      expect(component.jobStatus).toEqual('error');
    });
  });

  describe('getTooltipMessage', () => {
    it('should return "Job Status: Failed" when status is "failed"', () => {
      const message = component.getTooltipMessage('failed');
      expect(message).toEqual('Job Status: Failed');
    });

    it('should return "Job Status: Timeout" when status is "running"', () => {
      const message = component.getTooltipMessage('running');
      expect(message).toEqual('Job Status: Timeout');
    });

    it('should return "An error occurred during polling" when status is "error"', () => {
      const message = component.getTooltipMessage('error');
      expect(message).toEqual('An error occurred during polling');
    });

    it('should return an status string for any other status', () => {
      const message = component.getTooltipMessage('success');
      expect(message).toEqual('success');
    });
  });

  it('should navigate to wan form', () => {
    const navigateSpy = jest.spyOn(mockRouter, 'navigate');
    component.navigateToWanForm();
    expect(navigateSpy).toHaveBeenCalledWith(['/mode/wan-form'], { queryParams: { id: 'id' } });
  });

  it('should delete route', () => {
    const route = { id: 'route1' } as any;
    const deleteSpy = jest.spyOn(mockExternalRouteService, 'deleteOneExternalRoute').mockReturnValue(of({}));
    const getAllRoutesSpy = jest.spyOn(component, 'getAllRoutes');
    component.deleteRoute(route);
    expect(deleteSpy).toHaveBeenCalledWith({ id: 'route1' });
    expect(getAllRoutesSpy).toHaveBeenCalled();
  });

  it('should open route table modal', () => {
    component.wanFormId = 'wan1';
    (component as any).modalSubscription = of({}).subscribe();
    const setModalDataSpy = jest.spyOn(mockNgx, 'setModalData');
    component.openModal();
    expect(setModalDataSpy).toHaveBeenCalledWith({ wanFormId: 'wan1' }, 'externalRouteModal');
  });

  describe('onSearch', () => {
    beforeEach(() => {
      component.routes = [
        { network: '192.168.1.0', vrf: 'VRF1', metric: 10, prefixLength: 24, protocol: 'manual' },
        { network: '10.0.0.0', vrf: 'VRF2', metric: 20, prefixLength: 45, protocol: 'auto' },
        { network: '172.16.0.0', vrf: 'VRF3', metric: 30, prefixLength: 12, protocol: 'manual' },
      ];
    });
    it('should reset filteredRoutes to routes if searchQuery is empty', () => {
      component.searchQuery = '';
      component.onSearch();
      expect(component.filteredRoutes).toEqual(component.routes);
    });

    it('should filter routes by network', () => {
      component.searchQuery = '192.168.1.0';
      component.onSearch();
      expect(component.filteredRoutes).toEqual([{ network: '192.168.1.0', vrf: 'VRF1', metric: 10, prefixLength: 24, protocol: 'manual' }]);
    });

    it('should filter routes by vrf', () => {
      component.searchQuery = 'VRF2';
      component.onSearch();
      expect(component.filteredRoutes).toEqual([{ network: '10.0.0.0', vrf: 'VRF2', metric: 20, prefixLength: 45, protocol: 'auto' }]);
    });

    it('should filter routes by metric', () => {
      component.searchQuery = '30';
      component.onSearch();
      expect(component.filteredRoutes).toEqual([{ network: '172.16.0.0', vrf: 'VRF3', metric: 30, prefixLength: 12, protocol: 'manual' }]);
    });

    it('should filter routes by prefixLength', () => {
      component.searchQuery = '45';
      component.onSearch();
      expect(component.filteredRoutes).toEqual([{ network: '10.0.0.0', vrf: 'VRF2', metric: 20, prefixLength: 45, protocol: 'auto' }]);
    });

    it('should filter routes by protocol', () => {
      component.searchQuery = 'manual';
      component.onSearch();
      expect(component.filteredRoutes).toEqual([
        { network: '192.168.1.0', vrf: 'VRF1', metric: 10, prefixLength: 24, protocol: 'manual' },
        { network: '172.16.0.0', vrf: 'VRF3', metric: 30, prefixLength: 12, protocol: 'manual' },
      ]);
    });

    it('should filter routes by network/prefixLength combination', () => {
      component.searchQuery = '192.168.1.0/24';
      component.onSearch();
      expect(component.filteredRoutes).toEqual([{ network: '192.168.1.0', vrf: 'VRF1', metric: 10, prefixLength: 24, protocol: 'manual' }]);
    });
  });
});
