import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MockFontAwesomeComponent,
  MockTooltipComponent,
  MockIconButtonComponent,
  MockTabsComponent,
  MockComponent,
  MockNgxSmartModalComponent,
} from 'src/test/mock-components';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { SubnetsVlansComponent } from './subnets-vlans.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { ResolvePipe } from 'src/app/pipes/resolve.pipe';
import { MockProvider } from 'src/test/mock-providers';
import { ImportExportComponent } from 'src/app/common/import-export/import-export.component';
import { YesNoModalComponent } from 'src/app/common/yes-no-modal/yes-no-modal.component';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { TierContextService } from 'src/app/services/tier-context.service';
import { SubnetsVlansHelpText } from 'src/app/helptext/help-text-networking';
import { V1TiersService, V1NetworkVlansService, V1NetworkSubnetsService } from 'client';
import { of, Subscription, throwError } from 'rxjs';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { VlanModalDto } from 'src/app/models/network/vlan-modal-dto';
import { SubnetModalDto } from 'src/app/models/network/subnet-modal-dto';

describe('SubnetsVlansComponent', () => {
  let component: SubnetsVlansComponent;
  let fixture: ComponentFixture<SubnetsVlansComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NgxPaginationModule, FormsModule, ReactiveFormsModule, RouterTestingModule.withRoutes([])],
      declarations: [
        ImportExportComponent,
        MockComponent('app-subnet-modal'),
        MockComponent('app-tier-select'),
        MockComponent('app-vlan-modal'),
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
        MockFontAwesomeComponent,
        MockIconButtonComponent,
        MockNgxSmartModalComponent,
        MockTabsComponent,
        MockTooltipComponent,
        ResolvePipe,
        SubnetsVlansComponent,
        YesNoModalComponent,
      ],
      providers: [
        MockProvider(DatacenterContextService),
        MockProvider(NgxSmartModalService),
        MockProvider(SubnetsVlansHelpText),
        MockProvider(TierContextService),
        MockProvider(V1NetworkSubnetsService),
        MockProvider(V1NetworkVlansService),
        MockProvider(V1TiersService),
      ],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubnetsVlansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getNetworkObjects on table event', () => {
    jest.spyOn(component, 'getVlans');
    component.onVlanTableEvent({} as any);
    expect(component.getVlans).toHaveBeenCalled();
  });

  it('should call getNetworkObjectGroups on table event', () => {
    jest.spyOn(component, 'getSubnets');
    component.onSubnetTableEvent({} as any);
    expect(component.getSubnets).toHaveBeenCalled();
  });

  describe('handleTabChange', () => {
    it('should handle tab change when tab different', () => {
      jest.spyOn(component['tableContextService'], 'removeSearchLocalStorage');
      jest.spyOn(component, 'getObjectsForNavIndex');
      component.navIndex = 0;
      component.tabs = [{ name: 'tab1' }, { name: 'tab2' }];
      component.handleTabChange({ name: 'tab2' });
      expect(component['tableContextService'].removeSearchLocalStorage).toHaveBeenCalled();
      expect(component.getObjectsForNavIndex).toHaveBeenCalled();
      expect(component.navIndex).toEqual(1);
    });

    it('should not handle tab change when tab same', () => {
      jest.spyOn(component['tableContextService'], 'removeSearchLocalStorage');
      jest.spyOn(component, 'getObjectsForNavIndex');
      component.navIndex = 0;
      component.tabs = [{ name: 'tab1' }, { name: 'tab2' }];
      component.handleTabChange({ name: 'tab1' });
      expect(component['tableContextService'].removeSearchLocalStorage).not.toHaveBeenCalled();
      expect(component.getObjectsForNavIndex).not.toHaveBeenCalled();
      expect(component.navIndex).toEqual(0);
    });
  });

  describe('getVlans', () => {
    it('should getVlans', () => {
      jest.spyOn(component['vlanService'], 'getManyVlan').mockReturnValue(of({} as any));
      component.getVlans({ searchText: 'test', searchColumn: 'name' } as any);
      expect(component['vlanService'].getManyVlan).toHaveBeenCalled();
    });

    it('should handle error when getVlans fails', () => {
      jest.spyOn(component['vlanService'], 'getManyVlan').mockReturnValue(throwError('Error'));
      component.getVlans({ searchText: 'test', searchColumn: 'name' } as any);

      const errorSubscription = component['vlanService']
        .getManyVlan({
          filter: [`tierId||eq||${component.currentTier.id}`],
          page: component.vlanTableComponentDto.page,
          perPage: component.vlanTableComponentDto.perPage,
          sort: ['updatedAt,DESC'],
        })
        .subscribe(
          () => {},
          () => {
            expect(component.vlans).toEqual([]);
          },
          () => {},
        );

      errorSubscription.unsubscribe();
    });
  });

  describe('getSubnets', () => {
    it('should getSubnets', () => {
      jest.spyOn(component['subnetService'], 'getManySubnet').mockReturnValue(of({} as any));
      component.getSubnets({ searchText: 'test', searchColumn: 'name' } as any);
      expect(component['subnetService'].getManySubnet).toHaveBeenCalled();
    });

    it('should handle error when getSubnets fails', () => {
      jest.spyOn(component['subnetService'], 'getManySubnet').mockReturnValue(throwError('Error'));
      component.getSubnets({ searchText: 'test', searchColumn: 'name' } as any);

      const errorSubscription = component['subnetService']
        .getManySubnet({
          join: ['vlan'],
          filter: [`tierId||eq||${component.currentTier.id}`],
          page: component.subnetTableComponentDto.page,
          perPage: component.subnetTableComponentDto.perPage,
          sort: ['updatedAt,DESC'],
        })
        .subscribe(
          () => {},
          () => {
            expect(component.subnets).toEqual([]);
          },
          () => {},
        );

      errorSubscription.unsubscribe();
    });
  });

  it('should delete subnet', () => {
    const subnetToDelete = { id: '123', description: 'Bye!', vlanId: 'vlanId-123' } as any;
    const subscribeToYesNoModalSpy = jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal');
    component.deleteSubnet(subnetToDelete);
    const getSubnetsMock = jest.spyOn(component['subnetService'], 'getManySubnet');
    expect(subscribeToYesNoModalSpy).toHaveBeenCalled();
    expect(getSubnetsMock).toHaveBeenCalled();
  });

  it('should restore subnet', () => {
    const subnetToRestore = { id: '123', description: 'Bye!', vlanId: 'vlanId-123', deletedAt: true } as any;
    jest.spyOn(component['subnetService'], 'restoreOneSubnet').mockReturnValue(of({} as any));
    jest.spyOn(component, 'getSubnets');
    component.restoreSubnet(subnetToRestore);
    expect(component['subnetService'].restoreOneSubnet).toHaveBeenCalledWith({ id: subnetToRestore.id });
    expect(component.getSubnets).toHaveBeenCalled();
  });

  it('should delete vlan', () => {
    const service = TestBed.inject(V1NetworkVlansService);
    const vlanToDelete = { id: '123', description: 'Bye!' } as any;
    const subscribeToYesNoModalSpy = jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal');
    component.deleteVlan(vlanToDelete);
    const getVlansMock = jest.spyOn(service, 'getManyVlan');
    expect(subscribeToYesNoModalSpy).toHaveBeenCalled();
    // expect(getVlansMock).toHaveBeenCalled();
  });

  it('should restore vlan', () => {
    const vlanToRestore = { id: '123', description: 'Bye!', deletedAt: true } as any;
    jest.spyOn(component['vlanService'], 'restoreOneVlan').mockReturnValue(of({} as any));
    const getVlansMock = jest.spyOn(component['vlanService'], 'getManyVlan');
    component.restoreVlan(vlanToRestore);
    expect(component['vlanService'].restoreOneVlan).toHaveBeenCalledWith({ id: vlanToRestore.id });
    expect(getVlansMock).toHaveBeenCalled();
  });

  it('should routely search params when filtered results is true', () => {
    const vlan = { id: '1', deletedAt: true } as any;
    jest.spyOn(component['vlanService'], 'restoreOneVlan').mockReturnValue(of({} as any));

    const getVlansSpy = jest.spyOn(component, 'getVlans');
    const params = { searchString: '', filteredResults: true, searchColumn: 'name', searchText: 'test' };
    jest.spyOn(component['tableContextService'], 'getSearchLocalStorage').mockReturnValue(params);

    component.restoreVlan(vlan);

    expect(component.vlanTableComponentDto.searchColumn).toBe(params.searchColumn);
    expect(component.vlanTableComponentDto.searchText).toBe(params.searchText);
    expect(getVlansSpy).toHaveBeenCalled();
  });

  it('should routely search params when filtered results is true', () => {
    const subnet = { id: '1', deletedAt: true } as any;
    jest.spyOn(component['subnetService'], 'restoreOneSubnet').mockReturnValue(of({} as any));

    const getSubnetsSpy = jest.spyOn(component, 'getSubnets');
    const params = { searchString: '', filteredResults: true, searchColumn: 'name', searchText: 'test' };
    jest.spyOn(component['tableContextService'], 'getSearchLocalStorage').mockReturnValue(params);

    component.restoreSubnet(subnet);

    expect(component.subnetTableComponentDto.searchColumn).toBe(params.searchColumn);
    expect(component.subnetTableComponentDto.searchText).toBe(params.searchText);
    expect(getSubnetsSpy).toHaveBeenCalled();
  });

  it('should get subnets when nav index is not 0', () => {
    component.navIndex = 1;
    component.currentTier = { id: '1' } as any;
    jest.spyOn(component, 'getVlans');
    component.getObjectsForNavIndex();
    expect(component.getVlans).toHaveBeenCalled();
  });

  describe('openVlanModal', () => {
    it('should throw an error when in edit mode and no vlan is provided', () => {
      expect(() => component.openVlanModal(ModalMode.Edit)).toThrow('VLAN required');
    });

    it('should call ngx.setModalData and ngx.getModal().open', () => {
      const vlan = { id: 1, name: 'Test Vlan' } as any;
      component.currentTier = { id: '1' } as any;
      component.openVlanModal(ModalMode.Edit, vlan);

      expect(component['ngx'].setModalData).toHaveBeenCalledWith(expect.any(VlanModalDto), 'vlanModal');
      expect(component['ngx'].getModal).toHaveBeenCalledWith('vlanModal');

      const modal = component['ngx'].getModal('vlanModal');
      expect(modal).toBeDefined();
    });
  });

  describe('openSubnetModal', () => {
    it('should throw an error when in edit mode and no subnet is provided', () => {
      expect(() => component.openSubnetModal(ModalMode.Edit)).toThrow('Subnet required');
    });

    it('should call ngx.setModalData and ngx.getModal().open', () => {
      const subnet = { id: 1, name: 'Test Subnet' } as any;
      component.currentTier = { id: '1' } as any;
      component.openSubnetModal(ModalMode.Edit, subnet);

      expect(component['ngx'].setModalData).toHaveBeenCalledWith(expect.any(SubnetModalDto), 'subnetModal');
      expect(component['ngx'].getModal).toHaveBeenCalledWith('subnetModal');

      const modal = component['ngx'].getModal('subnetModal');
      expect(modal).toBeDefined();
    });
  });

  describe('importVlansConfig', () => {
    const mockNgxSmartModalComponent = {
      getData: jest.fn().mockReturnValue({ modalYes: true }),
      removeData: jest.fn(),
      onCloseFinished: {
        subscribe: jest.fn(),
      },
    };

    beforeEach(() => {
      component['ngx'] = {
        getModal: jest.fn().mockReturnValue({
          ...mockNgxSmartModalComponent,
          open: jest.fn(),
        }),
        setModalData: jest.fn(),
      } as any;
    });

    it('should import vlans and refresh the table on confirmation', () => {
      const event = [{ name: 'Vlan 1' }, { name: 'Vlan 2' }] as any;
      jest.spyOn(component, 'getVlans');
      jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal').mockImplementation((modalDto, ngx, onConfirm, onClose) => {
        onConfirm();

        expect(component['vlanService'].createManyVlan).toHaveBeenCalledWith({
          createManyVlanDto: { bulk: event },
        });

        mockNgxSmartModalComponent.onCloseFinished.subscribe((modal: typeof mockNgxSmartModalComponent) => {
          const data = modal.getData() as YesNoModalDto;
          modal.removeData();
          if (data && data.modalYes) {
            onConfirm();
          }
        });

        return new Subscription();
      });

      component.importVlansConfig(event);

      expect(component.getVlans).toHaveBeenCalled();
    });

    it('should import subnets and refresh the table on confirmation', () => {
      const event = [{ name: 'Subnet 1' }, { name: 'Subnet 2' }] as any;
      jest.spyOn(component, 'getSubnets');
      jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal').mockImplementation((modalDto, ngx, onConfirm, onClose) => {
        onConfirm();

        expect(component['subnetService'].bulkImportSubnetsSubnet).toHaveBeenCalledWith({
          subnetImportCollectionDto: { datacenterId: '1', subnets: event },
        });

        mockNgxSmartModalComponent.onCloseFinished.subscribe((modal: typeof mockNgxSmartModalComponent) => {
          const data = modal.getData() as YesNoModalDto;
          modal.removeData();
          if (data && data.modalYes) {
            onConfirm();
          }
        });

        return new Subscription();
      });

      component.importSubnetConfig(event);

      expect(component.getSubnets).toHaveBeenCalled();
    });
  });
});
