import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ExternalFirewallsComponent } from './external-firewalls.component';
import { V2AppCentricExternalFirewallsService } from 'client';
import { TableContextService } from 'src/app/services/table-context.service';
import { TenantPortalNavigationService } from 'src/app/services/tenant-portal-navigation.service';
import { RouteDataUtil } from '../../../../../utils/route-data.util';
import { ApplicationMode } from '../../../../../models/other/application-mode-enum';

describe('ExternalFirewallsComponent', () => {
  let component: ExternalFirewallsComponent;
  let fixture: ComponentFixture<ExternalFirewallsComponent>;

  let mockService: any;
  let mockTableContext: any;
  let mockRouter: any;
  let mockActivatedRoute: any;
  let mockNav: any;

  const tenantId = '11111111-1111-1111-1111-111111111111';

  beforeEach(async () => {
    mockService = {
      getManyExternalFirewall: jest.fn().mockReturnValue(of({ items: [], total: 0 })),
    } as Partial<V2AppCentricExternalFirewallsService> as any;

    mockTableContext = {
      getSearchLocalStorage: jest.fn().mockReturnValue({ filteredResults: false }),
    } as Partial<TableContextService> as any;

    mockNav = {
      navigateToFirewallConfig: jest.fn(),
    } as Partial<TenantPortalNavigationService> as any;

    mockRouter = {
      routerState: { snapshot: { url: `/tenantv2/tenant-select/edit/${tenantId}/home/(tenant-portal:vrf)` } },
    } as Partial<Router> as any;

    mockActivatedRoute = {} as Partial<ActivatedRoute> as any;

    jest.spyOn(RouteDataUtil, 'getApplicationModeFromRoute').mockReturnValue(ApplicationMode.TENANTV2);

    await TestBed.configureTestingModule({
      declarations: [ExternalFirewallsComponent],
      providers: [
        { provide: V2AppCentricExternalFirewallsService, useValue: mockService },
        { provide: TableContextService, useValue: mockTableContext },
        { provide: TenantPortalNavigationService, useValue: mockNav },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ExternalFirewallsComponent);
    component = fixture.componentInstance;
  });

  it('should create and call getExternalFirewalls on init', () => {
    const spy = jest.spyOn(component, 'getExternalFirewalls');
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(RouteDataUtil.getApplicationModeFromRoute).toHaveBeenCalledWith(mockActivatedRoute);
    expect(component.applicationMode).toBe(ApplicationMode.TENANTV2);
    expect(spy).toHaveBeenCalled();
  });

  it('getExternalFirewalls (no event): sets list, builds filter and clears loading', () => {
    fixture.detectChanges();
    mockService.getManyExternalFirewall.mockClear();

    component.getExternalFirewalls();
    expect(component.isLoading).toBe(false);
    expect(mockService.getManyExternalFirewall).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: expect.arrayContaining([`tenantId||eq||${tenantId}`]),
        page: component.tableComponentDto.page,
        perPage: component.tableComponentDto.perPage,
        relations: ['tenant', 'l3outs', 'externalVrfConnections'],
      }),
    );
    expect(component.externalFirewalls).toEqual({ items: [], total: 0 });
  });

  it('getExternalFirewalls (with event and search): adds search filter and updates paging', () => {
    fixture.detectChanges();
    mockService.getManyExternalFirewall.mockClear();

    const event = { page: 3, perPage: 50, searchColumn: 'name', searchText: 'fw' };
    component.getExternalFirewalls(event);
    const callArg = mockService.getManyExternalFirewall.mock.calls[0][0];
    expect(callArg.page).toBe(3);
    expect(callArg.perPage).toBe(50);
    expect(callArg.filter).toEqual([`tenantId||eq||${tenantId}`, 'name||cont||fw']);
  });

  it('getExternalFirewalls (with event but no searchColumn): omits search filter', () => {
    fixture.detectChanges();
    mockService.getManyExternalFirewall.mockClear();

    const event = { page: 2, perPage: 10, searchText: 'x' };
    component.getExternalFirewalls(event);
    const callArg = mockService.getManyExternalFirewall.mock.calls[0][0];
    expect(callArg.filter).toEqual([`tenantId||eq||${tenantId}`]);
  });

  it('handles service error by nulling list and clearing loading', () => {
    mockService.getManyExternalFirewall.mockReturnValueOnce(throwError(() => new Error('fail')));
    component.getExternalFirewalls();
    expect(component.externalFirewalls).toBeNull();
    expect(component.isLoading).toBe(false);
  });

  it('onTableEvent updates state and calls getExternalFirewalls', () => {
    const spy = jest.spyOn(component, 'getExternalFirewalls');
    const event = { page: 4, perPage: 25 } as any;
    component.onTableEvent(event);
    expect(component.tableComponentDto.page).toBe(4);
    expect(component.tableComponentDto.perPage).toBe(25);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('refreshExternalFirewalls respects filteredResults flag', () => {
    const spy = jest.spyOn(component, 'getExternalFirewalls');
    // Case: filteredResults false
    (component as any).refreshExternalFirewalls();
    expect(spy).toHaveBeenCalledWith();

    // Case: filteredResults true
    spy.mockClear();
    const params = { filteredResults: true, page: 7 } as any;
    mockTableContext.getSearchLocalStorage.mockReturnValueOnce(params);
    (component as any).refreshExternalFirewalls();
    expect(spy).toHaveBeenCalledWith(params);
  });

  it('editFirewallConfig delegates to navigation service', () => {
    const fw = { id: 'f1', name: 'FW-1' } as any;
    component.editFirewallConfig(fw);
    expect(mockNav.navigateToFirewallConfig).toHaveBeenCalledWith(
      { type: 'external-firewall', firewallId: 'f1', firewallName: 'FW-1' },
      mockActivatedRoute,
    );
  });

  it('constructor sets advancedSearchAdapter', () => {
    fixture.detectChanges();
    expect((component.config as any).advancedSearchAdapter).toBeTruthy();
  });
});
