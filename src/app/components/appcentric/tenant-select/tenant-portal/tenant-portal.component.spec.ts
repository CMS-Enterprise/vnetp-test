/* eslint-disable */
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Component, EventEmitter, Input, Output } from '@angular/core';

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

@Component({
  selector: 'app-tabs',
  template: '',
})
export class MockTabsComponentForTest {
  @Input() tabs: any;
  @Input() initialTabIndex: any;
  @Output() tabChange = new EventEmitter<any>();
  setActiveSubTab = jest.fn();
}

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
      parent: null,
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
      unlockDatacenter: jest.fn(),
      lockDatacenter: jest.fn(),
    };

    tierContextServiceMock = {
      switchTier: jest.fn(),
      lockTier: jest.fn(),
      unlockTier: jest.fn(),
    };

    TestBed.configureTestingModule({
      declarations: [TenantPortalComponent, MockTabsComponentForTest],
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
  });

  it('should create', () => {
    component.tenantId = 'test-id';
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Mode initialization', () => {
    it('should initialize tabs with firewall options when in TENANTV2 mode', () => {
      component.tenantId = 'test-id';
      fixture.detectChanges();

      expect(component.tabs.some(tab => tab.name === 'Application Profile')).toBeTruthy();
      expect(component.tabs.some(tab => tab.name === 'East/West Firewall')).toBeTruthy();
      expect(component.tabs.some(tab => tab.name === 'North/South Firewall')).toBeTruthy();
    });

    it('should not include firewall tabs when not in TENANTV2 mode', () => {
      TestBed.resetTestingModule();
      activatedRouteMock.snapshot.data = { mode: ApplicationMode.APPCENTRIC };
      activatedRouteMock.data = of({ mode: ApplicationMode.APPCENTRIC });

      TestBed.configureTestingModule({
        declarations: [TenantPortalComponent, MockTabsComponentForTest],
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

      expect(component.tabs.some(tab => tab.name === 'East/West Firewall')).toBeFalsy();
      expect(component.tabs.some(tab => tab.name === 'North/South Firewall')).toBeFalsy();
    });
  });

  describe('Tab navigation', () => {
    beforeEach(fakeAsync(() => {
      activatedRouteMock.snapshot.data = { mode: ApplicationMode.TENANTV2 };
      activatedRouteMock.data = of({ mode: ApplicationMode.TENANTV2 });
      component.tenantId = 'test-id';
      fixture.detectChanges();
      tick();
    }));

    it('should handle tab change to East/West Firewall tab', () => {
      const ewTab = component.tabs.find(tab => tab.name === 'East/West Firewall');
      component.handleTabChange(ewTab);

      expect(tierContextServiceMock.unlockTier).toHaveBeenCalled();
      expect(tierContextServiceMock.switchTier).toHaveBeenCalledWith('ew-tier-id');
      expect(tierContextServiceMock.lockTier).toHaveBeenCalled();
    });

    it('should handle tab change to North/South Firewall tab', () => {
      const nsTab = component.tabs.find(tab => tab.name === 'North/South Firewall');
      component.handleTabChange(nsTab);

      expect(tierContextServiceMock.unlockTier).toHaveBeenCalled();
      expect(tierContextServiceMock.switchTier).toHaveBeenCalledWith('ns-tier-id');
      expect(tierContextServiceMock.lockTier).toHaveBeenCalled();
    });

    it('should navigate to correct route when selecting a regular tab', () => {
      const regularTab = component.tabs.find(tab => tab.name === 'Application Profile');
      component.handleTabChange(regularTab);

      expect(routerMock.navigate).toHaveBeenCalledWith([{ outlets: { 'tenant-portal': ['application-profile'] } }], expect.any(Object));
    });

    it('should handle subtab selection for East/West Firewall', () => {
      component.currentTab = 'East/West Firewall';
      const serviceObjectsTab = { name: 'Service Objects', route: ['east-west-service-objects'], isSubTab: true };
      component.handleTabChange(serviceObjectsTab);

      expect(tierContextServiceMock.unlockTier).toHaveBeenCalled();
      expect(tierContextServiceMock.switchTier).toHaveBeenCalledWith('ew-tier-id');
      expect(tierContextServiceMock.lockTier).toHaveBeenCalled();
      expect(routerMock.navigate).toHaveBeenCalledWith(
        [{ outlets: { 'tenant-portal': ['east-west-service-objects'] } }],
        expect.any(Object),
      );
    });
  });

  describe('Network services container', () => {
    beforeEach(() => {
      activatedRouteMock.snapshot.data = { mode: ApplicationMode.TENANTV2 };
      activatedRouteMock.data = of({ mode: ApplicationMode.TENANTV2 });
    });

    it('should fetch datacenter when tenant is loaded in TENANTV2 mode', fakeAsync(() => {
      component.tenantId = 'test-id';
      fixture.detectChanges();
      tick();

      expect(tenantServiceMock.getOneTenant).toHaveBeenCalledWith({ id: 'test-id' });
      expect(datacenterServiceMock.getOneDatacenter).toHaveBeenCalledWith({ id: 'test-datacenter-id', join: ['tiers'] });
    }));

    it('should find and set NS and EW tiers from datacenter', fakeAsync(() => {
      component.applicationMode = ApplicationMode.TENANTV2;
      component.tenantId = 'test-id';
      component.getNetworkServicesContainerDatacenter('test-datacenter-id');
      tick();

      expect(datacenterServiceMock.getOneDatacenter).toHaveBeenCalledWith({ id: 'test-datacenter-id', join: ['tiers'] });
      expect(component.networkServicesContainerNsTier).toBeDefined();
      expect(component.networkServicesContainerNsTier.id).toBe('ns-tier-id');
      expect(component.networkServicesContainerEwTier).toBeDefined();
      expect(component.networkServicesContainerEwTier.id).toBe('ew-tier-id');
      expect(datacenterContextServiceMock.switchDatacenter).toHaveBeenCalledWith('test-datacenter-id');
    }));

    it('should fetch and set firewall rule groups', fakeAsync(() => {
      component.applicationMode = ApplicationMode.TENANTV2;
      component.tenantId = 'test-id';
      component.getNetworkServicesContainerDatacenter('test-datacenter-id');
      tick();

      expect(tierServiceMock.getManyTier).toHaveBeenCalledWith({
        filter: ['datacenterId||eq||test-datacenter-id'],
        join: ['firewallRuleGroups', 'natRuleGroups'],
        page: 1,
        perPage: 10,
      });
      expect(component.networkServicesContainerNsFirewallRuleGroup).toBeDefined();
      expect(component.networkServicesContainerNsFirewallRuleGroup.id).toBe('ns-fw-group-id');
      expect(component.networkServicesContainerEwFirewallRuleGroup).toBeDefined();
      expect(component.networkServicesContainerEwFirewallRuleGroup.id).toBe('ew-fw-group-id');
      expect(component.networkServicesContainerNsNatRuleGroup).toBeDefined();
      expect(component.networkServicesContainerNsNatRuleGroup.id).toBe('ns-nat-group-id');
      expect(component.networkServicesContainerEwNatRuleGroup).toBeDefined();
      expect(component.networkServicesContainerEwNatRuleGroup.id).toBe('ew-nat-group-id');
    }));

    it('should not call getNetworkServicesContainerDatacenter if not in TENANTV2 mode during getTenant', fakeAsync(() => {
      TestBed.resetTestingModule();

      const currentActivatedRouteMock = {
        data: of({ mode: ApplicationMode.APPCENTRIC }),
        snapshot: {
          paramMap: { get: jest.fn().mockReturnValue('test-id') },
          queryParams: {},
          data: { mode: ApplicationMode.APPCENTRIC },
        },
        parent: null,
      };
      const currentTenantServiceMock = {
        getOneTenant: jest.fn().mockReturnValue(of({ ...mockTenant, tenantVersion: 2 })),
      };
      const currentDatacenterServiceMock = { getOneDatacenter: jest.fn() };

      TestBed.configureTestingModule({
        declarations: [TenantPortalComponent, MockTabsComponentForTest],
        imports: [RouterModule, RouterTestingModule, HttpClientModule],
        providers: [
          { provide: V2AppCentricTenantsService, useValue: currentTenantServiceMock },
          { provide: V1DatacentersService, useValue: currentDatacenterServiceMock },
          { provide: V1TiersService, useValue: tierServiceMock },
          { provide: DatacenterContextService, useValue: datacenterContextServiceMock },
          { provide: TierContextService, useValue: tierContextServiceMock },
          { provide: Router, useValue: routerMock },
          { provide: ActivatedRoute, useValue: currentActivatedRouteMock },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(TenantPortalComponent);
      component = fixture.componentInstance;
      component.tenantId = 'test-id';

      fixture.detectChanges();
      tick();

      expect(currentTenantServiceMock.getOneTenant).toHaveBeenCalledWith({ id: 'test-id' });
      expect(currentDatacenterServiceMock.getOneDatacenter).not.toHaveBeenCalled();
    }));
  });

  describe('Initial tab selection', () => {
    beforeEach(() => {
      component.tenantId = 'test-id';
      fixture.detectChanges();
    });
    it('should select correct tab based on URL', () => {
      routerMock.url = 'tenant-select/edit/test-id(tenant-portal:contract)';
      routerMock.routerState.snapshot.url = 'tenant-select/edit/test-id(tenant-portal:contract)';
      const index = component.getInitialTabIndex();
      const expectedIndex = component.tabs.findIndex(t => t.name === 'Contract');
      expect(index).toBe(expectedIndex);
      expect(component.currentTab).toBe('Contract');
    });

    it('should select correct parent tab when URL matches a subtab', () => {
      routerMock.url = 'tenant-select/edit/test-id(tenant-portal:east-west-service-objects)';
      routerMock.routerState.snapshot.url = 'tenant-select/edit/test-id(tenant-portal:east-west-service-objects)';
      const index = component.getInitialTabIndex();
      const expectedIndex = component.tabs.findIndex(t => t.name === 'East/West Firewall');
      expect(index).toBe(expectedIndex);
      expect(component.currentTab).toBe('East/West Firewall');
      expect(component.initialSubTab).not.toBeNull();
      expect(component.initialSubTab.route[0]).toBe('east-west-service-objects');
    });

    it('should default to first tab when no match is found', () => {
      routerMock.url = 'tenant-select/edit/test-id(tenant-portal:non-existent)';
      routerMock.routerState.snapshot.url = 'tenant-select/edit/test-id(tenant-portal:non-existent)';
      const index = component.getInitialTabIndex();
      expect(index).toBe(0);
      expect(component.currentTab).toBe(component.tabs[0].name);
    });

    it('should handle invalid URLs gracefully', () => {
      routerMock.url = 'tenant-select/edit/test-id';
      routerMock.routerState.snapshot.url = 'tenant-select/edit/test-id';
      const index = component.getInitialTabIndex();
      expect(index).toBe(0);
      expect(component.currentTab).toBe(component.tabs[0].name);
    });
  });

  it('should run onInit and call required methods', fakeAsync(() => {
    const getInitialTabIndexSpy = jest.spyOn(component, 'getInitialTabIndex');
    const getTenantSpy = jest.spyOn(component, 'getTenant');
    component.tenantId = 'test-id';
    fixture.detectChanges();
    tick();
    expect(getInitialTabIndexSpy).toHaveBeenCalled();
    expect(getTenantSpy).toHaveBeenCalled();
  }));

  it('should select initialSubTab in ngAfterViewInit if set', fakeAsync(() => {
    component.initialSubTab = { name: 'Service Objects', route: ['east-west-service-objects'], isSubTab: true };
    component.tenantId = 'test-id';

    fixture.detectChanges();
    tick();

    expect(component.tabsComponent).toBeTruthy();
    if (component.tabsComponent) {
      expect((component.tabsComponent as any).setActiveSubTab).toHaveBeenCalledWith(component.initialSubTab);
    } else {
      fail('tabsComponent was not resolved by ViewChild');
    }
  }));

  it('should handle tenant service error in getTenant', fakeAsync(() => {
    tenantServiceMock.getOneTenant.mockReturnValue(throwError(() => new Error('Test error')));
    component.tenantId = 'test-id';
    fixture.detectChanges();
    tick();
    expect(datacenterServiceMock.getOneDatacenter).not.toHaveBeenCalled();
  }));
});
