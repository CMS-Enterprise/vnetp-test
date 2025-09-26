import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { TenantPortalComponent } from './tenant-portal.component';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { V2AppCentricTenantsService, V1DatacentersService, V1TiersService } from 'client';
import { TierContextService } from 'src/app/services/tier-context.service';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { ApplicationMode } from 'src/app/models/other/application-mode-enum';
import * as RouteDataUtilModule from 'src/app/utils/route-data.util';

describe('TenantPortalComponent', () => {
  let component: TenantPortalComponent;
  let fixture: ComponentFixture<TenantPortalComponent>;

  const mockRouter: any = {
    url: '/tenantv2/tenant-select/edit/11111111-1111-1111-1111-111111111111/home/(tenant-portal:service-graphs)',
    routerState: {
      snapshot: {
        url: '/tenantv2/tenant-select/edit/11111111-1111-1111-1111-111111111111/home/(tenant-portal:service-graphs)',
      },
    },
    navigate: jest.fn(),
  };
  const mockActivatedRoute: any = { snapshot: { url: [] } } as ActivatedRoute;

  const mockTenantSvc: any = { getOneTenant: jest.fn() };
  const mockDcSvc: any = { getOneDatacenter: jest.fn(), refreshDatacenters: jest.fn() };
  const mockTierSvc: any = { getManyTier: jest.fn() };
  const mockTierCtx: any = { unlockTier: jest.fn(), switchTier: jest.fn(), lockTier: jest.fn() };
  const mockDcCtx: any = {
    unlockDatacenter: jest.fn(),
    switchDatacenter: jest.fn(),
    lockDatacenter: jest.fn(),
    refreshDatacenters: jest.fn(),
  };

  beforeEach(async () => {
    jest.spyOn(RouteDataUtilModule.RouteDataUtil, 'getApplicationModeFromRoute').mockReturnValue(ApplicationMode.TENANTV2 as any);
    await TestBed.configureTestingModule({
      declarations: [TenantPortalComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: V2AppCentricTenantsService, useValue: mockTenantSvc },
        { provide: V1DatacentersService, useValue: mockDcSvc },
        { provide: V1TiersService, useValue: mockTierSvc },
        { provide: TierContextService, useValue: mockTierCtx },
        { provide: DatacenterContextService, useValue: mockDcCtx },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(TenantPortalComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('ngOnInit extracts tenantId, initializes tabs, sets initialTabIndex, and loads tenant', () => {
    mockTenantSvc.getOneTenant.mockReturnValue(of({ id: 't1', name: 'Tenant One', tenantVersion: 2, vrfs: [{ id: 'v1' }] }));
    const initSpy = jest.spyOn<any, any>(component as any, 'initializeVrfSelection').mockImplementation(() => {});
    fixture.detectChanges();
    expect(component.tenantId).toBe('11111111-1111-1111-1111-111111111111');
    expect(component.tabs.length).toBeGreaterThan(0);
    expect(component.initialTabIndex).toBeGreaterThanOrEqual(0);
    expect(mockTenantSvc.getOneTenant).toHaveBeenCalled();
    expect(initSpy).toHaveBeenCalled();
  });

  it('getInitialTabIndex matches route and sets current/main tab', () => {
    component['initializeTabs']?.();
    // Ensure some tabs exist
    if (component.tabs.length === 0) {
      (component as any).tabs = [
        { name: 'VRF', id: 'vrf', route: ['vrf'] },
        { name: 'Service Graphs', id: 'tv2-service-graphs', route: ['service-graphs'] },
      ];
    }
    const index = component.getInitialTabIndex();
    expect(index).toBeGreaterThanOrEqual(0);
    expect(component.currentTab).toBeDefined();
  });

  describe('getInitialTabIndex edge cases and branches', () => {
    beforeEach(() => {
      (component as any).tabs = [
        { name: 'Application Profile', id: 'application-profile', route: ['application-profile'] },
        { name: 'Contract', id: 'contract', route: ['contract'] },
      ];
    });

    it('returns 0 and sets first tab when URL lacks tenant-portal outlet', () => {
      mockRouter.url = 'tenant-select/edit/test-id';
      mockRouter.routerState.snapshot.url = 'tenant-select/edit/test-id';
      const index = component.getInitialTabIndex();
      expect(index).toBe(0);
      expect(component.currentTab).toBe('Application Profile');
      expect((component as any).initialSubTab).toBeNull();
    });

    it('sets sub-tab when matching nested route', () => {
      (component as any).tabs = [
        { name: 'Parent', id: 'parent', route: ['parent'], subTabs: [{ name: 'Details', route: ['service-graphs/details'] }] },
      ];
      mockRouter.url = 'tenant-select/edit/test-id(tenant-portal:service-graphs/details)';
      mockRouter.routerState.snapshot.url = 'tenant-select/edit/test-id(tenant-portal:service-graphs/details)';
      const index = component.getInitialTabIndex();
      expect(index).toBe(0);
      expect(component.currentTab).toBe('Parent');
      expect((component as any).initialSubTab?.name).toBe('Details');
    });

    it('selects tab by name when id is missing', () => {
      (component as any).tabs = [
        { name: 'First', route: ['first'] },
        { name: 'NoIdTab', route: ['bridge-domain'] },
      ];
      mockRouter.url = 'tenant-select/edit/test-id(tenant-portal:bridge-domain)';
      mockRouter.routerState.snapshot.url = 'tenant-select/edit/test-id(tenant-portal:bridge-domain)';
      const index = component.getInitialTabIndex();
      expect(index).toBe(1);
      expect(component.currentTab).toBe('NoIdTab');
    });

    it('maps east-west- prefix to internal- for matching', () => {
      (component as any).tabs = [{ name: 'Internal FW', id: 'internal', route: ['internal-firewall'] }];
      mockRouter.url = 'tenant-select/edit/test-id(tenant-portal:east-west-firewall)';
      mockRouter.routerState.snapshot.url = 'tenant-select/edit/test-id(tenant-portal:east-west-firewall)';
      const index = component.getInitialTabIndex();
      expect(index).toBe(0);
      expect(component.currentTab).toBe('Internal FW');
    });

    it('maps north-south- prefix to external- for matching', () => {
      (component as any).tabs = [{ name: 'External FW', id: 'external', route: ['external-firewall'] }];
      mockRouter.url = 'tenant-select/edit/test-id(tenant-portal:north-south-firewall)';
      mockRouter.routerState.snapshot.url = 'tenant-select/edit/test-id(tenant-portal:north-south-firewall)';
      const index = component.getInitialTabIndex();
      expect(index).toBe(0);
      expect(component.currentTab).toBe('External FW');
    });

    it('falls back gracefully via catch when an error occurs', () => {
      // Ensure tabs is an array so fallback can compute name safely
      (component as any).tabs = [];
      // Make accessing router.url throw to trigger catch block
      Object.defineProperty(mockRouter, 'url', {
        get: () => {
          throw new Error('boom');
        },
        configurable: true,
      });
      const index = component.getInitialTabIndex();
      expect(index).toBe(0);
      expect(component.currentTab).toBe('VRF');
      // Restore url to a safe value for later tests
      Object.defineProperty(mockRouter, 'url', {
        get: () => 'tenant-select/edit/test-id(tenant-portal:application-profile)',
        configurable: true,
      });
    });

    it('returns first tab when tabs is empty', () => {
      (component as any).tabs = [];
      Object.defineProperty(mockRouter, 'url', {
        get: () => 'tenant-select/edit/test-id(tenant-portal:any)',
        configurable: true,
      });
      mockRouter.routerState.snapshot.url = 'tenant-select/edit/test-id(tenant-portal:any)';
      const index = component.getInitialTabIndex();
      expect(index).toBe(0);
      expect(component.currentTab).toBe('Application Profile');
      expect((component as any).initialSubTab).toBeNull();
    });
  });

  it('selectVrf guards null and loads tiers when valid', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    component.selectVrf(null as any);
    expect(warnSpy).toHaveBeenCalled();

    const loadSpy = jest.spyOn<any, any>(component as any, 'loadVrfTiersAndRuleGroups').mockImplementation(() => {});
    component.selectVrf({ id: 'v1' } as any);
    expect(loadSpy).toHaveBeenCalledWith({ id: 'v1' });
  });

  it('loadVrfTiersAndRuleGroups handles null vrf', () => {
    (component as any).loadVrfTiersAndRuleGroups(null);
    expect(component.isLoadingVrfData).toBe(false);
  });

  it('loadVrfTiersAndRuleGroups maps tiers and rule groups on success', () => {
    const vrf: any = {
      internalNetworkServicesTier: { id: 'i1' },
      externalNetworkServicesTier: { id: 'e1' },
    };
    mockTierSvc.getManyTier.mockReturnValue(
      of({
        data: [
          { id: 'i1', firewallRuleGroups: [{ id: 'frg-i' }], natRuleGroups: [{ id: 'nrg-i' }] },
          { id: 'e1', firewallRuleGroups: [{ id: 'frg-e' }], natRuleGroups: [{ id: 'nrg-e' }] },
        ],
      }),
    );
    (component as any).loadVrfTiersAndRuleGroups(vrf);
    expect(component.selectedVrfInternalFirewallRuleGroup).toEqual({ id: 'frg-i' });
    expect(component.selectedVrfExternalFirewallRuleGroup).toEqual({ id: 'frg-e' });
    expect(component.isLoadingTiers).toBe(false);
    expect(component.isLoadingVrfData).toBe(false);
  });

  it('loadVrfTiersAndRuleGroups clears loading on error', () => {
    const vrf: any = { internalNetworkServicesTier: { id: 'i1' } };
    mockTierSvc.getManyTier.mockReturnValue(throwError(() => new Error('boom')));
    (component as any).loadVrfTiersAndRuleGroups(vrf);
    expect(component.isLoadingTiers).toBe(false);
    expect(component.isLoadingVrfData).toBe(false);
  });

  it('handleTabChange navigates for main tab and respects isSubTab', async () => {
    (component as any).tabs = [
      { name: 'VRF', id: 'vrf', route: ['vrf'] },
      { name: 'Service Graphs', id: 'tv2-service-graphs', route: ['service-graphs'] },
    ];
    await component.handleTabChange({ name: 'Service Graphs', id: 'tv2-service-graphs' } as any);
    expect(mockRouter.navigate).toHaveBeenCalled();

    // If not found in tabs but route present, use tab.route directly
    jest.clearAllMocks();
    await component.handleTabChange({ name: 'Other', route: ['external-firewalls'] } as any);
    expect(mockRouter.navigate).toHaveBeenCalled();
  });

  it('getTenant success sets tenant data and vrfs when TENANTV2 v2', () => {
    mockTenantSvc.getOneTenant.mockReturnValue(of({ id: 't1', name: 'Tenant One', tenantVersion: 2, vrfs: [{ id: 'v1' }] }));
    (component as any).applicationMode = ApplicationMode.TENANTV2;
    component.getTenant();
    expect(component.currentTenantName).toBe('Tenant One');
    expect(component.tenantVrfs.length).toBe(1);
    expect(component.isLoadingTenant).toBe(false);
  });

  it('getTenant error clears loading and sets tenants null', () => {
    mockTenantSvc.getOneTenant.mockReturnValue(throwError(() => new Error('x')));
    component.getTenant();
    expect(component.tenants).toBeNull();
    expect(component.isLoadingTenant).toBe(false);
  });

  it('getNetworkServicesContainerDatacenter success and error paths', () => {
    const dcResp = { id: 'dc1' };
    mockDcSvc.getOneDatacenter.mockReturnValue(of(dcResp));
    const loadSpy = jest.spyOn<any, any>(component as any, 'loadVrfTiersAndRuleGroups').mockImplementation(() => {});
    const tabSpy = jest.spyOn(component, 'getInitialTabIndex').mockReturnValue(0);
    component['selectedVrf'] = { id: 'v1' } as any;
    component.getNetworkServicesContainerDatacenter('dc1');
    expect(component.networkServicesContainerDatacenter).toEqual(dcResp as any);
    expect(mockDcCtx.unlockDatacenter).toHaveBeenCalled();
    expect(mockDcCtx.switchDatacenter).toHaveBeenCalledWith('dc1');
    expect(mockDcCtx.lockDatacenter).toHaveBeenCalled();
    expect(loadSpy).toHaveBeenCalled();
    expect(tabSpy).toHaveBeenCalled();

    // error path
    jest.clearAllMocks();
    mockDcSvc.getOneDatacenter.mockReturnValue(throwError(() => new Error('dc')));
    component.getNetworkServicesContainerDatacenter('dc1');
    expect(loadSpy).toHaveBeenCalled();
    expect(tabSpy).toHaveBeenCalled();
  });

  it('ngAfterViewInit sets active sub tab when present', () => {
    const setSub = jest.fn();
    (component as any).tabsComponent = { setActiveSubTab: setSub };
    (component as any).initialSubTab = { name: 'sub', route: ['x'] };
    component.ngAfterViewInit();
    expect(setSub).toHaveBeenCalled();
  });

  it('switchTierContext unlocks, switches, and locks tier context', () => {
    (component as any).switchTierContext('tier-1');
    expect(mockTierCtx.unlockTier).toHaveBeenCalled();
    expect(mockTierCtx.switchTier).toHaveBeenCalledWith('tier-1');
    expect(mockTierCtx.lockTier).toHaveBeenCalled();
  });

  it('initializeVrfSelection selects first vrf when one exists', () => {
    (component as any).tenantVrfs = [{ id: 'v1' }];
    const selectSpy = jest.spyOn(component, 'selectVrf').mockImplementation(() => {});
    (component as any).initializeVrfSelection();
    expect(selectSpy).toHaveBeenCalledWith({ id: 'v1' });
  });

  it('initializeVrfSelection warns when none', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    (component as any).tenantVrfs = [];
    (component as any).initializeVrfSelection();
    expect(warnSpy).toHaveBeenCalled();
  });

  it('ngOnDestroy unsubscribes lingering subscriptions', () => {
    const sub = new Subject<void>().subscribe();
    (component as any).subscriptions = [sub as any];
    component.ngOnDestroy();
    expect((sub as any).closed).toBe(true);
  });
});
