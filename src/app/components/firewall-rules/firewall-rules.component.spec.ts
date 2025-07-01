/* eslint-disable @typescript-eslint/dot-notation */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { of, Subject, Subscription } from 'rxjs';
import { V1NetworkSecurityFirewallRuleGroupsService, V1TiersService, Tier, FirewallRuleGroup } from 'client';
import { TierContextService } from 'src/app/services/tier-context.service';
import { FirewallRulesComponent } from './firewall-rules.component';
import {
  MockComponent,
  MockFontAwesomeComponent,
  MockImportExportComponent,
  MockTabsComponent,
  MockTooltipComponent,
  MockYesNoModalComponent,
} from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import UndeployedChangesUtil from 'src/app/utils/UndeployedChangesUtil';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { environment } from 'src/environments/environment';

// Mock the utils and environment
jest.mock('src/app/utils/ObjectUtil');
jest.mock('src/app/utils/SubscriptionUtil');
jest.mock('src/app/utils/UndeployedChangesUtil');
jest.mock('src/environments/environment');

describe('FirewallRulesComponent', () => {
  let component: FirewallRulesComponent;
  let fixture: ComponentFixture<FirewallRulesComponent>;
  let tierService: V1TiersService;
  let firewallRuleGroupService: V1NetworkSecurityFirewallRuleGroupsService;
  let router: Router;
  let ngxSmartModalService: NgxSmartModalService;

  const mockTier: Tier = {
    id: 'tier-1',
    name: 'Tier 1',
    datacenterId: 'dc-1',
    appIdEnabled: true,
    firewallRuleGroups: [],
  };
  const tierSubject = new Subject<Tier>();

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        FirewallRulesComponent,
        MockComponent({ selector: 'app-table', inputs: ['config', 'data'] }),
        MockComponent({ selector: 'app-tier-select' }),
        MockImportExportComponent,
        MockFontAwesomeComponent,
        MockTabsComponent,
        MockTooltipComponent,
        MockYesNoModalComponent,
      ],
      imports: [RouterTestingModule],
      providers: [
        MockProvider(NgxSmartModalService),
        {
          provide: TierContextService,
          useValue: { currentTier: tierSubject.asObservable() },
        },
        MockProvider(V1TiersService),
        MockProvider(V1NetworkSecurityFirewallRuleGroupsService),
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FirewallRulesComponent);
    component = fixture.componentInstance;
    tierService = TestBed.inject(V1TiersService);
    firewallRuleGroupService = TestBed.inject(V1NetworkSecurityFirewallRuleGroupsService);
    router = TestBed.inject(Router);
    ngxSmartModalService = TestBed.inject(NgxSmartModalService);

    // Default mock implementations
    (ObjectUtil.getObjectName as jest.Mock).mockReturnValue('Tier 1');
    (ObjectUtil.getObjectId as jest.Mock).mockReturnValue('tier-1');
    (UndeployedChangesUtil.hasUndeployedChanges as jest.Mock).mockReturnValue(false);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    let getTiersSpy: jest.SpyInstance;

    beforeEach(() => {
      getTiersSpy = jest.spyOn(component, 'getTiers').mockImplementation();
    });

    it('should do nothing if currentTier is not set', () => {
      component.ngOnInit();
      tierSubject.next(null);
      expect(component.currentTier).toBeUndefined();
      expect(getTiersSpy).not.toHaveBeenCalled();
    });

    it('should set currentTier and call getTiers if currentTier is set', () => {
      component.ngOnInit();
      tierSubject.next(mockTier);
      expect(component.currentTier).toEqual(mockTier);
      expect(getTiersSpy).toHaveBeenCalled();
    });

    it('should set appIdEnabled to true when env and tier are enabled', () => {
      (environment as any).dynamic = { appIdEnabled: true };
      const tier = { ...mockTier, appIdEnabled: true };
      component.ngOnInit();
      tierSubject.next(tier);
      expect(component['appIdEnabled']).toBe(true);
    });

    it('should set appIdEnabled to false when env is disabled', () => {
      (environment as any).dynamic = { appIdEnabled: false };
      const tier = { ...mockTier, appIdEnabled: true };
      component.ngOnInit();
      tierSubject.next(tier);
      expect(component['appIdEnabled']).toBe(false);
    });

    it('should set appIdEnabled to false when tier is disabled', () => {
      (environment as any).dynamic = { appIdEnabled: true };
      const tier = { ...mockTier, appIdEnabled: false };
      component.ngOnInit();
      tierSubject.next(tier);
      expect(component['appIdEnabled']).toBe(false);
    });

    it('should handle when dynamic env is missing', () => {
      (environment as any).dynamic = undefined;
      const tier = { ...mockTier, appIdEnabled: true };
      component.ngOnInit();
      tierSubject.next(tier);
      expect.assertions(0);
    });
  });

  describe('navigateToEdit', () => {
    it('should navigate to the edit page with correct state and query params', () => {
      const navigateSpy = jest.spyOn(router, 'navigate');
      const mockGroup = { id: 'group-1' };
      component['appIdEnabled'] = true;

      component.navigateToEdit(mockGroup);

      expect(navigateSpy).toHaveBeenCalledWith(['/netcentric/firewall-rules/edit', 'group-1'], {
        state: { appIdEnabled: true },
        queryParamsHandling: 'merge',
      });
    });
  });

  describe('getTiers', () => {
    it('should get tier details and assign firewallRuleGroups', () => {
      const mockFwGroups = [{ name: 'group1' }, { name: 'group2' }];
      const getOneTierSpy = jest
        .spyOn(tierService, 'getOneTier')
        .mockReturnValue(of({ ...mockTier, firewallRuleGroups: mockFwGroups as any }) as any);
      component.currentTier = mockTier;
      component.getTiers();
      expect(getOneTierSpy).toHaveBeenCalledWith({
        id: 'tier-1',
        join: ['firewallRuleGroups'],
      });
      expect(component.firewallRuleGroups).toEqual(mockFwGroups);
    });
  });

  describe('filterFirewallRuleGroup', () => {
    it('should return false for firewallRuleGroup named "Intravrf"', () => {
      const group = { name: 'Intravrf' } as FirewallRuleGroup;
      expect(component.filterFirewallRuleGroup(group)).toBe(false);
    });

    it('should return true for firewallRuleGroup with other names', () => {
      const group = { name: 'MyGroup' } as FirewallRuleGroup;
      expect(component.filterFirewallRuleGroup(group)).toBe(true);
    });
  });

  describe('getTierName', () => {
    it('should call ObjectUtil.getObjectName with correct params', () => {
      component.currentTier = mockTier;
      component.getTierName('tier-1');
      expect(ObjectUtil.getObjectName).toHaveBeenCalledWith('tier-1', [mockTier], 'Error Resolving Name');
    });
  });

  describe('importFirewallRuleGroupsConfig', () => {
    let subscribeToYesNoModalSpy: jest.SpyInstance;
    let createManySpy: jest.SpyInstance;
    let getTiersSpy: jest.SpyInstance;

    beforeEach(() => {
      subscribeToYesNoModalSpy = jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal');
      createManySpy = jest.spyOn(firewallRuleGroupService, 'createManyFirewallRuleGroup').mockReturnValue(of(null));
      getTiersSpy = jest.spyOn(component, 'getTiers').mockImplementation();
    });

    it('should show confirmation with singular message for one item', () => {
      component.importFirewallRuleGroupsConfig([{}]);
      const expectedDto = new YesNoModalDto('Import Firewall Rule Groups', 'Are you sure you would like to import 1 firewall rule group?');
      expect(subscribeToYesNoModalSpy).toHaveBeenCalledWith(expectedDto, ngxSmartModalService, expect.any(Function));
    });

    it('should show confirmation with plural message for multiple items', () => {
      component.importFirewallRuleGroupsConfig([{}, {}]);
      const expectedDto = new YesNoModalDto('Import Firewall Rule Groups', 'Are you sure you would like to import 2 firewall rule groups?');
      expect(subscribeToYesNoModalSpy).toHaveBeenCalledWith(expectedDto, ngxSmartModalService, expect.any(Function));
    });

    it('onConfirm should sanitize data, call create service and refresh tiers', () => {
      const sanitizeSpy = jest.spyOn(component, 'sanitizeData').mockImplementation(data => data);
      // Make the mock for subscribeToYesNoModal call the onConfirm function immediately
      subscribeToYesNoModalSpy.mockImplementation((dto, ngx, onConfirm) => {
        onConfirm();
      });

      component.importFirewallRuleGroupsConfig([{}]);

      expect(sanitizeSpy).toHaveBeenCalledWith([{}]);
      expect(createManySpy).toHaveBeenCalledWith({ createManyFirewallRuleGroupDto: { bulk: [{}] } });
      expect(getTiersSpy).toHaveBeenCalled();
    });
  });

  describe('sanitizeData', () => {
    it('should map each entity using mapToCsv', () => {
      const mapToCsvSpy = jest.spyOn(component, 'mapToCsv').mockImplementation();
      const entities = [{}, {}];
      component.sanitizeData(entities);
      expect(mapToCsvSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('mapToCsv', () => {
    beforeEach(() => {
      component.currentTier = mockTier;
    });

    it('should delete keys with null or empty string values', () => {
      const obj = { a: null, b: '', c: 'value' };
      const result = component.mapToCsv(obj);
      expect(result).toEqual({ c: 'value' });
    });

    it('should trim ipAddress', () => {
      const obj = { ipAddress: ' 1.1.1.1 ' };
      const result = component.mapToCsv(obj);
      expect(result.ipAddress).toBe('1.1.1.1');
    });

    it('should handle vrf_name by getting tierId from ObjectUtil', () => {
      const obj = { vrf_name: 'Tier 1' };
      const result = component.mapToCsv(obj);
      expect(ObjectUtil.getObjectId).toHaveBeenCalledWith('Tier 1', [mockTier]);
      expect(result.tierId).toBe('tier-1');
      expect(result.vrf_name).toBeUndefined();
    });

    it('should handle vrfName by getting tierId from ObjectUtil', () => {
      const obj = { vrfName: 'Tier 1' };
      const result = component.mapToCsv(obj);
      expect(ObjectUtil.getObjectId).toHaveBeenCalledWith('Tier 1', [mockTier]);
      expect(result.tierId).toBe('tier-1');
      expect(result.vrfName).toBeUndefined();
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe from subscriptions', () => {
      const unsubscribeSpy = jest.spyOn(SubscriptionUtil, 'unsubscribe');
      component['currentTierSubscription'] = new Subscription();
      component.ngOnDestroy();
      expect(unsubscribeSpy).toHaveBeenCalledWith([component['currentTierSubscription']]);
    });
  });

  describe('checkUndeployedChanges', () => {
    it('should call UndeployedChangesUtil.hasUndeployedChanges', () => {
      const obj = {};
      component.checkUndeployedChanges(obj);
      expect(UndeployedChangesUtil.hasUndeployedChanges).toHaveBeenCalledWith(obj);
    });
  });
});
