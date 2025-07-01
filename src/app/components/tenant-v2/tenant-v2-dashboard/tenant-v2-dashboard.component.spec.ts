import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  UserDto,
  V1NetworkSecurityFirewallRulesService,
  V1NetworkSecurityNatRulesService,
  V1NetworkSecurityNetworkObjectGroupsService,
  V1NetworkSecurityNetworkObjectsService,
  V1NetworkSecurityServiceObjectGroupsService,
  V1NetworkSecurityServiceObjectsService,
  V2AppCentricBridgeDomainsService,
  V2AppCentricContractsService,
  V2AppCentricEndpointGroupsService,
  V2AppCentricTenantsService,
  V2AppCentricVrfsService,
  V3GlobalMessagesService,
} from 'client';
import { BehaviorSubject, of } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { TenantV2DashboardComponent } from './tenant-v2-dashboard.component';

const MOCK_USER: UserDto = {
  dn: 'dn',
  uid: 'testuser',
  cn: 'testuser',
  givenname: 'test',
  mail: 'test@test.com',
  dcsrole: 'role',
  ismemberof: {},
  token: 'token',
  expiresIn: 1000,
  dcsPermissions: [
    { tenant: 'tenantA', roles: ['roleA', 'roleB'] },
    { tenant: 'tenantB', roles: ['roleC'] },
  ],
};

