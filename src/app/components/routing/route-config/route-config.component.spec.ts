import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import {
  V2AppCentricVrfsService,
  L3OutL3outTypeEnum,
  TenantRouteControlStatusEnum,
  ExternalVrfConnection,
  Vrf,
} from '../../../../../client';
import { RouteConfigComponent } from './route-config.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';

describe('RouteConfigComponent', () => {
  let component: RouteConfigComponent;
  let fixture: ComponentFixture<RouteConfigComponent>;
  let mockRoute: any;
  let mockVrfService: any;
  let mockRouter: any;

  const params$ = new Subject<any>();

  const makeVrf = (status: TenantRouteControlStatusEnum = TenantRouteControlStatusEnum.Pending): Vrf =>
    ({
      id: 'vrf-1',
      tenant: { id: 't-1', environmentId: 'env-1', routeControlStatus: status } as any,
      tenantId: 't-1',
      l3outs: [
        {
          l3outType: L3OutL3outTypeEnum.Intervrf,
          externalFirewall: { externalVrfConnections: [{ id: 'skip-conn', name: 'Skip' }] },
        } as any,
        {
          l3outType: 'NonIntervrf' as any,
          externalFirewall: {
            externalVrfConnections: [
              { id: 'conn-1', name: 'Conn One' },
              { id: 'conn-2', name: 'Conn Two' },
            ] as ExternalVrfConnection[],
          },
        } as any,
      ],
    } as any);

  beforeEach(async () => {
    mockRoute = { params: params$.asObservable() } as Partial<ActivatedRoute> as any;
    mockVrfService = { getOneVrf: jest.fn().mockReturnValue(of(makeVrf())) } as Partial<V2AppCentricVrfsService> as any;
    mockRouter = {
      createUrlTree: jest.fn().mockReturnValue({ tree: true }),
      navigateByUrl: jest.fn(),
    } as Partial<Router> as any;

    await TestBed.configureTestingModule({
      declarations: [RouteConfigComponent],
      imports: [MatToolbarModule, MatIconModule],
      providers: [
        { provide: ActivatedRoute, useValue: mockRoute },
        { provide: V2AppCentricVrfsService, useValue: mockVrfService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RouteConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('ngOnInit subscribes to params, sets vrfId and calls getVrf', () => {
    const spy = jest.spyOn(component, 'getVrf');
    params$.next({ vrfId: 'abc' });
    expect(component.vrfId).toBe('abc');
    expect(spy).toHaveBeenCalled();
  });

  it('getVrf populates tenant/env IDs, blockChanges, and filters connections', () => {
    component.vrfId = 'vrf-1';
    component.getVrf();
    expect(mockVrfService.getOneVrf).toHaveBeenCalledWith({
      id: 'vrf-1',
      relations: [
        'tenant',
        'l3outs.externalFirewall.externalVrfConnections.internalRoutes.appcentricSubnet',
        'l3outs.externalFirewall.externalVrfConnections.externalRoutes',
      ],
    });
    expect(component.environmentId).toBe('env-1');
    expect(component.tenantId).toBe('t-1');
    expect(component.blockChanges).toBe(true); // Pending
    expect(component.externalVrfConnections.map(c => c.id)).toEqual(['conn-1', 'conn-2']);
  });

  it('trackById returns id or name', () => {
    const item1 = { id: 'x' } as any;
    const item2 = { name: 'y' } as any;
    expect(component.trackById(0, item1)).toBe('x');
    expect(component.trackById(0, item2)).toBe('y');
  });

  it('showList clears selection and sets currentView to list', () => {
    component.selectedExternalVrfConnection = { id: '1' } as any;
    component.currentView = 'routes';
    component.showList();
    expect(component.selectedExternalVrfConnection).toBeNull();
    expect(component.currentView).toBe('list');
  });

  it('openManageRoutes selects connection and sets view to routes', () => {
    const conn = { id: '1' } as any;
    component.openManageRoutes(conn);
    expect(component.selectedExternalVrfConnection).toBe(conn);
    expect(component.currentView).toBe('routes');
  });

  it('openManageSubnets selects connection and sets view to subnets', () => {
    const conn = { id: '2' } as any;
    component.openManageSubnets(conn);
    expect(component.selectedExternalVrfConnection).toBe(conn);
    expect(component.currentView).toBe('subnets');
  });

  it('goBackToVrf returns early when tenantId missing', () => {
    component.tenantId = undefined as any;
    component.goBackToVrf();
    expect(mockRouter.createUrlTree).not.toHaveBeenCalled();
    expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
  });

  it('goBackToVrf navigates using named outlet when tenantId present', () => {
    component.tenantId = 't-1';
    component.goBackToVrf();
    expect(mockRouter.createUrlTree).toHaveBeenCalled();
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith({ tree: true });
  });

  it('getVrf sets blockChanges true when status Approved', () => {
    mockVrfService.getOneVrf.mockReturnValueOnce(of(makeVrf('APPROVED' as any)));
    component.getVrf();
    expect(component.blockChanges).toBe(true);
  });

  it('getVrf sets blockChanges false when status Active', () => {
    mockVrfService.getOneVrf.mockReturnValueOnce(of(makeVrf('ACTIVE' as any)));
    component.getVrf();
    expect(component.blockChanges).toBe(false);
  });
});
