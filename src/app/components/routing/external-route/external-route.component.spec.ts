import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExternalRouteComponent } from './external-route.component';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { of, Subject } from 'rxjs';
import {
  V3GlobalExternalRoutesService,
  V2AppCentricVrfsService,
  V2RoutingExternalVrfConnectionsService,
} from '../../../../../client';
import { MockFontAwesomeComponent, MockComponent } from '../../../../test/mock-components';
import { RuntimeDataService } from '../../../services/runtime-data.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';

describe('ExternalRouteComponent', () => {
  let component: ExternalRouteComponent;
  let fixture: ComponentFixture<ExternalRouteComponent>;
  let mockActivatedRoute: any;
  let mockExternalRouteService: any;
    let mockExternalVrfConnectionService: any;
  let mockGlobalExternalRouteService: any;
  let mockVrfService: any;
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
      softDeleteOneExternalRoute: jest.fn(),
      restoreOneExternalRoute: jest.fn(),
      createOneExternalRoute: jest.fn(),
    };
    mockExternalVrfConnectionService = {
      getOneExternalVrfConnection: jest.fn().mockReturnValue(of({})),
      addRouteToExternalVrfConnectionExternalVrfConnection: jest.fn(),
      removeRouteFromExternalVrfConnectionExternalVrfConnection: jest.fn(),
    };
    mockGlobalExternalRouteService = {
      getManyExternalRoutes: jest.fn(),
    };
    mockVrfService = {
      getOneVrf: jest.fn().mockReturnValue(of({ id: 'vrfId', externalVrfs: [] })),
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
      imports: [
        HttpClientTestingModule,
        MatSortModule,
        MatPaginatorModule,
        NoopAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        MatTableModule,
        MatTabsModule,
        MatIconModule,
        MatFormFieldModule,
        MatSelectModule,
      ],
      declarations: [ExternalRouteComponent, MockFontAwesomeComponent, MockComponent({ selector: 'app-external-route-modal' })],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: V2RoutingExternalVrfConnectionsService, useValue: mockExternalVrfConnectionService },
        { provide: V3GlobalExternalRoutesService, useValue: mockGlobalExternalRouteService },
        { provide: V2AppCentricVrfsService, useValue: mockVrfService },
        { provide: NgxSmartModalService, useValue: mockNgx },
        { provide: Router, useValue: mockRouter },
        { provide: RuntimeDataService, useValue: mockRuntimeDataService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExternalRouteComponent);
    component = fixture.componentInstance;
    component.vrfId = 'vrfId';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should soft delete route', () => {
    const route = { id: 'route1' } as any;
    const deleteSpy = jest.spyOn(mockExternalRouteService, 'softDeleteOneExternalRoute').mockReturnValue(of({}));
    const getAllRoutesSpy = jest.spyOn(component, 'getAllRoutes');
    component.deleteRoute(route);
    expect(deleteSpy).toHaveBeenCalledWith({ id: 'route1' });
    expect(getAllRoutesSpy).toHaveBeenCalled();
  });

  it('should delete route', () => {
    const route = { id: 'route1', deletedAt: '2021-01-01' } as any;
    const deleteSpy = jest.spyOn(mockExternalRouteService, 'deleteOneExternalRoute').mockReturnValue(of({}));
    const getAllRoutesSpy = jest.spyOn(component, 'getAllRoutes');
    component.deleteRoute(route);
    expect(deleteSpy).toHaveBeenCalledWith({ id: 'route1' });
    expect(getAllRoutesSpy).toHaveBeenCalled();
  });

  it('should open route table modal', () => {
    component.externalVrfConnection = { id: 'externalVrfConnection1' } as any;
    (component as any).modalSubscription = of({}).subscribe();
    const setModalDataSpy = jest.spyOn(mockNgx, 'setModalData');
    component.openModal();
    expect(setModalDataSpy).toHaveBeenCalledWith({ externalVrfConnectionId: 'externalVrfConnection1' }, 'externalRouteModal');
  });

  it('ngOnInit should load vrf then getAllRoutes', () => {
    const vrf = { id: 'vrfId', externalVrfs: ['A', 'B'] };
    (mockVrfService.getOneVrf as jest.Mock).mockReturnValue(of(vrf));
    const getAllSpy = jest.spyOn(component, 'getAllRoutes');
    component.ngOnInit();
    expect(mockVrfService.getOneVrf).toHaveBeenCalledWith({ id: 'vrfId' });
    expect(component.parentVrf).toEqual(vrf as any);
    expect(getAllSpy).toHaveBeenCalled();
  });

  it('ngAfterViewInit should wire up sorts and paginators', () => {
    const assignedSort = {} as any;
    const availableSort = {} as any;
    const assignedPaginator = {} as any;
    const availablePaginator = {} as any;
    (component as any).assignedRoutesSort = assignedSort;
    (component as any).availableRoutesSort = availableSort;
    (component as any).assignedRoutesPaginator = assignedPaginator;
    (component as any).availableRoutesPaginator = availablePaginator;
    component.ngAfterViewInit();
    expect(component.assignedRoutesDataSource.sort).toBe(assignedSort);
    expect(component.availableRoutesDataSource.sort).toBe(availableSort);
    expect(component.assignedRoutesDataSource.paginator).toBe(assignedPaginator);
    expect(component.availableRoutesDataSource.paginator).toBe(availablePaginator);
  });

  it('addRouteToWanForm should call service and refresh', () => {
    component.externalVrfConnection = { id: 'externalVrfConnection1' } as any;
    (mockExternalRouteService.createOneExternalRoute as jest.Mock).mockReturnValue(of({}));
    const refreshSpy = jest.spyOn(component, 'getAllRoutes');
    component.addRouteToExternalVrfConnection({ id: 'g1' } as any);
    expect(mockExternalRouteService.createOneExternalRoute).toHaveBeenCalledWith({
      externalRoute: { externalVrfConnectionId: 'externalVrfConnection1', globalExternalRouteId: 'g1' },
    });
    expect(refreshSpy).toHaveBeenCalled();
  });

  it('removeRouteFromWanForm should delegate to deleteRoute', () => {
    const route = { id: 'r1' } as any;
    const spy = jest.spyOn(component, 'deleteRoute').mockImplementation(() => undefined as any);
    component.removeRouteFromExternalVrfConnection(route);
    expect(spy).toHaveBeenCalledWith(route);
  });

  it('getAllRoutes should orchestrate fetches and process data', () => {
    component.externalVrfConnection = { externalFirewall: { externalVrfConnections: [{ externalVrf: 'A' }, { externalVrf: 'B' }] } } as any;
    const globals = [{ id: 'g1' }];
    const assigned = [{ id: 'a1', globalExternalRouteId: 'g1' }];
    const fetchGlobalsSpy = jest.spyOn(component as any, '_fetchGlobalRoutes').mockReturnValue(of(globals as any));
    const fetchAssignedSpy = jest.spyOn(component as any, '_fetchAssignedRoutes').mockReturnValue(of(assigned as any));
    const processSpy = jest.spyOn(component as any, '_processRoutesData');
    // restore real method (it was not stubbed globally now, but ensure correct binding)
    ExternalRouteComponent.prototype.getAllRoutes.call(component);
    expect(fetchGlobalsSpy).toHaveBeenCalledWith('A,B');
    expect(fetchAssignedSpy).toHaveBeenCalled();
    expect(processSpy).toHaveBeenCalledWith(globals as any, assigned as any);
  });

  it('_fetchGlobalRoutes should query service with filters', done => {
    component.environmentId = 'env-1';
    (mockGlobalExternalRouteService.getManyExternalRoutes as jest.Mock).mockReturnValue(of([]));
    (component as any)._fetchGlobalRoutes('A,B').subscribe((res: any) => {
      expect(Array.isArray(res)).toBe(true);
      expect(mockGlobalExternalRouteService.getManyExternalRoutes).toHaveBeenCalledWith({
        environmentId: 'env-1',
        limit: 50000,
        filter: ['externalVrf||in||A,B'],
      });
      done();
    });
  });

  it('_fetchAssignedRoutes should query service with wanFormId', done => {
    component.externalVrfConnection = { id: 'externalVrfConnection1' } as any;
    (mockExternalRouteService.getManyExternalRoute as jest.Mock).mockReturnValue(of([]));
    (component as any)._fetchAssignedRoutes().subscribe((res: any) => {
      expect(Array.isArray(res)).toBe(true);
      expect(mockExternalRouteService.getManyExternalRoute).toHaveBeenCalledWith({
        filter: ['externalVrfConnectionId||eq||externalVrfConnection1'],
        limit: 50000,
      });
      done();
    });
  });

  it('_processRoutesData should compute availableVrfs, link globals, and refresh available routes', () => {
    const globals = [
      { id: 'g1', externalVrf: 'B' },
      { id: 'g2', externalVrf: 'A' },
    ] as any;
    const assigned = [{ id: 'a1', globalExternalRouteId: 'g1' }] as any;
    component.externalVrfConnection = {
      externalFirewall: {
        externalVrfConnections: [
          { externalVrf: 'B' }, { externalVrf: 'A' }, { externalVrf: 'A' }]
      }
    } as any;
    const updateSpy = jest.spyOn(component, 'updateAvailableRoutes');
    (component as any)._processRoutesData(globals, assigned);
    expect(component.allGlobalRoutes).toEqual(globals);
    expect(component.availableVrfs).toEqual(['A', 'B']);
    expect(component.assignedRoutesDataSource.data[0].globalExternalRoute).toEqual(globals[0]);
    expect(updateSpy).toHaveBeenCalled();
  });

  it('restoreRoute should call service then refresh', () => {
    (mockExternalRouteService.restoreOneExternalRoute as jest.Mock).mockReturnValue(of({}));
    const refreshSpy = jest.spyOn(component, 'getAllRoutes');
    component.restoreRoute({ id: 'r1' } as any);
    expect(mockExternalRouteService.restoreOneExternalRoute).toHaveBeenCalledWith({ id: 'r1' });
    expect(refreshSpy).toHaveBeenCalled();
  });

  describe('updateAvailableRoutes', () => {
    it('should handle missing global routes', () => {
      (component as any).allGlobalRoutes = undefined;
      component.updateAvailableRoutes();
      expect(component.availableRoutesDataSource.data).toEqual([]);
    });

    it('should require selectedVrf and filter out assigned routes', () => {
      const firstPage = jest.fn();
      (component as any).allGlobalRoutes = [
        { id: 'g1', externalVrf: 'A' },
        { id: 'g2', externalVrf: 'B' },
        { id: 'g3', externalVrf: 'A' },
      ];
      component.assignedRoutesDataSource.data = [{ globalExternalRouteId: 'g3' }] as any;
      component.availableRoutesDataSource.paginator = { firstPage } as any;

      component.selectedVrf = '';
      component.updateAvailableRoutes();
      expect(component.availableRoutesDataSource.data).toEqual([]);

      component.selectedVrf = 'A';
      component.updateAvailableRoutes();
      expect(component.availableRoutesDataSource.data).toEqual([{ id: 'g1', externalVrf: 'A' }] as any);
      expect(firstPage).toHaveBeenCalled();
    });
  });

  it('onAssignedRoutesSearch should set filter', () => {
    component.assignedRoutesSearchQuery = '  Hello  ';
    component.onAssignedRoutesSearch();
    expect(component.assignedRoutesDataSource.filter).toBe('hello');
  });

  it('onAvailableRoutesSearch should set filter', () => {
    component.availableRoutesSearchQuery = '  WORLD  ';
    component.onAvailableRoutesSearch();
    expect(component.availableRoutesDataSource.filter).toBe('world');
  });

  it('subscribeToModal should reset modal data, unsubscribe, and refresh', () => {
    const subject = new Subject<any>();
    (mockNgx.getModal as jest.Mock).mockReturnValue({ onCloseFinished: subject.asObservable() });
    const refreshSpy = jest.spyOn(component, 'getAllRoutes');
    (component as any).subscribeToModal();
    expect((component as any).modalSubscription).toBeTruthy();
    subject.next({});
    expect(mockNgx.resetModalData).toHaveBeenCalledWith('externalRouteModal');
    expect((component as any).modalSubscription.closed).toBe(true);
    expect(refreshSpy).toHaveBeenCalled();
  });
});