describe('TenantV2DashboardComponent', () => {
  let component: TenantV2DashboardComponent;
  let fixture: ComponentFixture<TenantV2DashboardComponent>;
  let mockAuthService;
  let mockNetworkObjectService;
  let mockNetworkObjectGroupService;
  let mockServiceObjectService;
  let mockServiceObjectGroupService;
  let mockFirewallRuleService;
  let mockNatRuleService;
  let mockVrfsService;
  let mockBridgeDomainsService;
  let mockContractsService;
  let mockEndpointGroupService;
  let mockTenantsService;

  beforeEach(() => {
    mockAuthService = {
      currentUser: new BehaviorSubject<UserDto | null>(MOCK_USER),
    };
    mockNetworkObjectService = { getManyNetworkObject: jest.fn().mockReturnValue(of({ total: 1 })) };
    mockNetworkObjectGroupService = { getManyNetworkObjectGroup: jest.fn().mockReturnValue(of({ total: 2 })) };
    mockServiceObjectService = { getManyServiceObject: jest.fn().mockReturnValue(of({ total: 3 })) };
    mockServiceObjectGroupService = { getManyServiceObjectGroup: jest.fn().mockReturnValue(of({ total: 4 })) };
    mockFirewallRuleService = { getManyFirewallRule: jest.fn().mockReturnValue(of({ total: 5 })) };
    mockNatRuleService = { getManyNatRule: jest.fn().mockReturnValue(of({ total: 6 })) };
    mockVrfsService = { getManyVrf: jest.fn().mockReturnValue(of({ total: 7 })) };
    mockBridgeDomainsService = { getManyBridgeDomain: jest.fn().mockReturnValue(of({ total: 8 })) };
    mockContractsService = { getManyContract: jest.fn().mockReturnValue(of({ total: 9 })) };
    mockEndpointGroupService = { getManyEndpointGroup: jest.fn().mockReturnValue(of({ total: 10 })) };
    mockTenantsService = { getManyTenant: jest.fn().mockReturnValue(of({ total: 11 })) };

    TestBed.configureTestingModule({
      declarations: [TenantV2DashboardComponent],
      providers: [
        { provide: V1NetworkSecurityNetworkObjectsService, useValue: mockNetworkObjectService },
        { provide: V1NetworkSecurityNetworkObjectGroupsService, useValue: mockNetworkObjectGroupService },
        { provide: V1NetworkSecurityServiceObjectsService, useValue: mockServiceObjectService },
        { provide: V1NetworkSecurityServiceObjectGroupsService, useValue: mockServiceObjectGroupService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: V3GlobalMessagesService, useValue: {} },
        { provide: V1NetworkSecurityFirewallRulesService, useValue: mockFirewallRuleService },
        { provide: V1NetworkSecurityNatRulesService, useValue: mockNatRuleService },
        { provide: V2AppCentricVrfsService, useValue: mockVrfsService },
        { provide: V2AppCentricBridgeDomainsService, useValue: mockBridgeDomainsService },
        { provide: V2AppCentricContractsService, useValue: mockContractsService },
        { provide: V2AppCentricEndpointGroupsService, useValue: mockEndpointGroupService },
        { provide: V2AppCentricTenantsService, useValue: mockTenantsService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(TenantV2DashboardComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set user and poll dashboard when user is logged in', () => {
      const loadDashboardSpy = jest.spyOn(component as any, 'loadDashboard');
      const setIntervalSpy = jest.spyOn(global, 'setInterval').mockReturnValue(123 as any);

      fixture.detectChanges();

      expect(component.user).toEqual(MOCK_USER);
      expect(component.userRoles).toEqual(['roleA', 'roleB', 'roleC']);
      expect(loadDashboardSpy).toHaveBeenCalledWith(component.userRoles);
      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 1000 * 300);
    });

    it('should do nothing if user is not logged in', () => {
      mockAuthService.currentUser = null;
      const loadDashboardSpy = jest.spyOn(component as any, 'loadDashboard');
      const setIntervalSpy = jest.spyOn(global, 'setInterval');

      fixture.detectChanges();

      expect(component.user).toBeUndefined();
      expect(loadDashboardSpy).not.toHaveBeenCalled();
      expect(setIntervalSpy).not.toHaveBeenCalled();
    });
  });

  describe('ngOnDestroy', () => {
    it('should clear interval and unsubscribe', () => {
      fixture.detectChanges();
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      const unsubscribeSpy = jest.spyOn(SubscriptionUtil, 'unsubscribe');

      component.ngOnDestroy();

      expect(clearIntervalSpy).toHaveBeenCalledWith(component.dashboardPoller);
      expect(unsubscribeSpy).toHaveBeenCalledWith([(component as any).currentUserSubscription]);
    });
  });

  describe('loadDashboard', () => {
    it('should only call getTenants when roles are provided', () => {
      (component as any).loadDashboard(['some-role']);
      expect(mockTenantsService.getManyTenant).toHaveBeenCalledTimes(1);
      expect(mockFirewallRuleService.getManyFirewallRule).not.toHaveBeenCalled();
    });

    it('should do nothing when roles are not provided', () => {
      (component as any).loadDashboard();
      expect(mockTenantsService.getManyTenant).not.toHaveBeenCalled();
    });
  });

  describe('private data fetchers', () => {
    it('getTenants should fetch tenants and set the count', () => {
      (component as any).getTenants();
      expect(mockTenantsService.getManyTenant).toHaveBeenCalledWith({
        page: 1,
        perPage: 1,
        filter: ['tenantVersion||eq||2'],
      });
      expect(component.tenants).toBe(11);
    });

    it('getFWRules should fetch FW rules and set the count', () => {
      (component as any).getFWRules();
      expect(mockFirewallRuleService.getManyFirewallRule).toHaveBeenCalledWith({ page: 1, perPage: 1 });
      expect(component.firewallRuleCount).toBe(5);
    });

    it('getNatRules should fetch NAT rules and set the count', () => {
      (component as any).getNatRules();
      expect(mockNatRuleService.getManyNatRule).toHaveBeenCalledWith({ page: 1, perPage: 1 });
      expect(component.natRuleCount).toBe(6);
    });

    it('getNetworkObjects should fetch network objects and set the count', () => {
      (component as any).getNetworkObjects();
      expect(mockNetworkObjectService.getManyNetworkObject).toHaveBeenCalledWith({ page: 1, perPage: 1 });
      expect(component.networkObjectCount).toBe(1);
    });

    it('getNetworkObjectGroups should fetch network object groups and set the count', () => {
      (component as any).getNetworkObjectGroups();
      expect(mockNetworkObjectGroupService.getManyNetworkObjectGroup).toHaveBeenCalledWith({ page: 1, perPage: 1 });
      expect(component.networkObjectGroupCount).toBe(2);
    });

    it('getServiceObjects should fetch service objects and set the count', () => {
      (component as any).getServiceObjects();
      expect(mockServiceObjectService.getManyServiceObject).toHaveBeenCalledWith({ page: 1, perPage: 1 });
      expect(component.serviceObjectCount).toBe(3);
    });

    it('getServiceObjectGroups should fetch service object groups and set the count', () => {
      (component as any).getServiceObjectGroups();
      expect(mockServiceObjectGroupService.getManyServiceObjectGroup).toHaveBeenCalledWith({ page: 1, perPage: 1 });
      expect(component.serviceObjectGroupCount).toBe(4);
    });

    it('getVrfCount should fetch VRFs and set the count', () => {
      (component as any).getVrfCount();
      expect(mockVrfsService.getManyVrf).toHaveBeenCalledWith({ page: 1, perPage: 1 });
      expect(component.vrfs).toBe(7);
    });

    it('getBridgeDomainCount should fetch bridge domains and set the count', () => {
      (component as any).getBridgeDomainCount();
      expect(mockBridgeDomainsService.getManyBridgeDomain).toHaveBeenCalledWith({ page: 1, perPage: 1 });
      expect(component.bridgeDomains).toBe(8);
    });

    it('getContractCount should fetch contracts and set the count', () => {
      (component as any).getContractCount();
      expect(mockContractsService.getManyContract).toHaveBeenCalledWith({ page: 1, perPage: 1 });
      expect(component.contracts).toBe(9);
    });

    it('getEpgs should fetch endpoint groups and set the count', () => {
      (component as any).getEpgs();
      expect(mockEndpointGroupService.getManyEndpointGroup).toHaveBeenCalledWith({ page: 1, perPage: 1 });
      expect(component.endpointGroups).toBe(10);
    });
  });
});
