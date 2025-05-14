/* eslint-disable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MockComponent } from 'src/test/mock-components';

import { TenantPortalComponent } from './tenant-portal.component';
import {
  Datacenter,
  FirewallRuleGroup,
  NatRuleGroup,
  Tier,
  V1DatacentersService,
  V1TiersService,
  V2AppCentricTenantsService,
} from 'client';
import { HttpClientModule } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { TierContextService } from 'src/app/services/tier-context.service';
import { ApplicationMode } from 'src/app/models/other/application-mode-enum';
import { TabsComponent } from 'src/app/common/tabs/tabs.component';

describe('TenantPortalComponent', () => {
  let component: TenantPortalComponent;
  let fixture: ComponentFixture<TenantPortalComponent>;
  let tenantServiceMock: any;
  let datacenterServiceMock: any;
  let tierServiceMock: any;
  let datacenterContextServiceMock: any;
  let tierContextServiceMock: any;
  let routerMock: any;
  let activatedRouteMock: any;

  const mockTenant = {
    id: 'test-id',
    name: 'test-tenant',
    datacenterId: 'test-datacenter-id',
    tenantVersion: 2,
  };

  const mockDatacenter: Datacenter = {
    id: 'test-datacenter-id',
    name: 'Test Datacenter',
    tiers: [{ id: 'ns-tier-id', name: 'ns_fw_svc_tier' } as Tier, { id: 'ew-tier-id', name: 'ew_fw_svc_tier' } as Tier],
    tenantVersion: 2,
  };

  const mockTiers = {
    data: [
      {
        id: 'ns-tier-id',
        name: 'ns_fw_svc_tier',
        firewallRuleGroups: [{ id: 'ns-fw-group-id', name: 'NS Firewall Group' } as FirewallRuleGroup],
        natRuleGroups: [{ id: 'ns-nat-group-id', name: 'NS NAT Group' } as NatRuleGroup],
      },
      {
        id: 'ew-tier-id',
        name: 'ew_fw_svc_tier',
        firewallRuleGroups: [{ id: 'ew-fw-group-id', name: 'EW Firewall Group' } as FirewallRuleGroup],
        natRuleGroups: [{ id: 'ew-nat-group-id', name: 'EW NAT Group' } as NatRuleGroup],
      },
    ],
  };

  beforeEach(() => {
    routerMock = {
      navigate: jest.fn(),
      url: 'tenant-select/edit/test-id(tenant-portal:application-profile)',
      routerState: {
        snapshot: {
          url: 'tenant-select/edit/test-id(tenant-portal:application-profile)',
        },
      },
    };

    activatedRouteMock = {
      data: of({ mode: ApplicationMode.TENANTV2 }),
      snapshot: {
        paramMap: {
          get: jest.fn().mockReturnValue('test-id'),
        },
        queryParams: {},
        data: { mode: ApplicationMode.TENANTV2 },
      },
    };

    tenantServiceMock = {
      getOneTenant: jest.fn().mockReturnValue(of(mockTenant)),
    };

    datacenterServiceMock = {
      getOneDatacenter: jest.fn().mockReturnValue(of(mockDatacenter)),
    };

    tierServiceMock = {
      getManyTier: jest.fn().mockReturnValue(of(mockTiers)),
    };

    datacenterContextServiceMock = {
      switchDatacenter: jest.fn(),
    };

    tierContextServiceMock = {
      switchTier: jest.fn(),
      lockTier: jest.fn(),
      unlockTier: jest.fn(),
    };

    TestBed.configureTestingModule({
      declarations: [
        TenantPortalComponent,
        MockComponent({
          selector: 'app-tabs',
          inputs: ['tabs', 'initialTabIndex'],
          outputs: ['tabChange'],
        }),
      ],
      imports: [RouterModule, RouterTestingModule, HttpClientModule],
      providers: [
        { provide: V2AppCentricTenantsService, useValue: tenantServiceMock },
        { provide: V1DatacentersService, useValue: datacenterServiceMock },
        { provide: V1TiersService, useValue: tierServiceMock },
        { provide: DatacenterContextService, useValue: datacenterContextServiceMock },
        { provide: TierContextService, useValue: tierContextServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TenantPortalComponent);
    component = fixture.componentInstance;
    component.tenantId = 'test-id'; // Set tenant ID directly
    fixture.detectChanges();
  });

  // Basic creation test
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Mode-related tests
  describe('Mode initialization', () => {
    it('should initialize tabs with firewall options when in TENANTV2 mode', () => {
      TestBed.resetTestingModule();
      activatedRouteMock.snapshot.data = { mode: ApplicationMode.TENANTV2 };

      TestBed.configureTestingModule({
        declarations: [
          TenantPortalComponent,
          MockComponent({
            selector: 'app-tabs',
            inputs: ['tabs', 'initialTabIndex'],
            outputs: ['tabChange'],
          }),
        ],
        imports: [RouterModule, RouterTestingModule, HttpClientModule],
        providers: [
          { provide: V2AppCentricTenantsService, useValue: tenantServiceMock },
          { provide: V1DatacentersService, useValue: datacenterServiceMock },
          { provide: V1TiersService, useValue: tierServiceMock },
          { provide: DatacenterContextService, useValue: datacenterContextServiceMock },
          { provide: TierContextService, useValue: tierContextServiceMock },
          { provide: Router, useValue: routerMock },
          { provide: ActivatedRoute, useValue: activatedRouteMock },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(TenantPortalComponent);
      component = fixture.componentInstance;
      component.tenantId = 'test-id'; // Set tenant ID directly as in other tests
      fixture.detectChanges(); // Trigger ngOnInit

      // Check that tabs include firewall tabs in TenantV2 mode
      expect(component.tabs.some(tab => tab.name === 'Application Profile')).toBeTruthy();
      expect(component.tabs.some(tab => tab.name === 'East/West Firewall')).toBeTruthy();
      expect(component.tabs.some(tab => tab.name === 'North/South Firewall')).toBeTruthy();
    });

    it('should not include firewall tabs when not in TENANTV2 mode', () => {
      TestBed.resetTestingModule();
      activatedRouteMock.snapshot.data = { mode: ApplicationMode.APPCENTRIC };

      TestBed.configureTestingModule({
        declarations: [TenantPortalComponent, MockComponent({ selector: 'app-tabs', inputs: ['tabs', 'initialTabIndex'] })],
        imports: [RouterModule, RouterTestingModule, HttpClientModule],
        providers: [
          { provide: V2AppCentricTenantsService, useValue: tenantServiceMock },
          { provide: V1DatacentersService, useValue: datacenterServiceMock },
          { provide: V1TiersService, useValue: tierServiceMock },
          { provide: DatacenterContextService, useValue: datacenterContextServiceMock },
          { provide: TierContextService, useValue: tierContextServiceMock },
          { provide: Router, useValue: routerMock },
          { provide: ActivatedRoute, useValue: activatedRouteMock },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(TenantPortalComponent);
      component = fixture.componentInstance;
      component.tenantId = 'test-id';
      fixture.detectChanges();

      // Check that tabs don't include firewall tabs in non-TenantV2 mode
      expect(component.tabs.some(tab => tab.name === 'East/West Firewall')).toBeFalsy();
      expect(component.tabs.some(tab => tab.name === 'North/South Firewall')).toBeFalsy();
    });
  });

  // Tab navigation tests
  describe('Tab navigation', () => {
    it('should handle tab change to East/West Firewall tab', () => {
      const ewTab = component.tabs.find(tab => tab.name === 'East/West Firewall');
      component.handleTabChange(ewTab);

      // Verify tier context is set properly for EW firewall
      expect(tierContextServiceMock.unlockTier).toHaveBeenCalled();
      expect(tierContextServiceMock.switchTier).toHaveBeenCalledWith('ew-tier-id');
      expect(tierContextServiceMock.lockTier).toHaveBeenCalled();
    });

    it('should handle tab change to North/South Firewall tab', () => {
      const nsTab = component.tabs.find(tab => tab.name === 'North/South Firewall');
      component.handleTabChange(nsTab);

      // Verify tier context is set properly for NS firewall
      expect(tierContextServiceMock.unlockTier).toHaveBeenCalled();
      expect(tierContextServiceMock.switchTier).toHaveBeenCalledWith('ns-tier-id');
      expect(tierContextServiceMock.lockTier).toHaveBeenCalled();
    });

    it('should navigate to correct route when selecting a regular tab', () => {
      const regularTab = component.tabs.find(tab => tab.name === 'Application Profile');
      component.handleTabChange(regularTab);

      // Verify navigation to the correct route
      expect(routerMock.navigate).toHaveBeenCalledWith([{ outlets: { 'tenant-portal': ['application-profile'] } }], expect.any(Object));
    });

    it('should handle subtab selection for East/West Firewall', () => {
      // Set current tab to East/West Firewall
      component.currentTab = 'East/West Firewall';

      // Select Service Objects subtab
      const serviceObjectsTab = { name: 'Service Objects', route: ['east-west-service-objects'], isSubTab: true };
      component.handleTabChange(serviceObjectsTab);

      // Verify tier context is set properly
      expect(tierContextServiceMock.unlockTier).toHaveBeenCalled();
      expect(tierContextServiceMock.switchTier).toHaveBeenCalledWith('ew-tier-id');
      expect(tierContextServiceMock.lockTier).toHaveBeenCalled();

      // Verify navigation to the correct route
      expect(routerMock.navigate).toHaveBeenCalledWith(
        [{ outlets: { 'tenant-portal': ['east-west-service-objects'] } }],
        expect.any(Object),
      );
    });
  });

  // Network services tests
  describe('Network services container', () => {
    it('should fetch datacenter when tenant is loaded in TENANTV2 mode', () => {
      component.getTenant();

      expect(tenantServiceMock.getOneTenant).toHaveBeenCalledWith({
        id: 'test-id',
      });

      expect(datacenterServiceMock.getOneDatacenter).toHaveBeenCalledWith({
        id: 'test-datacenter-id',
        join: ['tiers'],
      });
    });

    it('should find and set NS and EW tiers from datacenter', () => {
      component.getNetworkServicesContainerDatacenter('test-datacenter-id');

      // Verify tier identification
      expect(component.networkServicesContainerNsTier.id).toBe('ns-tier-id');
      expect(component.networkServicesContainerEwTier.id).toBe('ew-tier-id');

      // Verify datacenter context
      expect(datacenterContextServiceMock.switchDatacenter).toHaveBeenCalledWith('test-datacenter-id');
    });

    it('should fetch and set firewall rule groups', () => {
      component.getNetworkServicesContainerDatacenter('test-datacenter-id');

      // Verify tier service call
      expect(tierServiceMock.getManyTier).toHaveBeenCalledWith({
        filter: ['datacenterId||eq||test-datacenter-id'],
        join: ['firewallRuleGroups', 'natRuleGroups'],
        page: 1,
        perPage: 10,
      });

      // Verify rule groups are set
      expect(component.networkServicesContainerNsFirewallRuleGroup.id).toBe('ns-fw-group-id');
      expect(component.networkServicesContainerEwFirewallRuleGroup.id).toBe('ew-fw-group-id');
      expect(component.networkServicesContainerNsNatRuleGroup.id).toBe('ns-nat-group-id');
      expect(component.networkServicesContainerEwNatRuleGroup.id).toBe('ew-nat-group-id');
    });

    it('should handle case when tenant is not in TenantV2 mode', () => {
      // Mock a non-v2 tenant
      tenantServiceMock.getOneTenant.mockReturnValue(
        of({
          id: 'test-id',
          name: 'test-tenant',
          datacenterId: 'test-datacenter-id',
          tenantVersion: 1,
        }),
      );

      // Spy on console.error
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Clear previous calls to getOneDatacenter
      datacenterServiceMock.getOneDatacenter.mockClear();

      // Expect the subscription callback to throw
      component.getTenant();

      // Verify datacenter service is not called since an error is thrown
      expect(datacenterServiceMock.getOneDatacenter).not.toHaveBeenCalled();
    });
  });

  // Initial tab tests
  describe('Initial tab selection', () => {
    it('should select correct tab based on URL', () => {
      // Mock router URL with a specific tab
      routerMock.url = 'tenant-select/edit/test-id(tenant-portal:contract)';
      routerMock.routerState.snapshot.url = 'tenant-select/edit/test-id(tenant-portal:contract)';

      // Call the method
      const index = component.getInitialTabIndex();

      // Should return index of Contract tab
      const expectedIndex = component.tabs.findIndex(t => t.name === 'Contract');
      expect(index).toBe(expectedIndex);
      expect(component.currentTab).toBe('Contract');
    });

    it('should select correct parent tab when URL matches a subtab', () => {
      // Mock router URL with a specific subtab
      routerMock.url = 'tenant-select/edit/test-id(tenant-portal:east-west-service-objects)';
      routerMock.routerState.snapshot.url = 'tenant-select/edit/test-id(tenant-portal:east-west-service-objects)';

      // Call the method
      const index = component.getInitialTabIndex();

      // Should return index of East/West Firewall tab (parent tab)
      const expectedIndex = component.tabs.findIndex(t => t.name === 'East/West Firewall');
      expect(index).toBe(expectedIndex);
      expect(component.currentTab).toBe('East/West Firewall');
      expect(component.initialSubTab).not.toBeNull();
      expect(component.initialSubTab.route[0]).toBe('east-west-service-objects');
    });

    it('should default to first tab when no match is found', () => {
      // Mock router URL with no matching tab
      routerMock.url = 'tenant-select/edit/test-id(tenant-portal:non-existent)';
      routerMock.routerState.snapshot.url = 'tenant-select/edit/test-id(tenant-portal:non-existent)';

      // Call the method
      const index = component.getInitialTabIndex();

      // Should return 0 (first tab)
      expect(index).toBe(0);
      expect(component.currentTab).toBe(component.tabs[0].name);
    });

    it('should handle invalid URLs gracefully', () => {
      // Mock invalid router URL
      routerMock.url = 'tenant-select/edit/test-id';
      routerMock.routerState.snapshot.url = 'tenant-select/edit/test-id';

      // Call the method
      const index = component.getInitialTabIndex();

      // Should return 0 (first tab)
      expect(index).toBe(0);
      expect(component.currentTab).toBe(component.tabs[0].name);
    });
  });

  // ngOnInit test
  it('should run onInit and call required methods', () => {
    const getInitialTabIndexSpy = jest.spyOn(component, 'getInitialTabIndex');
    const getTenantSpy = jest.spyOn(component, 'getTenant');

    component.ngOnInit();

    expect(getInitialTabIndexSpy).toHaveBeenCalled();
    expect(getTenantSpy).toHaveBeenCalled();
  });

  // AfterViewInit test
  it('should select initialSubTab in afterViewInit if set', () => {
    // Create a mock TabsComponent
    component.tabsComponent = {
      setActiveSubTab: jest.fn(),
    } as unknown as TabsComponent;

    // Set an initial subtab
    component.initialSubTab = {
      name: 'Service Objects',
      route: ['east-west-service-objects'],
      isSubTab: true,
    };

    // Call the method
    component.ngAfterViewInit();

    // Should call setActiveSubTab on TabsComponent
    expect(component.tabsComponent.setActiveSubTab).toHaveBeenCalledWith(component.initialSubTab);
  });

  // Error handling
  it('should handle tenant service error', () => {
    tenantServiceMock.getOneTenant.mockReturnValue(throwError('Test error'));

    component.getTenant();

    expect(component.tenants).toBeNull();
  });
});
