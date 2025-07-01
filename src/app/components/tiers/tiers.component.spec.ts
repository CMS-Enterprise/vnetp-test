/* eslint-disable max-lines */
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA, TemplateRef } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import {
  Datacenter,
  GetManyFirewallRuleGroupResponseDto,
  GetManyNatRuleGroupResponseDto,
  GetManyTierGroupResponseDto,
  GetManyTierResponseDto,
  Tier,
  TierGroup,
  V1NetworkSecurityFirewallRuleGroupsService,
  V1NetworkSecurityNatRuleGroupsService,
  V1NetworkSecurityNetworkObjectGroupsService,
  V1NetworkSecurityNetworkObjectsService,
  V1NetworkSecurityServiceObjectGroupsService,
  V1NetworkSecurityServiceObjectsService,
  V1TiersService,
  V1TierGroupsService,
  TierTierClassEnum,
  TierTierTypeEnum,
} from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { EntityService } from 'src/app/services/entity.service';
import { TableContextService } from 'src/app/services/table-context.service';
import { MockComponent } from 'src/test/mock-components';
import { TiersComponent } from './tiers.component';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { TierModalDto } from 'src/app/models/network/tier-modal-dto';
import { Subscription } from 'rxjs';

// Mock static utils
jest.mock('src/app/utils/ObjectUtil', () => ({
  __esModule: true,
  default: {
    getObjectName: jest.fn(),
  },
}));
import ObjectUtil from 'src/app/utils/ObjectUtil';

jest.mock('src/app/utils/SubscriptionUtil', () => ({
  __esModule: true,
  default: {
    subscribeToYesNoModal: jest.fn(),
    unsubscribe: jest.fn(),
  },
}));
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

jest.mock('../../utils/UndeployedChangesUtil', () => ({
  __esModule: true,
  default: {
    hasUndeployedChanges: jest.fn(),
  },
}));
import UndeployedChangesUtil from '../../utils/UndeployedChangesUtil';

