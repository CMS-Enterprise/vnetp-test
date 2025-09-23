import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { of } from 'rxjs';
import {
  V3GlobalExternalRoutesService,
  V2AppCentricVrfsService,
  V2RoutingExternalVrfConnectionsService,
  V2RoutingExternalRoutesService,
  ExternalVrfConnection,
  GlobalExternalRoute,
  ExternalRoute,
} from '../../../../../client';
import { MockFontAwesomeComponent, MockComponent } from '../../../../test/mock-components';
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
import { ExternalRouteComponent } from './external-route.component';

describe('ExternalRouteComponent', () => {
  let component: ExternalRouteComponent;
  let fixture: ComponentFixture<ExternalRouteComponent>;
  let mockActivatedRoute: any;
  let mockExternalRouteService: any;
  let mockExternalVrfConnectionService: any;
  let mockGlobalExternalRouteService: any;
  let mockVrfService: any;
  let mockRouter: any;
  let mockNgx: any;
  let capturedCloseCb: (() => void) | null = null;

  const baseConnection: ExternalVrfConnection = {
    id: 'conn-1',
    tenantId: 'tenant-1',
    externalFirewall: {
      bgpAsn: 65001,
      externalVrfConnections: [{ externalVrf: 'VRF_B' } as any, { externalVrf: 'VRF_A' } as any, { externalVrf: 'VRF_A' } as any],
    },
  } as any;

  beforeEach(async () => {
    mockActivatedRoute = {
      snapshot: {
        params: { id: 'id' },
        data: { mode: 'mode' },
        queryParams: { id: 'id' },
      },
    };

    mockExternalRouteService = {
      getManyExternalRoute: jest.fn().mockReturnValue(of([])),
      deleteOneExternalRoute: jest.fn().mockReturnValue(of({})),
      softDeleteOneExternalRoute: jest.fn().mockReturnValue(of({})),
      restoreOneExternalRoute: jest.fn().mockReturnValue(of({})),
      createOneExternalRoute: jest.fn().mockReturnValue(of({})),
    } as Partial<V2RoutingExternalRoutesService> as any;

    mockExternalVrfConnectionService = {
      getOneExternalVrfConnection: jest.fn().mockReturnValue(of(baseConnection)),
    } as Partial<V2RoutingExternalVrfConnectionsService> as any;

    mockGlobalExternalRouteService = {
      getManyExternalRoutes: jest.fn().mockReturnValue(of([])),
    } as Partial<V3GlobalExternalRoutesService> as any;

    mockVrfService = {} as Partial<V2AppCentricVrfsService> as any;

    mockRouter = { navigate: jest.fn() } as Partial<Router> as any;

    mockNgx = {
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
      resetModalData: jest.fn(),
    } as Partial<NgxSmartModalService> as any;

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
        { provide: V2RoutingExternalRoutesService, useValue: mockExternalRouteService },
        { provide: NgxSmartModalService, useValue: mockNgx },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExternalRouteComponent);
    component = fixture.componentInstance;
    component.externalVrfConnection = JSON.parse(JSON.stringify(baseConnection));
    component.environmentId = 'env-1';
    fixture.detectChanges();
  });

  it('ngOnInit loads connection and calls getAllRoutes', () => {
    const spyAll = jest.spyOn(component, 'getAllRoutes');
    component.ngOnInit();
    expect(mockExternalVrfConnectionService.getOneExternalVrfConnection).toHaveBeenCalledWith({
      id: 'conn-1',
      relations: ['externalFirewall.externalVrfConnections'],
    });
    expect(spyAll).toHaveBeenCalled();
  });

  it('getConnectionChildren requests relations', done => {
    component.getConnectionChildren().subscribe(conn => {
      expect(conn.id).toBe('conn-1');
      expect(mockExternalVrfConnectionService.getOneExternalVrfConnection).toHaveBeenCalledWith({
        id: 'conn-1',
        relations: ['externalFirewall.externalVrfConnections'],
      });
      done();
    });
  });

  it('ngAfterViewInit does not throw when wiring up Mat components', () => {
    expect(() => component.ngAfterViewInit()).not.toThrow();
  });

  it('addRouteToExternalVrfConnection creates and refreshes', () => {
    const spyAll = jest.spyOn(component, 'getAllRoutes');
    const route: GlobalExternalRoute = { id: 'gr-1' } as any;
    component.addRouteToExternalVrfConnection(route);
    expect(mockExternalRouteService.createOneExternalRoute).toHaveBeenCalledWith({
      externalRoute: {
        externalVrfConnectionId: 'conn-1',
        globalExternalRouteId: 'gr-1',
        tenantId: 'tenant-1',
      },
    });
    expect(spyAll).toHaveBeenCalled();
  });

  it('removeRouteFromExternalVrfConnection delegates to deleteRoute', () => {
    const spyDel = jest.spyOn(component, 'deleteRoute');
    component.removeRouteFromExternalVrfConnection({ id: 'er-1' } as any);
    expect(spyDel).toHaveBeenCalled();
  });

  it('getAllRoutes fetches and processes data', () => {
    const globals: GlobalExternalRoute[] = [{ id: 'gr-1', externalVrf: 'VRF_A' } as any, { id: 'gr-2', externalVrf: 'VRF_B' } as any];
    const assigned: ExternalRoute[] = [{ id: 'er-1', globalExternalRouteId: 'gr-2' } as any];
    mockGlobalExternalRouteService.getManyExternalRoutes.mockReturnValueOnce(of(globals));
    mockExternalRouteService.getManyExternalRoute.mockReturnValueOnce(of(assigned));

    component.getAllRoutes();

    expect(component.availableVrfs).toEqual(['VRF_A', 'VRF_B']);
    expect(component.assignedRoutesDataSource.data[0].globalExternalRoute.id).toBe('gr-2');
  });

  it('_fetchGlobalRoutes calls service with env and filter', done => {
    component.environmentId = 'env-1';
    mockGlobalExternalRouteService.getManyExternalRoutes.mockReturnValueOnce(of([{ id: 'x' }]));
    (component as any)._fetchGlobalRoutes('VRF_A,VRF_B').subscribe((res: any) => {
      expect(mockGlobalExternalRouteService.getManyExternalRoutes).toHaveBeenCalledWith({
        environmentId: 'env-1',
        limit: 50000,
        filter: ['externalVrf||in||VRF_A,VRF_B'],
      });
      expect(res.length).toBe(1);
      done();
    });
  });

  it('_fetchAssignedRoutes calls service with filter', done => {
    component.externalVrfConnection = { id: 'abc', externalFirewall: { externalVrfConnections: [] } } as any;
    mockExternalRouteService.getManyExternalRoute.mockReturnValueOnce(of([{ id: 'y' }]));
    (component as any)._fetchAssignedRoutes().subscribe((res: any) => {
      expect(mockExternalRouteService.getManyExternalRoute).toHaveBeenCalledWith({
        filter: ['externalVrfConnectionId||eq||abc'],
        limit: 50000,
      });
      expect(res.length).toBe(1);
      done();
    });
  });

  it('_processRoutesData sets lists and calls updateAvailableRoutes', () => {
    const spyUpdate = jest.spyOn(component, 'updateAvailableRoutes');
    const globals: GlobalExternalRoute[] = [{ id: 'gr-1', externalVrf: 'VRF_A' } as any, { id: 'gr-2', externalVrf: 'VRF_B' } as any];
    const assigned: ExternalRoute[] = [
      { id: 'er-1', globalExternalRouteId: 'gr-1' } as any,
      { id: 'er-2', globalExternalRouteId: 'gr-2' } as any,
    ];
    (component as any)._processRoutesData(globals, assigned);
    expect(component.allGlobalRoutes.length).toBe(2);
    expect(component.assignedRoutesDataSource.data.length).toBe(2);
    expect(spyUpdate).toHaveBeenCalled();
  });

  it('deleteRoute hard deletes when deletedAt truthy', () => {
    const spyAll = jest.spyOn(component, 'getAllRoutes');
    component.deleteRoute({ id: 'er-1', deletedAt: 'now' } as any);
    expect(mockExternalRouteService.deleteOneExternalRoute).toHaveBeenCalledWith({ id: 'er-1' });
    expect(spyAll).toHaveBeenCalled();
  });

  it('deleteRoute soft deletes when active', () => {
    const spyAll = jest.spyOn(component, 'getAllRoutes');
    component.deleteRoute({ id: 'er-2' } as any);
    expect(mockExternalRouteService.softDeleteOneExternalRoute).toHaveBeenCalledWith({ id: 'er-2' });
    expect(spyAll).toHaveBeenCalled();
  });

  it('isRouteBgpTagBlocked returns false for null, true for tag==asn, false otherwise', () => {
    expect(component.isRouteBgpTagBlocked(null as any)).toBe(false);
    const routeBlocked = { tag: 65001 } as any;
    (component as any).externalVrfConnection.externalFirewall.bgpAsn = 65001;
    expect(component.isRouteBgpTagBlocked(routeBlocked)).toBe(true);
    const routeOk = { tag: 12345 } as any;
    expect(component.isRouteBgpTagBlocked(routeOk)).toBe(false);
  });

  it('getAddRouteTooltip varies based on isRouteBgpTagBlocked', () => {
    (component as any).externalVrfConnection.externalFirewall.bgpAsn = 65001;
    const blocked = component.getAddRouteTooltip({ tag: 65001 } as any);
    expect(blocked).toContain('Add disabled');
    const ok = component.getAddRouteTooltip({ tag: 1 } as any);
    expect(ok).toBe('Add Route to External VRF Connection');
  });

  it('restoreRoute calls service and refreshes', () => {
    const spyAll = jest.spyOn(component, 'getAllRoutes');
    component.restoreRoute({ id: 'er-3' } as any);
    expect(mockExternalRouteService.restoreOneExternalRoute).toHaveBeenCalledWith({ id: 'er-3' });
    expect(spyAll).toHaveBeenCalled();
  });

  it('updateAvailableRoutes handles missing globals and filters by VRF', () => {
    component.allGlobalRoutes = undefined;
    component.availableRoutesDataSource.data = [{ id: 'x' } as any];
    component.updateAvailableRoutes();
    expect(component.availableRoutesDataSource.data).toEqual([]);

    component.allGlobalRoutes = [{ id: 'gr-1', externalVrf: 'VRF_A' } as any, { id: 'gr-2', externalVrf: 'VRF_B' } as any];
    component.assignedRoutesDataSource.data = [{ globalExternalRouteId: 'gr-2' } as any];
    component.selectedVrf = 'VRF_A';
    const paginator: any = { firstPage: jest.fn() };
    // set the dataSource paginator directly since ViewChild is not present in test harness
    (component as any).availableRoutesDataSource.paginator = paginator;
    component.updateAvailableRoutes();
    expect(component.availableRoutesDataSource.data.map(r => (r as any).id)).toEqual(['gr-1']);
    expect(paginator.firstPage).toHaveBeenCalled();

    component.selectedVrf = '';
    component.updateAvailableRoutes();
    expect(component.availableRoutesDataSource.data).toEqual([]);
  });

  it('openModal sets data and opens, subscribeToModal resets and refreshes', () => {
    const spySub = jest.spyOn<any, any>(component as any, 'subscribeToModal');
    const spyAll = jest.spyOn(component, 'getAllRoutes');
    component.openModal();
    expect(spySub).toHaveBeenCalled();
    expect(mockNgx.setModalData).toHaveBeenCalledWith(
      {
        externalVrfConnectionId: 'conn-1',
        tenantId: 'tenant-1',
      },
      'externalRouteModal',
    );
    expect(mockNgx.getModal).toHaveBeenCalledWith('externalRouteModal');

    // simulate modal close
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    capturedCloseCb && capturedCloseCb();

    expect(mockNgx.resetModalData).toHaveBeenCalledWith('externalRouteModal');
    expect(spyAll).toHaveBeenCalled();
  });

  it('onAssignedRoutesSearch and onAvailableRoutesSearch set filters', () => {
    component.assignedRoutesSearchQuery = 'abc';
    component.onAssignedRoutesSearch();
    expect(component.assignedRoutesDataSource.filter).toBe('abc');

    component.availableRoutesSearchQuery = 'xyz';
    component.onAvailableRoutesSearch();
    expect(component.availableRoutesDataSource.filter).toBe('xyz');
  });
});
