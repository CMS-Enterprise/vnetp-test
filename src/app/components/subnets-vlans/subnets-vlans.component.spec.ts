/* eslint-disable */
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import {
  GetManySubnetResponseDto,
  GetManyVlanResponseDto,
  Subnet,
  Tier,
  V1NetworkSubnetsService,
  V1NetworkVlansService,
  Vlan,
} from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { NgxPaginationModule } from 'ngx-pagination';
import { BehaviorSubject, of, Subscription, throwError } from 'rxjs';
import { AdvancedSearchAdapter } from 'src/app/common/advanced-search/advanced-search.adapter';
import { ImportExportComponent } from 'src/app/common/import-export/import-export.component';
import { YesNoModalComponent } from 'src/app/common/yes-no-modal/yes-no-modal.component';
import { SubnetsVlansHelpText } from 'src/app/helptext/help-text-networking';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { SubnetModalDto } from 'src/app/models/network/subnet-modal-dto';
import { VlanModalDto } from 'src/app/models/network/vlan-modal-dto';
import { ResolvePipe } from 'src/app/pipes/resolve.pipe';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { EntityService } from 'src/app/services/entity.service';
import { TableContextService } from 'src/app/services/table-context.service';
import { TierContextService } from 'src/app/services/tier-context.service';
import {
  MockComponent,
  MockFontAwesomeComponent,
  MockIconButtonComponent,
  MockTabsComponent,
  MockTooltipComponent,
} from 'src/test/mock-components';
import { SubnetsVlansComponent } from './subnets-vlans.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('SubnetsVlansComponent', () => {
  let component: SubnetsVlansComponent;
  let fixture: ComponentFixture<SubnetsVlansComponent>;

  let mockEntityService: Partial<EntityService>;
  let mockNgxSmartModalService: Partial<NgxSmartModalService>;
  let mockDatacenterContextService: Partial<DatacenterContextService>;
  let mockTierContextService: Partial<TierContextService>;
  let mockVlanService: Partial<V1NetworkVlansService>;
  let mockSubnetService: Partial<V1NetworkSubnetsService>;
  let mockTableContextService: Partial<TableContextService>;
  let mockModal;
  let datacenterSubject: BehaviorSubject<any>;

  const MOCK_TIER: Tier = { id: 'tier-1', name: 'Test Tier', datacenterId: 'dc-1' };
  const MOCK_SUBNET: Subnet = {
    id: 'sub-1',
    name: 'Test Subnet',
    network: '1.1.1.0/24',
    gateway: '1.1.1.1',
    vlanId: 'vlan-1',
    tierId: 'tier-1',
  };
  const MOCK_VLAN: Vlan = { id: 'vlan-1', name: 'Test VLAN', vlanNumber: 123, tierId: 'tier-1' };

  beforeEach(() => {
    mockModal = {
      onCloseFinished: of(null),
      open: jest.fn(),
      removeData: jest.fn(),
      getData: jest.fn(),
    };

    mockEntityService = {
      deleteEntity: jest.fn(),
    };

    mockNgxSmartModalService = {
      getModal: jest.fn().mockReturnValue(mockModal),
      setModalData: jest.fn(),
      resetModalData: jest.fn(),
    };

    datacenterSubject = new BehaviorSubject({ id: 'dc-1', name: 'Test DC', tiers: [MOCK_TIER] });
    mockDatacenterContextService = {
      currentDatacenter: datacenterSubject.asObservable(),
      currentDatacenterValue: { id: 'dc-1' } as any,
      lockDatacenter: jest.fn(),
      unlockDatacenter: jest.fn(),
    };

    mockTierContextService = {
      currentTier: of(MOCK_TIER),
    };

    mockVlanService = {
      getManyVlan: jest.fn().mockReturnValue(of({ data: [MOCK_VLAN], count: 1, total: 1, page: 1, pageCount: 1 })),
      createManyVlan: jest.fn().mockReturnValue(of(null)),
      restoreOneVlan: jest.fn().mockReturnValue(of(null)),
      softDeleteOneVlan: jest.fn().mockReturnValue(of(null)),
      deleteOneVlan: jest.fn().mockReturnValue(of(null)),
    };

    mockSubnetService = {
      getManySubnet: jest.fn().mockReturnValue(of({ data: [MOCK_SUBNET], count: 1, total: 1, page: 1, pageCount: 1 })),
      bulkImportSubnetsSubnet: jest.fn().mockReturnValue(of(null)),
      restoreOneSubnet: jest.fn().mockReturnValue(of(null)),
      softDeleteOneSubnet: jest.fn().mockReturnValue(of(null)),
      deleteOneSubnet: jest.fn().mockReturnValue(of(null)),
    };

    mockTableContextService = {
      getSearchLocalStorage: jest.fn().mockReturnValue({}),
      removeSearchLocalStorage: jest.fn(),
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, NgxPaginationModule, FormsModule, ReactiveFormsModule, RouterTestingModule.withRoutes([])],
      declarations: [
        ImportExportComponent,
        MockComponent('app-subnet-modal'),
        MockComponent('app-tier-select'),
        MockComponent('app-vlan-modal'),
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
        MockFontAwesomeComponent,
        MockIconButtonComponent,
        MockTabsComponent,
        MockTooltipComponent,
        ResolvePipe,
        SubnetsVlansComponent,
        YesNoModalComponent,
      ],
      providers: [
        { provide: EntityService, useValue: mockEntityService },
        { provide: NgxSmartModalService, useValue: mockNgxSmartModalService },
        { provide: DatacenterContextService, useValue: mockDatacenterContextService },
        { provide: TierContextService, useValue: mockTierContextService },
        { provide: V1NetworkVlansService, useValue: mockVlanService },
        { provide: V1NetworkSubnetsService, useValue: mockSubnetService },
        { provide: TableContextService, useValue: mockTableContextService },
        SubnetsVlansHelpText, // This seems to be a simple class, can be provided directly
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(SubnetsVlansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getVlans on vlan table event', () => {
    const getVlansSpy = jest.spyOn(component, 'getVlans');
    component.onVlanTableEvent({} as any);
    expect(getVlansSpy).toHaveBeenCalled();
  });

  it('should call getSubnets on subnet table event', () => {
    const getSubnetsSpy = jest.spyOn(component, 'getSubnets');
    component.onSubnetTableEvent({} as any);
    expect(getSubnetsSpy).toHaveBeenCalled();
  });

  describe('handleTabChange', () => {
    it('should change tabs and fetch data', () => {
      const getObjectsSpy = jest.spyOn(component, 'getObjectsForNavIndex');
      component.navIndex = 0; // Starts at Subnets
      component.handleTabChange({ name: 'VLANs' }); // Change to VLANs
      expect(mockTableContextService.removeSearchLocalStorage).toHaveBeenCalled();
      expect(component.navIndex).toBe(1);
      expect(getObjectsSpy).toHaveBeenCalled();
    });

    it('should not do anything if the tab is the same', () => {
      const getObjectsSpy = jest.spyOn(component, 'getObjectsForNavIndex');
      component.navIndex = 0;
      component.handleTabChange({ name: 'Subnets' });
      expect(mockTableContextService.removeSearchLocalStorage).not.toHaveBeenCalled();
      expect(getObjectsSpy).not.toHaveBeenCalled();
    });
  });

  describe('getVlans', () => {
    it('should fetch vlans successfully', () => {
      component.currentTier = MOCK_TIER;
      component.getVlans();
      expect(mockVlanService.getManyVlan).toHaveBeenCalled();
      expect(component.vlans.data[0]).toEqual(MOCK_VLAN);
    });

    it('should handle API errors gracefully', () => {
      (mockVlanService.getManyVlan as jest.Mock).mockReturnValue(throwError(() => new Error('API Error')));
      component.currentTier = MOCK_TIER;
      component.getVlans();
      expect(mockVlanService.getManyVlan).toHaveBeenCalled();
      expect(component.isLoadingVlans).toBe(false);
    });
  });

  describe('getSubnets', () => {
    it('should fetch subnets successfully', () => {
      component.currentTier = MOCK_TIER;
      component.getSubnets();
      expect(mockSubnetService.getManySubnet).toHaveBeenCalled();
      expect(component.subnets.data[0]).toEqual(MOCK_SUBNET);
    });

    it('should handle API errors gracefully', () => {
      (mockSubnetService.getManySubnet as jest.Mock).mockReturnValue(throwError(() => new Error('API Error')));
      component.currentTier = MOCK_TIER;
      component.getSubnets();
      expect(mockSubnetService.getManySubnet).toHaveBeenCalled();
      expect(component.isLoadingSubnets).toBe(false);
    });
  });

  describe('deleteSubnet', () => {
    it('should call entityService.deleteEntity with correct parameters', () => {
      component.deleteSubnet(MOCK_SUBNET);
      expect(mockEntityService.deleteEntity).toHaveBeenCalledWith(MOCK_SUBNET, expect.objectContaining({ entityName: 'Subnet' }));
    });

    it('should refresh subnets on successful deletion', () => {
      const getSubnetsSpy = jest.spyOn(component, 'getSubnets');
      (mockEntityService.deleteEntity as jest.Mock).mockImplementation((entity, config) => {
        config.onSuccess();
      });
      component.deleteSubnet(MOCK_SUBNET);
      expect(getSubnetsSpy).toHaveBeenCalled();
    });

    it('should refresh with basic search on successful deletion', () => {
      const getSubnetsSpy = jest.spyOn(component, 'getSubnets');
      (mockTableContextService.getSearchLocalStorage as jest.Mock).mockReturnValue({
        filteredResults: true,
        searchString: '',
        searchColumn: 'name',
        searchText: 'test-search',
      });
      (mockEntityService.deleteEntity as jest.Mock).mockImplementation((entity, config) => {
        config.onSuccess();
      });

      component.deleteSubnet(MOCK_SUBNET);

      expect(getSubnetsSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          searchColumn: 'name',
          searchText: 'test-search',
        }),
      );
    });

    it('should refresh with advanced search on successful deletion', () => {
      const getSubnetsSpy = jest.spyOn(component, 'getSubnets');
      (mockTableContextService.getSearchLocalStorage as jest.Mock).mockReturnValue({
        filteredResults: true,
        searchString: 'advanced-search',
      });
      (mockEntityService.deleteEntity as jest.Mock).mockImplementation((entity, config) => {
        config.onSuccess();
      });

      component.deleteSubnet(MOCK_SUBNET);

      expect(getSubnetsSpy).toHaveBeenCalledWith('advanced-search');
    });
  });

  describe('deleteVlan', () => {
    it('should call entityService.deleteEntity with correct parameters', () => {
      component.deleteVlan(MOCK_VLAN);
      expect(mockEntityService.deleteEntity).toHaveBeenCalledWith(MOCK_VLAN, expect.objectContaining({ entityName: 'VLAN' }));
    });

    it('should refresh vlans on successful deletion', () => {
      const getVlansSpy = jest.spyOn(component, 'getVlans');
      (mockEntityService.deleteEntity as jest.Mock).mockImplementation((entity, config) => {
        config.onSuccess();
      });
      component.deleteVlan(MOCK_VLAN);
      expect(getVlansSpy).toHaveBeenCalled();
    });

    it('should refresh with basic search on successful deletion', () => {
      const getVlansSpy = jest.spyOn(component, 'getVlans');
      (mockTableContextService.getSearchLocalStorage as jest.Mock).mockReturnValue({
        filteredResults: true,
        searchString: '',
        searchColumn: 'name',
        searchText: 'test-search',
      });
      (mockEntityService.deleteEntity as jest.Mock).mockImplementation((entity, config) => {
        config.onSuccess();
      });

      component.deleteVlan(MOCK_VLAN);

      expect(getVlansSpy).toHaveBeenCalledWith(
        false,
        expect.objectContaining({
          searchColumn: 'name',
          searchText: 'test-search',
        }),
      );
    });

    it('should refresh with advanced search on successful deletion', () => {
      const getVlansSpy = jest.spyOn(component, 'getVlans');
      (mockTableContextService.getSearchLocalStorage as jest.Mock).mockReturnValue({
        filteredResults: true,
        searchString: 'advanced-search',
      });
      (mockEntityService.deleteEntity as jest.Mock).mockImplementation((entity, config) => {
        config.onSuccess();
      });

      component.deleteVlan(MOCK_VLAN);

      expect(getVlansSpy).toHaveBeenCalledWith(false, 'advanced-search');
    });
  });

  describe('restoreSubnet', () => {
    it('should do nothing if subnet is not deleted', () => {
      component.restoreSubnet({ ...MOCK_SUBNET, deletedAt: null });
      expect(mockSubnetService.restoreOneSubnet).not.toHaveBeenCalled();
    });

    it('should call restore and refresh the list if subnet is deleted', fakeAsync(() => {
      const getSubnetsSpy = jest.spyOn(component, 'getSubnets');
      component.restoreSubnet({ ...MOCK_SUBNET, deletedAt: new Date().toISOString() });
      tick();
      expect(mockSubnetService.restoreOneSubnet).toHaveBeenCalledWith({ id: MOCK_SUBNET.id });
      expect(getSubnetsSpy).toHaveBeenCalled();
    }));

    it('should restore and refresh with basic search context', fakeAsync(() => {
      const getSubnetsSpy = jest.spyOn(component, 'getSubnets');
      (mockTableContextService.getSearchLocalStorage as jest.Mock).mockReturnValue({
        filteredResults: true,
        searchString: '',
        searchColumn: 'name',
        searchText: 'test',
      });
      component.restoreSubnet({ ...MOCK_SUBNET, deletedAt: new Date().toISOString() });
      tick();
      expect(getSubnetsSpy).toHaveBeenCalledWith(expect.objectContaining({ searchColumn: 'name', searchText: 'test' }));
    }));

    it('should restore and refresh with advanced search context', fakeAsync(() => {
      const getSubnetsSpy = jest.spyOn(component, 'getSubnets');
      (mockTableContextService.getSearchLocalStorage as jest.Mock).mockReturnValue({
        filteredResults: true,
        searchString: 'advanced-search-string',
      });
      component.restoreSubnet({ ...MOCK_SUBNET, deletedAt: new Date().toISOString() });
      tick();
      expect(getSubnetsSpy).toHaveBeenCalledWith('advanced-search-string');
    }));
  });

  describe('restoreVlan', () => {
    it('should do nothing if vlan is not deleted', () => {
      component.restoreVlan({ ...MOCK_VLAN, deletedAt: null });
      expect(mockVlanService.restoreOneVlan).not.toHaveBeenCalled();
    });

    it('should call restore and refresh the list if vlan is deleted', fakeAsync(() => {
      const getVlansSpy = jest.spyOn(component, 'getVlans');
      component.restoreVlan({ ...MOCK_VLAN, deletedAt: new Date().toISOString() });
      tick();
      expect(mockVlanService.restoreOneVlan).toHaveBeenCalledWith({ id: MOCK_VLAN.id });
      expect(getVlansSpy).toHaveBeenCalled();
    }));

    it('should restore and refresh with basic search context', fakeAsync(() => {
      const getVlansSpy = jest.spyOn(component, 'getVlans');
      (mockTableContextService.getSearchLocalStorage as jest.Mock).mockReturnValue({
        filteredResults: true,
        searchString: '',
        searchColumn: 'name',
        searchText: 'test',
      });
      component.restoreVlan({ ...MOCK_VLAN, deletedAt: new Date().toISOString() });
      tick();
      expect(getVlansSpy).toHaveBeenCalledWith(false, expect.objectContaining({ searchColumn: 'name', searchText: 'test' }));
    }));

    it('should restore and refresh with advanced search context', fakeAsync(() => {
      const getVlansSpy = jest.spyOn(component, 'getVlans');
      (mockTableContextService.getSearchLocalStorage as jest.Mock).mockReturnValue({
        filteredResults: true,
        searchString: 'advanced-search-string',
      });
      component.restoreVlan({ ...MOCK_VLAN, deletedAt: new Date().toISOString() });
      tick();
      expect(getVlansSpy).toHaveBeenCalledWith(false, 'advanced-search-string');
    }));
  });

  describe('Modal Openers', () => {
    it('openVlanModal should throw an error when in edit mode and no vlan is provided', () => {
      expect(() => component.openVlanModal(ModalMode.Edit)).toThrow('VLAN required');
    });

    it('openVlanModal should set modal data and open the modal', () => {
      component.currentTier = MOCK_TIER;
      component.openVlanModal(ModalMode.Edit, MOCK_VLAN);
      expect(mockNgxSmartModalService.setModalData).toHaveBeenCalledWith(expect.any(VlanModalDto), 'vlanModal');
      expect(mockModal.open).toHaveBeenCalled();
    });

    it('openSubnetModal should throw an error when in edit mode and no subnet is provided', () => {
      expect(() => component.openSubnetModal(ModalMode.Edit)).toThrow('Subnet required');
    });

    it('openSubnetModal should set modal data and open the modal', () => {
      component.currentTier = MOCK_TIER;
      component.openSubnetModal(ModalMode.Edit, MOCK_SUBNET);
      expect(mockNgxSmartModalService.setModalData).toHaveBeenCalledWith(expect.any(SubnetModalDto), 'subnetModal');
      expect(mockModal.open).toHaveBeenCalled();
    });
  });

  describe('getObjectsForNavIndex', () => {
    it('should get subnets when nav index is 0', () => {
      component.navIndex = 0;
      component.currentTier = MOCK_TIER;
      const getSubnetsSpy = jest.spyOn(component, 'getSubnets');
      component.getObjectsForNavIndex();
      expect(getSubnetsSpy).toHaveBeenCalled();
    });

    it('should get vlans when nav index is not 0', () => {
      component.navIndex = 1;
      component.currentTier = MOCK_TIER;
      const getVlansSpy = jest.spyOn(component, 'getVlans');
      component.getObjectsForNavIndex();
      expect(getVlansSpy).toHaveBeenCalled();
    });
  });

  describe('Data Fetching', () => {
    it('getSubnets should not fetch if no tier is selected', () => {
      (mockSubnetService.getManySubnet as jest.Mock).mockClear();
      component.currentTier = null;
      component.getSubnets();
      expect(mockSubnetService.getManySubnet).not.toHaveBeenCalled();
    });

    it('getVlans should not fetch if no tier is selected', () => {
      component.currentTier = null;
      component.getVlans();
      expect(mockVlanService.getManyVlan).not.toHaveBeenCalled();
    });

    it('getSubnets should handle events with partial pagination', () => {
      component.currentTier = MOCK_TIER;
      component.getSubnets({}); // No page or perPage
      expect(mockSubnetService.getManySubnet).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          perPage: 20,
        }),
      );
    });

    it('getVlans should handle events with partial pagination', () => {
      component.currentTier = MOCK_TIER;
      component.getVlans(false, {}); // No page or perPage
      expect(mockVlanService.getManyVlan).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          perPage: 20,
        }),
      );
    });

    it('getSubnets should build "eq" filter for network/gateway', () => {
      component.currentTier = MOCK_TIER;
      component.getSubnets({ searchColumn: 'network', searchText: '1.1.1.0' });
      expect(mockSubnetService.getManySubnet).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: expect.arrayContaining(['tierId||eq||tier-1', 'network||eq||1.1.1.0']),
        }),
      );
    });

    it('getSubnets should build "cont" filter for other columns', () => {
      component.currentTier = MOCK_TIER;
      component.getSubnets({ searchColumn: 'name', searchText: 'test' });
      expect(mockSubnetService.getManySubnet).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: expect.arrayContaining(['tierId||eq||tier-1', 'name||cont||test']),
        }),
      );
    });

    it('getVlans should build "eq" filter for vlanNumber/vcdVlanType', () => {
      component.currentTier = MOCK_TIER;
      component.getVlans(false, { searchColumn: 'vlanNumber', searchText: '123' });
      expect(mockVlanService.getManyVlan).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: expect.arrayContaining(['tierId||eq||tier-1', 'vlanNumber||eq||123']),
        }),
      );
    });

    it('getVlans should build "cont" filter for other columns and trigger getSubnets', () => {
      const getSubnetsSpy = jest.spyOn(component, 'getSubnets');
      component.currentTier = MOCK_TIER;
      component.getVlans(true, { searchColumn: 'name', searchText: 'test' });
      expect(mockVlanService.getManyVlan).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: expect.arrayContaining(['tierId||eq||tier-1', 'name||cont||test']),
        }),
      );
      expect(getSubnetsSpy).toHaveBeenCalled();
    });
  });

  describe('Modal Subscriptions', () => {
    it('should refresh subnets with search context on modal close', () => {
      const getSubnetsSpy = jest.spyOn(component, 'getSubnets');
      (mockTableContextService.getSearchLocalStorage as jest.Mock).mockReturnValue({
        filteredResults: true,
        searchColumn: 'name',
        searchText: 'test',
      });
      component.subscribeToSubnetModal();
      expect(getSubnetsSpy).toHaveBeenCalledWith(expect.objectContaining({ searchColumn: 'name' }));
    });

    it('should refresh vlans with search context on modal close', () => {
      const getVlansSpy = jest.spyOn(component, 'getVlans');
      (mockTableContextService.getSearchLocalStorage as jest.Mock).mockReturnValue({
        filteredResults: true,
        searchColumn: 'name',
        searchText: 'test',
      });
      component.subscribeToVlanModal();
      expect(getVlansSpy).toHaveBeenCalledWith(false, expect.objectContaining({ searchColumn: 'name' }));
    });

    it('should refresh subnets with advanced search on modal close', () => {
      const getSubnetsSpy = jest.spyOn(component, 'getSubnets');
      (mockTableContextService.getSearchLocalStorage as jest.Mock).mockReturnValue({
        filteredResults: true,
        searchString: 'advanced',
      });
      component.subscribeToSubnetModal();
      expect(getSubnetsSpy).toHaveBeenCalledWith('advanced');
    });

    it('should refresh vlans with advanced search on modal close', () => {
      const getVlansSpy = jest.spyOn(component, 'getVlans');
      (mockTableContextService.getSearchLocalStorage as jest.Mock).mockReturnValue({
        filteredResults: true,
        searchString: 'advanced',
      });
      component.subscribeToVlanModal();
      expect(getVlansSpy).toHaveBeenCalledWith(false, 'advanced');
    });
  });

  describe('Initialization', () => {
    it('should not fetch objects if datacenter has no tiers', () => {
      const getObjectsSpy = jest.spyOn(component, 'getObjectsForNavIndex');
      getObjectsSpy.mockClear();
      datacenterSubject.next({ id: 'dc-2', name: 'Empty DC', tiers: [] });
      expect(getObjectsSpy).not.toHaveBeenCalled();
    });
  });

  describe('Import/Export', () => {
    let subscribeToYesNoModalSpy;
    beforeEach(() => {
      // Mock the static SubscriptionUtil method
      subscribeToYesNoModalSpy = jest.spyOn(require('src/app/utils/SubscriptionUtil').default, 'subscribeToYesNoModal');
    });

    it('importVlansConfig should use plural "VLANs" for multiple items', () => {
      component.importVlansConfig([MOCK_VLAN, MOCK_VLAN]);
      expect(subscribeToYesNoModalSpy).toHaveBeenCalledWith(
        expect.objectContaining({ modalBody: 'Are you sure you would like to import 2 VLANs?' }),
        expect.any(Object),
        expect.any(Function),
        expect.any(Function),
      );
    });

    it('importVlansConfig should use singular "VLAN" for a single item', () => {
      component.importVlansConfig([MOCK_VLAN]);
      expect(subscribeToYesNoModalSpy).toHaveBeenCalledWith(
        expect.objectContaining({ modalBody: 'Are you sure you would like to import 1 VLAN?' }),
        expect.any(Object),
        expect.any(Function),
        expect.any(Function),
      );
    });

    it('importSubnetConfig should call the service on confirmation', () => {
      subscribeToYesNoModalSpy.mockImplementation((dto, ngx, onConfirm) => {
        onConfirm(); // Simulate user clicking "Yes"
      });
      component.importSubnetConfig([MOCK_SUBNET]);
      expect(mockSubnetService.bulkImportSubnetsSubnet).toHaveBeenCalled();
    });

    it('importVlansConfig should reset radio button on close', () => {
      subscribeToYesNoModalSpy.mockImplementation((dto, ngx, onConfirm, onClose) => {
        onClose(); // Simulate user clicking "No" or closing the modal
      });
      component.showRadio = true;
      component.importVlansConfig([MOCK_VLAN]);
      expect(component.showRadio).toBe(false);
    });

    it('should transform VLANs before creating them', () => {
      subscribeToYesNoModalSpy.mockImplementation((dto, ngx, onConfirm) => {
        onConfirm(); // Simulate user clicking "Yes"
      });
      const getTierIdSpy = jest.spyOn(component, 'getTierId').mockReturnValue('tier-1');
      const vlanToImport = { vlanNumber: '123', tierName: 'Test Tier' };
      component.importVlansConfig([vlanToImport as any]);

      expect(getTierIdSpy).toHaveBeenCalledWith('Test Tier');
      expect(mockVlanService.createManyVlan).toHaveBeenCalledWith({
        createManyVlanDto: { bulk: [{ ...vlanToImport, vlanNumber: 123, tierId: 'tier-1' }] },
      });
    });
  });

  describe('Undeployed Changes', () => {
    it('should call the UndeployedChangesUtil', () => {
      const utilSpy = jest.spyOn(require('src/app/utils/UndeployedChangesUtil').default, 'hasUndeployedChanges');
      component.checkUndeployedChanges(MOCK_SUBNET);
      expect(utilSpy).toHaveBeenCalledWith(MOCK_SUBNET);
    });
  });

  describe('Lifecycle Hooks', () => {
    it('ngOnDestroy should unsubscribe from all subscriptions', () => {
      const unsubscribeSpy = jest.spyOn(require('src/app/utils/SubscriptionUtil').default, 'unsubscribe');
      component.ngOnDestroy();
      // Check that it's called with an array of potentially 4 subscriptions
      expect(unsubscribeSpy).toHaveBeenCalledWith(expect.any(Array));
    });
  });
});
