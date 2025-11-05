import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { FirewallConfigRuleGroupsComponent } from './firewall-config-rule-groups.component';
import { V1TiersService, FirewallRuleGroup, NatRuleGroup, Tier } from '../../../../../../../client';
import { FirewallConfigResolvedData } from './firewall-config.resolver';

describe('FirewallConfigRuleGroupsComponent', () => {
  let component: FirewallConfigRuleGroupsComponent;
  let fixture: ComponentFixture<FirewallConfigRuleGroupsComponent>;
  let mockRoute: Partial<ActivatedRoute>;
  let mockRouter: Partial<Router>;
  let mockTierService: Partial<V1TiersService>;
  let routeDataSubject: Subject<any>;

  const mockFirewallId = 'firewall-123';
  const mockTenantId = 'tenant-456';
  const mockTierId = 'tier-789';

  const mockResolvedData: FirewallConfigResolvedData = {
    firewall: {
      id: mockFirewallId,
      name: 'Test Firewall',
      tenantId: mockTenantId,
      tierId: mockTierId,
    } as any,
    firewallType: 'external-firewall',
  };

  const mockFirewallRuleGroups: FirewallRuleGroup[] = [
    {
      id: 'fw-group-1',
      name: 'Firewall Group 1',
      type: 'ZoneBased' as any,
      tierId: mockTierId,
    } as FirewallRuleGroup,
    {
      id: 'fw-group-2',
      name: 'Firewall Group 2',
      type: 'Intravrf' as any,
      tierId: mockTierId,
    } as FirewallRuleGroup,
  ];

  const mockNatRuleGroups: NatRuleGroup[] = [
    {
      id: 'nat-group-1',
      name: 'NAT Group 1',
      type: 'Intravrf' as any,
      tierId: mockTierId,
    } as NatRuleGroup,
    {
      id: 'nat-group-2',
      name: 'NAT Group 2',
      type: 'External' as any,
      tierId: mockTierId,
    } as NatRuleGroup,
  ];

  beforeEach(async () => {
    routeDataSubject = new Subject();

    mockRouter = {
      navigate: jest.fn().mockResolvedValue(true),
    };

    mockTierService = {
      getOneTier: jest.fn().mockReturnValue(
        of({
          id: mockTierId,
          firewallRuleGroups: mockFirewallRuleGroups,
          natRuleGroups: mockNatRuleGroups,
        } as Tier),
      ),
    };

    await TestBed.configureTestingModule({
      declarations: [FirewallConfigRuleGroupsComponent],
      providers: [
        { provide: ActivatedRoute, useFactory: () => ({ data: routeDataSubject.asObservable() }) },
        { provide: Router, useValue: mockRouter },
        { provide: V1TiersService, useValue: mockTierService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FirewallConfigRuleGroupsComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    routeDataSubject.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with firewall rule groups by default', fakeAsync(() => {
      fixture.detectChanges();
      
      routeDataSubject.next({
        ruleGroupType: 'firewall',
        firewall: mockResolvedData,
      });
      tick();

      expect(component.ruleGroupType).toBe('firewall');
      expect(component.resolvedData).toEqual(mockResolvedData);
      expect(component.firewallName).toBe('Test Firewall');
      expect(component.ruleGroups).toEqual(mockFirewallRuleGroups);
    }));

    it('should fetch firewall rule groups on initialization', fakeAsync(() => {
      fixture.detectChanges();
      
      routeDataSubject.next({
        ruleGroupType: 'firewall',
        firewall: mockResolvedData,
      });
      tick();

      expect(mockTierService.getOneTier).toHaveBeenCalledWith({
        id: mockTierId,
        join: ['firewallRuleGroups'],
      });
      expect(component.ruleGroupsTableData.data).toEqual(mockFirewallRuleGroups);
      expect(component.ruleGroupsTableData.count).toBe(2);
      expect(component.ruleGroupsTableData.total).toBe(2);
    }));

    it('should fetch NAT rule groups when ruleGroupType is nat', fakeAsync(() => {
      fixture.detectChanges();
      
      routeDataSubject.next({
        ruleGroupType: 'nat',
        firewall: mockResolvedData,
      });
      tick();

      expect(component.ruleGroupType).toBe('nat');
      expect(mockTierService.getOneTier).toHaveBeenCalledWith({
        id: mockTierId,
        join: ['natRuleGroups'],
      });
      expect(component.ruleGroups).toEqual(mockNatRuleGroups);
    }));

    it('should handle missing firewall data', () => {
      routeDataSubject.next({
        ruleGroupType: 'firewall',
        firewall: null,
      });

      fixture.detectChanges();

      expect(component.resolvedData).toBeNull();
      expect(component.hasFirewall).toBe(false);
    });

    it('should handle missing tierId', () => {
      const dataWithoutTier = {
        ...mockResolvedData,
        firewall: {
          ...mockResolvedData.firewall,
          tierId: undefined,
        },
      };

      routeDataSubject.next({
        ruleGroupType: 'firewall',
        firewall: dataWithoutTier,
      });

      fixture.detectChanges();

      expect(component.ruleGroups).toEqual([]);
      expect(component.ruleGroupsTableData.data).toEqual([]);
      expect(component.ruleGroupsTableData.count).toBe(0);
    });

    it('should default to firewall type when ruleGroupType is missing', fakeAsync(() => {
      fixture.detectChanges();
      
      routeDataSubject.next({
        firewall: mockResolvedData,
      });
      tick();

      expect(component.ruleGroupType).toBe('firewall');
    }));

    it('should handle empty rule groups from API', () => {
      (mockTierService.getOneTier as jest.Mock).mockReturnValue(
        of({
          id: mockTierId,
          firewallRuleGroups: [],
        } as Tier),
      );

      routeDataSubject.next({
        ruleGroupType: 'firewall',
        firewall: mockResolvedData,
      });

      fixture.detectChanges();

      expect(component.ruleGroups).toEqual([]);
      expect(component.ruleGroupsTableData.count).toBe(0);
    });
  });

  describe('hasFirewall getter', () => {
    it('should return true when firewall data exists', () => {
      component.resolvedData = mockResolvedData;
      expect(component.hasFirewall).toBe(true);
    });

    it('should return false when resolvedData is null', () => {
      component.resolvedData = null;
      expect(component.hasFirewall).toBe(false);
    });

    it('should return false when firewall is undefined', () => {
      component.resolvedData = { firewall: undefined } as any;
      expect(component.hasFirewall).toBe(false);
    });
  });

  describe('editActionLabel getter', () => {
    it('should return Edit Firewall Rule Group for firewall type', () => {
      component.ruleGroupType = 'firewall';
      expect(component.editActionLabel).toBe('Edit Firewall Rule Group');
    });

    it('should return Edit NAT Rule Group for nat type', () => {
      component.ruleGroupType = 'nat';
      expect(component.editActionLabel).toBe('Edit NAT Rule Group');
    });
  });

  describe('editRuleGroup', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();
      
      routeDataSubject.next({
        ruleGroupType: 'firewall',
        firewall: mockResolvedData,
      });
      tick();
    }));

    it('should navigate to firewall rule group edit page', () => {
      const ruleGroup = mockFirewallRuleGroups[0];
      component.ruleGroupType = 'firewall';

      component.editRuleGroup(ruleGroup);

      expect(mockRouter.navigate).toHaveBeenCalledWith(
        [
          '/tenantv2/tenant-select/edit',
          mockTenantId,
          'home',
          {
            outlets: {
              'tenant-portal': [
                'firewall-config',
                'external-firewall',
                mockFirewallId,
                'rules',
                'edit',
                'fw-group-1',
              ],
            },
          },
        ],
        { queryParamsHandling: 'merge' },
      );
    });

    it('should navigate to NAT rule group edit page', () => {
      const ruleGroup = mockNatRuleGroups[0];
      component.ruleGroupType = 'nat';

      component.editRuleGroup(ruleGroup);

      expect(mockRouter.navigate).toHaveBeenCalledWith(
        [
          '/tenantv2/tenant-select/edit',
          mockTenantId,
          'home',
          {
            outlets: {
              'tenant-portal': [
                'firewall-config',
                'external-firewall',
                mockFirewallId,
                'nat',
                'edit',
                'nat-group-1',
              ],
            },
          },
        ],
        { queryParamsHandling: 'merge' },
      );
    });

    it('should not navigate when firewall id is missing', () => {
      component.resolvedData = {
        firewall: { id: undefined } as any,
        firewallType: 'external-firewall',
      };
      const ruleGroup = mockFirewallRuleGroups[0];

      component.editRuleGroup(ruleGroup);

      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should not navigate when resolvedData is null', () => {
      component.resolvedData = null;
      const ruleGroup = mockFirewallRuleGroups[0];

      component.editRuleGroup(ruleGroup);

      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should use firewallType from resolvedData in navigation', () => {
      component.resolvedData = {
        ...mockResolvedData,
        firewallType: 'service-graph-firewall',
      };
      const ruleGroup = mockFirewallRuleGroups[0];

      component.editRuleGroup(ruleGroup);

      expect(mockRouter.navigate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.anything(),
          expect.anything(),
          expect.anything(),
          expect.objectContaining({
            outlets: {
              'tenant-portal': expect.arrayContaining(['service-graph-firewall']),
            },
          }),
        ]),
        expect.anything(),
      );
    });

    it('should default to external-firewall when firewallType is undefined', () => {
      component.resolvedData = {
        firewall: mockResolvedData.firewall,
        firewallType: undefined,
      } as any;
      const ruleGroup = mockFirewallRuleGroups[0];

      component.editRuleGroup(ruleGroup);

      expect(mockRouter.navigate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.anything(),
          expect.anything(),
          expect.anything(),
          expect.objectContaining({
            outlets: {
              'tenant-portal': expect.arrayContaining(['external-firewall']),
            },
          }),
        ]),
        expect.anything(),
      );
    });
  });

  describe('Table Configuration', () => {
    it('should have correct initial table config for firewall groups', fakeAsync(() => {
      fixture.detectChanges();
      
      routeDataSubject.next({
        ruleGroupType: 'firewall',
        firewall: mockResolvedData,
      });
      tick();

      expect(component.ruleGroupConfig.description).toBe('Firewall Rule Groups');
      expect(component.ruleGroupConfig.hideSearchBar).toBe(true);
      expect(component.ruleGroupConfig.hideAdvancedSearch).toBe(true);
      expect(component.ruleGroupConfig.columns).toHaveLength(3);
      expect(component.ruleGroupConfig.columns[0].property).toBe('name');
      expect(component.ruleGroupConfig.columns[1].property).toBe('type');
    }));

    it('should update table config for NAT groups', fakeAsync(() => {
      fixture.detectChanges();
      
      routeDataSubject.next({
        ruleGroupType: 'nat',
        firewall: mockResolvedData,
      });
      tick();

      expect(component.ruleGroupConfig.description).toBe('NAT Rule Groups');
    }));

    it('should update table config when route data changes', fakeAsync(() => {
      fixture.detectChanges();
      
      routeDataSubject.next({
        ruleGroupType: 'firewall',
        firewall: mockResolvedData,
      });
      tick();
      expect(component.ruleGroupConfig.description).toBe('Firewall Rule Groups');

      // Simulate route data change
      routeDataSubject.next({
        ruleGroupType: 'nat',
        firewall: mockResolvedData,
      });
      tick();

      expect(component.ruleGroupConfig.description).toBe('NAT Rule Groups');
    }));
  });

  describe('Rule Groups Table Data', () => {
    it('should populate table data correctly', fakeAsync(() => {
      fixture.detectChanges();
      
      routeDataSubject.next({
        ruleGroupType: 'firewall',
        firewall: mockResolvedData,
      });
      tick();

      expect(component.ruleGroupsTableData).toEqual({
        data: mockFirewallRuleGroups,
        count: 2,
        total: 2,
        page: 1,
        pageCount: 1,
      });
    }));

    it('should update when switching between NAT and Firewall groups', fakeAsync(() => {
      fixture.detectChanges();
      
      routeDataSubject.next({
        ruleGroupType: 'firewall',
        firewall: mockResolvedData,
      });
      tick();
      expect(component.ruleGroupsTableData.data).toEqual(mockFirewallRuleGroups);

      routeDataSubject.next({
        ruleGroupType: 'nat',
        firewall: mockResolvedData,
      });
      tick();

      expect(component.ruleGroupsTableData.data).toEqual(mockNatRuleGroups);
    }));
  });

  describe('Component Properties', () => {
    it('should set perPage to 20', () => {
      expect(component.perPage).toBe(20);
    });

    it('should initialize with empty rule groups', () => {
      expect(component.ruleGroups).toEqual([]);
    });

    it('should initialize with default table data', () => {
      expect(component.ruleGroupsTableData).toEqual({
        data: [],
        count: 0,
        total: 0,
        page: 1,
        pageCount: 1,
      });
    });
  });
});

