import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ServiceGraphsComponent } from './service-graphs.component';
import { ActivatedRoute, Router } from '@angular/router';
import { V2AppCentricServiceGraphsService } from 'client';
import { of, throwError } from 'rxjs';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';

describe('ServiceGraphsComponent', () => {
  let component: ServiceGraphsComponent;
  let fixture: ComponentFixture<ServiceGraphsComponent>;

  const mockService = {
    getManyServiceGraph: jest.fn(),
  } as any;

  const mockRouter = {
    routerState: { snapshot: { url: '/tenantv2/tenant-select/edit/11111111-1111-1111-1111-111111111111/home' } },
    navigate: jest.fn(),
  } as any as Router;

  const mockActivatedRoute = {
    snapshot: { url: [] },
  } as any as ActivatedRoute;

  const mockTenantPortalNav = {
    navigateToFirewallConfig: jest.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ServiceGraphsComponent],
      providers: [
        { provide: V2AppCentricServiceGraphsService, useValue: mockService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        {
          provide: require('src/app/services/tenant-portal-navigation.service').TenantPortalNavigationService,
          useValue: mockTenantPortalNav,
        },
        {
          provide: require('src/app/services/table-context.service').TableContextService,
          useValue: { getSearchLocalStorage: jest.fn(() => ({})) },
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ServiceGraphsComponent);
    component = fixture.componentInstance;
  });

  it('should create and initialize', () => {
    mockService.getManyServiceGraph.mockReturnValue(of({ data: [], count: 0 }));
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.tenantId).toBe('11111111-1111-1111-1111-111111111111');
  });

  it('getServiceGraphs success without event', () => {
    mockService.getManyServiceGraph.mockReturnValue(of({ data: [{ id: 'a' }], count: 1 }));
    component.getServiceGraphs();
    expect(component.isLoading).toBe(false);
    expect(component.serviceGraphs).toEqual({ data: [{ id: 'a' }], count: 1 });
  });

  it('getServiceGraphs success with event and search param', () => {
    mockService.getManyServiceGraph.mockReturnValue(of({ data: [{ id: 'b' }], count: 1 }));
    const event: Partial<TableComponentDto> = { page: 2, perPage: 10, searchColumn: 'name', searchText: 'q' };
    component.getServiceGraphs(event);
    expect(component.tableComponentDto.page).toBe(2);
    expect(component.tableComponentDto.perPage).toBe(10);
    expect(component.serviceGraphs).toEqual({ data: [{ id: 'b' }], count: 1 });
    expect(component.isLoading).toBe(false);
  });

  it('getServiceGraphs error clears loading and nulls list', () => {
    mockService.getManyServiceGraph.mockReturnValue(throwError(() => new Error('boom')));
    component.getServiceGraphs();
    expect(component.serviceGraphs).toBeNull();
    expect(component.isLoading).toBe(false);
  });

  it('onTableEvent proxies to getServiceGraphs', () => {
    mockService.getManyServiceGraph.mockReturnValue(of({ data: [], count: 0 }));
    const spy = jest.spyOn(component, 'getServiceGraphs');
    const evt: any = { page: 3 };
    component.onTableEvent(evt);
    expect(spy).toHaveBeenCalledWith(evt);
  });

  it('editFirewallConfig navigates when serviceGraphFirewall present', () => {
    const sg = { id: 'sg1', serviceGraphFirewall: { id: 'fw1', name: 'FW' } } as any;
    component.editFirewallConfig(sg);
    expect(mockRouter.navigate).toHaveBeenCalledWith(
      [
        '/tenantv2/tenant-select/edit',
        '11111111-1111-1111-1111-111111111111',
        'home',
        {
          outlets: {
            'tenant-portal': ['firewall-config', 'service-graph-firewall', 'fw1'],
          },
        },
      ],
      {
        queryParamsHandling: 'merge',
      },
    );
  });

  it('editFirewallConfig no-op when serviceGraphFirewall missing', () => {
    (mockRouter.navigate as jest.Mock).mockClear();
    const sg = { id: 'sg2' } as any;
    component.editFirewallConfig(sg);
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });
});