describe('TiersComponent', () => {
  let component: TiersComponent;
  let fixture: ComponentFixture<TiersComponent>;

  // Service Mocks
  let mockDatacenterContextService: Partial<DatacenterContextService>;
  let mockEntityService: Partial<EntityService>;
  let mockNgxSmartModalService: any;
  let mockTierGroupService: Partial<V1TierGroupsService>;
  let mockTierService: Partial<V1TiersService>;
  let mockTableContextService: Partial<TableContextService>;
  let mockFirewallRuleGroupService: Partial<V1NetworkSecurityFirewallRuleGroupsService>;
  let mockNatRuleGroupService: Partial<V1NetworkSecurityNatRuleGroupsService>;
  let mockNetworkObjectService: Partial<V1NetworkSecurityNetworkObjectsService>;
  let mockNetworkObjectGroupService: Partial<V1NetworkSecurityNetworkObjectGroupsService>;
  let mockServiceObjectService: Partial<V1NetworkSecurityServiceObjectsService>;
  let mockServiceObjectGroupService: Partial<V1NetworkSecurityServiceObjectGroupsService>;

  // Mock Data
  const MOCK_DATACENTER: Datacenter = { id: 'dc-1', name: 'Test DC' };
  const MOCK_TIER_1: Tier = {
    id: 't-1',
    name: 'Tier A',
    datacenterId: 'dc-1',
    tierClass: TierTierClassEnum.Prd,
    tierType: TierTierTypeEnum.Application,
  };
  const MOCK_TIER_2_DELETED: Tier = {
    id: 't-2',
    name: 'Tier B',
    datacenterId: 'dc-1',
    deletedAt: new Date().toISOString(),
    tierClass: TierTierClassEnum.Dev,
    tierType: TierTierTypeEnum.Database,
  };
  const MOCK_TIER_GROUPS: TierGroup[] = [{ id: 'tg-1', name: 'Group A', datacenterId: 'dc-1' }];
  const MOCK_TIERS_RESPONSE: GetManyTierResponseDto = {
    data: [MOCK_TIER_1],
    count: 1,
    total: 1,
    page: 1,
    pageCount: 1,
    totalPages: 1,
  };

  // Mock window.location.reload
  const originalReload = window.location.reload;

  beforeAll(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...window.location, reload: jest.fn() },
    });
  });

  afterAll(() => {
    window.location.reload = originalReload;
  });

  beforeEach(() => {
    // Reset mocks
    (SubscriptionUtil.subscribeToYesNoModal as jest.Mock).mockClear();
    (SubscriptionUtil.unsubscribe as jest.Mock).mockClear();
    (ObjectUtil.getObjectName as jest.Mock).mockClear();
    (UndeployedChangesUtil.hasUndeployedChanges as jest.Mock).mockClear();
    (window.location.reload as jest.Mock).mockClear();

    mockDatacenterContextService = {
      currentDatacenter: new BehaviorSubject<Datacenter>(null),
      lockDatacenter: jest.fn(),
    };

    mockEntityService = {
      deleteEntity: jest.fn(),
    };

    mockNgxSmartModalService = {
      getModal: jest.fn(() => ({
        open: jest.fn(),
        onCloseFinished: of(true),
      })),
      setModalData: jest.fn(),
      resetModalData: jest.fn(),
    };

    mockTierGroupService = {
      getManyTierGroup: jest.fn().mockReturnValue(of({ data: MOCK_TIER_GROUPS } as GetManyTierGroupResponseDto)),
    };

    mockTierService = {
      getManyTier: jest.fn().mockReturnValue(of(MOCK_TIERS_RESPONSE)),
      deleteOneTier: jest.fn().mockReturnValue(of(null)),
      softDeleteOneTier: jest.fn().mockReturnValue(of(null)),
      restoreOneTier: jest.fn().mockReturnValue(of(null)),
      createManyTier: jest.fn().mockReturnValue(of(null)),
    };

    mockTableContextService = {
      getSearchLocalStorage: jest.fn().mockReturnValue({}),
    };

    const mockDcsResponse = (data = []) => of({ data, count: data.length, total: data.length, page: 1, pageCount: 1 });
    mockFirewallRuleGroupService = { getManyFirewallRuleGroup: jest.fn().mockReturnValue(mockDcsResponse()) };
    mockNatRuleGroupService = { getManyNatRuleGroup: jest.fn().mockReturnValue(mockDcsResponse()) };
    mockNetworkObjectService = { getManyNetworkObject: jest.fn().mockReturnValue(mockDcsResponse()) };
    mockNetworkObjectGroupService = { getManyNetworkObjectGroup: jest.fn().mockReturnValue(mockDcsResponse()) };
    mockServiceObjectService = { getManyServiceObject: jest.fn().mockReturnValue(mockDcsResponse()) };
    mockServiceObjectGroupService = { getManyServiceObjectGroup: jest.fn().mockReturnValue(mockDcsResponse()) };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, FormsModule, ReactiveFormsModule, RouterTestingModule.withRoutes([])],
      declarations: [TiersComponent, MockComponent({ selector: 'app-table', inputs: ['config', 'data'] })],
      providers: [
        { provide: DatacenterContextService, useValue: mockDatacenterContextService },
        { provide: EntityService, useValue: mockEntityService },
        { provide: NgxSmartModalService, useValue: mockNgxSmartModalService },
        { provide: V1TierGroupsService, useValue: mockTierGroupService },
        { provide: V1TiersService, useValue: mockTierService },
        { provide: TableContextService, useValue: mockTableContextService },
        { provide: V1NetworkSecurityFirewallRuleGroupsService, useValue: mockFirewallRuleGroupService },
        { provide: V1NetworkSecurityNatRuleGroupsService, useValue: mockNatRuleGroupService },
        { provide: V1NetworkSecurityNetworkObjectsService, useValue: mockNetworkObjectService },
        { provide: V1NetworkSecurityNetworkObjectGroupsService, useValue: mockNetworkObjectGroupService },
        { provide: V1NetworkSecurityServiceObjectsService, useValue: mockServiceObjectService },
        { provide: V1NetworkSecurityServiceObjectGroupsService, useValue: mockServiceObjectGroupService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(TiersComponent);
    component = fixture.componentInstance;

    // Manually set ViewChild properties
    component.actionsTemplate = {} as TemplateRef<any>;
    component.stateTemplate = {} as TemplateRef<any>;
    component.tierGroupTemplate = {} as TemplateRef<any>;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should not fetch data if datacenter is null', () => {
      const getTierGroupsSpy = jest.spyOn(component, 'getTierGroups');
      (mockDatacenterContextService.currentDatacenter as BehaviorSubject<Datacenter>).next(null);
      expect(getTierGroupsSpy).not.toHaveBeenCalled();
    });

    it('should fetch data when a datacenter is emitted', () => {
      const getTierGroupsSpy = jest.spyOn(component, 'getTierGroups');
      (mockDatacenterContextService.currentDatacenter as BehaviorSubject<Datacenter>).next(MOCK_DATACENTER);
      expect(component.currentDatacenter).toEqual(MOCK_DATACENTER);
      expect(getTierGroupsSpy).toHaveBeenCalledWith(true);
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe from all subscriptions', () => {
      component.ngOnDestroy();
      expect(SubscriptionUtil.unsubscribe).toHaveBeenCalled();
    });
  });

  describe('getTierGroups', () => {
    it('should fetch tier groups and optionally tiers', () => {
      const getTiersSpy = jest.spyOn(component, 'getTiers');
      component.currentDatacenter = MOCK_DATACENTER;
      component.getTierGroups(true);
      expect(mockTierGroupService.getManyTierGroup).toHaveBeenCalledWith({
        filter: [`datacenterId||eq||${MOCK_DATACENTER.id}`],
      });
      expect(component.tierGroups).toEqual(MOCK_TIER_GROUPS);
      expect(getTiersSpy).toHaveBeenCalled();
    });

    it('should not fetch tiers if loadTiers is false', () => {
      const getTiersSpy = jest.spyOn(component, 'getTiers');
      component.currentDatacenter = MOCK_DATACENTER;
      component.getTierGroups();
      expect(mockTierGroupService.getManyTierGroup).toHaveBeenCalledWith({
        filter: [`datacenterId||eq||${MOCK_DATACENTER.id}`],
      });
      expect(getTiersSpy).not.toHaveBeenCalled();
    });
  });

  describe('getTiers', () => {
    beforeEach(() => {
      component.currentDatacenter = MOCK_DATACENTER;
    });

    it('should fetch tiers with default parameters', () => {
      component.getTiers();
      expect(mockTierService.getManyTier).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: [`datacenterId||eq||${MOCK_DATACENTER.id}`, undefined],
          page: 1,
          perPage: 20,
        }),
      );
      expect(component.tiers).toEqual(MOCK_TIERS_RESPONSE);
      expect(component.isLoading).toBe(false);
    });

    it('should use event parameters if provided', () => {
      const event = { page: 2, perPage: 50, searchColumn: 'name', searchText: 'test' };
      component.getTiers(event);
      expect(mockTierService.getManyTier).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: [`datacenterId||eq||${MOCK_DATACENTER.id}`, 'name||cont||test'],
          page: 2,
          perPage: 50,
        }),
      );
    });

    it('should use default page and perPage if not in event', () => {
      const event = { searchColumn: 'name', searchText: 'test' };
      component.getTiers(event);
      expect(mockTierService.getManyTier).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          perPage: 20,
        }),
      );
    });

    it('should handle API errors gracefully', () => {
      (mockTierService.getManyTier as jest.Mock).mockReturnValue(throwError(() => new Error('API Error')));
      component.getTiers();
      expect(component.tiers).toBeNull();
      expect(component.isLoading).toBe(false);
    });
  });

  describe('openTierModal', () => {
    it('should open modal in Create mode', () => {
      component.currentDatacenter = MOCK_DATACENTER;
      const subscribeSpy = jest.spyOn(component as any, 'subscribeToTierModal');
      component.openTierModal(ModalMode.Create);

      const expectedDto = new TierModalDto();
      expectedDto.ModalMode = ModalMode.Create;
      expectedDto.DatacenterId = MOCK_DATACENTER.id;

      expect(mockDatacenterContextService.lockDatacenter).toHaveBeenCalled();
      expect(mockNgxSmartModalService.setModalData).toHaveBeenCalledWith(expectedDto, 'tierModal');
      expect(mockNgxSmartModalService.getModal).toHaveBeenCalledWith('tierModal');
      expect(subscribeSpy).toHaveBeenCalled();
    });

    it('should open modal in Edit mode', () => {
      component.currentDatacenter = MOCK_DATACENTER;
      const subscribeSpy = jest.spyOn(component as any, 'subscribeToTierModal');
      component.openTierModal(ModalMode.Edit, MOCK_TIER_1);

      const expectedDto = new TierModalDto();
      expectedDto.ModalMode = ModalMode.Edit;
      expectedDto.DatacenterId = MOCK_DATACENTER.id;
      expectedDto.Tier = MOCK_TIER_1;

      expect(mockNgxSmartModalService.setModalData).toHaveBeenCalledWith(expectedDto, 'tierModal');
      expect(subscribeSpy).toHaveBeenCalled();
    });
  });

  describe('deleteTier', () => {
    it('should open type delete modal if tier is already soft-deleted', () => {
      const openModalSpy = jest.spyOn(component, 'openTypeDeleteModal');
      component.deleteTier(MOCK_TIER_2_DELETED);
      expect(openModalSpy).toHaveBeenCalledWith(MOCK_TIER_2_DELETED);
    });

    it('should call entityService.deleteEntity for a non-deleted tier', () => {
      component.deleteTier(MOCK_TIER_1);
      expect(mockEntityService.deleteEntity).toHaveBeenCalledWith(MOCK_TIER_1, expect.objectContaining({ entityName: 'Tier' }));
    });

    it('should refresh with search context on successful deletion', () => {
      const getTiersSpy = jest.spyOn(component, 'getTiers');
      const searchParams = { filteredResults: true, searchText: 'test' };
      (mockTableContextService.getSearchLocalStorage as jest.Mock).mockReturnValue(searchParams);

      (mockEntityService.deleteEntity as jest.Mock).mockImplementation((entity, config) => {
        config.onSuccess();
      });

      component.currentDatacenter = MOCK_DATACENTER;
      component.deleteTier(MOCK_TIER_1);
      expect(getTiersSpy).toHaveBeenCalledWith(searchParams);
    });

    it('should refresh without search context on successful deletion', () => {
      const getTiersSpy = jest.spyOn(component, 'getTiers');
      (mockTableContextService.getSearchLocalStorage as jest.Mock).mockReturnValue({ filteredResults: false });
      (mockEntityService.deleteEntity as jest.Mock).mockImplementation((entity, config) => {
        config.onSuccess();
      });
      component.currentDatacenter = MOCK_DATACENTER;
      component.deleteTier(MOCK_TIER_1);
      expect(getTiersSpy).toHaveBeenCalledWith();
    });
  });

  describe('restoreTier', () => {
    it('should do nothing if tier is not deleted', () => {
      component.restoreTier(MOCK_TIER_1);
      expect(mockTierService.restoreOneTier).not.toHaveBeenCalled();
    });

    it('should call restore service and refresh with search context', () => {
      const getTiersSpy = jest.spyOn(component, 'getTiers');
      const searchParams = { filteredResults: true, searchText: 'test' };
      (mockTableContextService.getSearchLocalStorage as jest.Mock).mockReturnValue(searchParams);
      component.restoreTier(MOCK_TIER_2_DELETED);
      expect(mockTierService.restoreOneTier).toHaveBeenCalledWith({ id: MOCK_TIER_2_DELETED.id });
      expect(getTiersSpy).toHaveBeenCalledWith(searchParams);
    });

    it('should call restore service and refresh without search context', () => {
      const getTiersSpy = jest.spyOn(component, 'getTiers');
      (mockTableContextService.getSearchLocalStorage as jest.Mock).mockReturnValue({ filteredResults: false });
      component.restoreTier(MOCK_TIER_2_DELETED);
      expect(getTiersSpy).toHaveBeenCalledWith();
    });
  });

  describe('importTiersConfig', () => {
    it('should show singular confirmation for one tier', () => {
      component.importTiersConfig([MOCK_TIER_1]);
      expect(SubscriptionUtil.subscribeToYesNoModal).toHaveBeenCalled();
    });

    it('should show plural confirmation for multiple tiers', () => {
      component.importTiersConfig([MOCK_TIER_1, MOCK_TIER_2_DELETED]);
      expect(SubscriptionUtil.subscribeToYesNoModal).toHaveBeenCalled();
    });

    it('should call createManyTier on confirmation', () => {
      const getTiersSpy = jest.spyOn(component, 'getTiers');
      (SubscriptionUtil.subscribeToYesNoModal as jest.Mock).mockImplementation((dto, ngx, onConfirm) => {
        onConfirm();
      });
      component.importTiersConfig([MOCK_TIER_1]);
      expect(mockTierService.createManyTier).toHaveBeenCalled();
      expect(getTiersSpy).toHaveBeenCalled();
    });
  });

  describe('sanitizeTiers', () => {
    it('should correctly sanitize various truthy/falsy/nullish values', () => {
      const dirtyTier: any = {
        a: 'true',
        b: 't',
        c: 'false',
        d: 'f',
        e: null,
        f: '',
        g: 'hello',
        h: 123,
      };
      const expectedTier = {
        a: true,
        b: true,
        c: false,
        d: false,
        g: 'hello',
        h: 123,
      };
      const result = (component as any).sanitizeTiers([dirtyTier]);
      expect(result[0]).toEqual(expectedTier);
    });
  });

  describe('getExportTiers', () => {
    it('should not run if there is no tier data', () => {
      component.tiers.data = undefined;
      component.getExportTiers();
      expect(mockNetworkObjectService.getManyNetworkObject).not.toHaveBeenCalled();
    });

    it('should call all DCS services for each tier and process results', fakeAsync(() => {
      component.tiers.data = [MOCK_TIER_1];
      const firewallRuleGroup = {
        data: [{ id: 'frg-1', firewallRules: [{ ruleIndex: 2 }, { ruleIndex: 1 }] }],
      } as GetManyFirewallRuleGroupResponseDto;
      const natRuleGroup = { data: [{ id: 'nrg-1', natRules: [{ ruleIndex: 2 }, { ruleIndex: 1 }] }] } as GetManyNatRuleGroupResponseDto;
      (mockFirewallRuleGroupService.getManyFirewallRuleGroup as jest.Mock).mockReturnValue(of(firewallRuleGroup));
      (mockNatRuleGroupService.getManyNatRuleGroup as jest.Mock).mockReturnValue(of(natRuleGroup));
      (mockNetworkObjectService.getManyNetworkObject as jest.Mock).mockReturnValue(of({ data: [{ id: 'no-1' }] }));

      component.getExportTiers();
      tick();

      expect(mockFirewallRuleGroupService.getManyFirewallRuleGroup).toHaveBeenCalled();
      expect(mockNatRuleGroupService.getManyNatRuleGroup).toHaveBeenCalled();
      expect(mockNetworkObjectService.getManyNetworkObject).toHaveBeenCalled();
      expect(mockNetworkObjectGroupService.getManyNetworkObjectGroup).toHaveBeenCalled();
      expect(mockServiceObjectService.getManyServiceObject).toHaveBeenCalled();
      expect(mockServiceObjectGroupService.getManyServiceObjectGroup).toHaveBeenCalled();

      expect(component.exportTiers.length).toBe(1);
      const exported = component.exportTiers[0];
      expect(exported.id).toBe(MOCK_TIER_1.id);
      expect(exported.networkObjects[0].id).toBe('no-1');
      // Check that rules were sorted
      expect(exported.firewallRuleGroups[0].firewallRules[0].ruleIndex).toBe(1);
      expect(exported.natRuleGroups[0].natRules[0].ruleIndex).toBe(1);
      expect(component.exportTiersLoaded).toBe(true);
    }));
  });

  describe('Modal Subscriptions', () => {
    it('subscribeToTierModal should reload window on close', () => {
      (component as any).subscribeToTierModal();
      expect(window.location.reload).toHaveBeenCalled();
    });

    it('subscribeToTypeDeleteModal should refresh tiers on close', fakeAsync(() => {
      const getTiersSpy = jest.spyOn(component, 'getTiers');
      const mockSubscription = new Subscription();
      const unsubscribeSpy = jest.spyOn(mockSubscription, 'unsubscribe');
      const modal = {
        onCloseFinished: {
          subscribe: jest.fn().mockImplementation(callback => {
            (component as any).typeDeletemodalSubscription = mockSubscription;
            callback();
          }),
        },
        open: jest.fn(),
      };
      (mockNgxSmartModalService.getModal as jest.Mock).mockReturnValue(modal);

      component.currentDatacenter = MOCK_DATACENTER;
      component.subscribeToTypeDeleteModal();
      tick();

      expect(getTiersSpy).toHaveBeenCalled();
      expect(mockNgxSmartModalService.resetModalData).toHaveBeenCalledWith('typeDeleteModal');
      expect(unsubscribeSpy).toHaveBeenCalled();
    }));
  });

  describe('Helper methods', () => {
    it('getTierGroupName should call ObjectUtil', () => {
      component.getTierGroupName('tg-1');
      expect(ObjectUtil.getObjectName).toHaveBeenCalledWith('tg-1', component.tierGroups);
    });

    it('checkUndeployedChanges should call UndeployedChangesUtil', () => {
      const obj = { id: '1' };
      component.checkUndeployedChanges(obj);
      expect(UndeployedChangesUtil.hasUndeployedChanges).toHaveBeenCalledWith(obj);
    });

    it('onTableEvent should call getTiers', () => {
      const getTiersSpy = jest.spyOn(component, 'getTiers');
      const event: any = { page: 1 };
      component.currentDatacenter = MOCK_DATACENTER;
      component.onTableEvent(event);
      expect(component.tableComponentDto).toEqual(event);
      expect(getTiersSpy).toHaveBeenCalledWith(event);
    });
  });
});
