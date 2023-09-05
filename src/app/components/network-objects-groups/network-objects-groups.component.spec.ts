/* tslint:disable:no-string-literal */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NetworkObjectsGroupsComponent } from './network-objects-groups.component';
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
import { NgxPaginationModule } from 'ngx-pagination';
import { MockProvider } from 'src/test/mock-providers';
import { YesNoModalComponent } from 'src/app/common/yes-no-modal/yes-no-modal.component';
import { ImportExportComponent } from 'src/app/common/import-export/import-export.component';
import { ToastrService } from 'ngx-toastr';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { V1NetworkSecurityNetworkObjectGroupsService, V1NetworkSecurityNetworkObjectsService } from 'client';
import { TierContextService } from 'src/app/services/tier-context.service';
import { FilterPipe } from '../../pipes/filter.pipe';
import { UnusedObjectsModalComponent } from './unused-objects-modal/unused-objects-modal.component';
import { of, Subscription, throwError } from 'rxjs';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { NetworkObjectModalDto } from 'src/app/models/network-objects/network-object-modal-dto';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { UsedObjectsParentsModalComponent } from '../../common/used-objects-parents-modal/used-objects-parents-modal.component';

describe('NetworkObjectsGroupsComponent', () => {
  let component: NetworkObjectsGroupsComponent;
  let fixture: ComponentFixture<NetworkObjectsGroupsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NgxPaginationModule, FormsModule, ReactiveFormsModule, RouterTestingModule.withRoutes([])],
      declarations: [
        FilterPipe,
        ImportExportComponent,
        MockComponent('app-network-object-group-modal'),
        MockComponent('app-network-object-modal'),
        MockComponent('app-tier-select'),
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
        MockFontAwesomeComponent,
        MockIconButtonComponent,
        MockNgxSmartModalComponent,
        MockTabsComponent,
        MockTooltipComponent,
        NetworkObjectsGroupsComponent,
        UnusedObjectsModalComponent,
        UsedObjectsParentsModalComponent,
        YesNoModalComponent,
      ],
      providers: [
        MockProvider(DatacenterContextService),
        MockProvider(NgxSmartModalService),
        MockProvider(NgxSmartModalService),
        MockProvider(TierContextService),
        MockProvider(ToastrService),
        MockProvider(V1NetworkSecurityNetworkObjectGroupsService),
        MockProvider(V1NetworkSecurityNetworkObjectsService),
      ],
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NetworkObjectsGroupsComponent);
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
    spyOn(component, 'getNetworkObjects');
    component.onNetObjTableEvent({} as any);
    expect(component.getNetworkObjects).toHaveBeenCalled();
  });

  it('should call getNetworkObjectGroups on table event', () => {
    spyOn(component, 'getNetworkObjectGroups');
    component.onNetObjGrpTableEvent({} as any);
    expect(component.getNetworkObjectGroups).toHaveBeenCalled();
  });

  describe('handleTabChange', () => {
    it('should handle tab change when tab different', () => {
      spyOn(component['tableContextService'], 'removeSearchLocalStorage');
      spyOn(component, 'getObjectsForNavIndex');
      component.navIndex = 0;
      component.tabs = [{ name: 'tab1' }, { name: 'tab2' }];
      component.handleTabChange({ name: 'tab2' });
      expect(component['tableContextService'].removeSearchLocalStorage).toHaveBeenCalled();
      expect(component.getObjectsForNavIndex).toHaveBeenCalled();
      expect(component.navIndex).toEqual(1);
    });

    it('should not handle tab change when tab same', () => {
      spyOn(component['tableContextService'], 'removeSearchLocalStorage');
      spyOn(component, 'getObjectsForNavIndex');
      component.navIndex = 0;
      component.tabs = [{ name: 'tab1' }, { name: 'tab2' }];
      component.handleTabChange({ name: 'tab1' });
      expect(component['tableContextService'].removeSearchLocalStorage).not.toHaveBeenCalled();
      expect(component.getObjectsForNavIndex).not.toHaveBeenCalled();
      expect(component.navIndex).toEqual(0);
    });
  });

  describe('getNetworkObjects', () => {
    it('should getNetworkObjects', () => {
      jest.spyOn(component['networkObjectService'], 'getManyNetworkObject').mockReturnValue(of({} as any));
      component.getNetworkObjects({ searchText: 'test', searchColumn: 'name' } as any);
      expect(component['networkObjectService'].getManyNetworkObject).toHaveBeenCalled();
    });

    it('should handle error when getNetworkObjects fails', () => {
      jest.spyOn(component['networkObjectService'], 'getManyNetworkObject').mockReturnValue(throwError('Error'));
      component.getNetworkObjects({ searchText: 'test', searchColumn: 'name' } as any);

      const errorSubscription = component['networkObjectService']
        .getManyNetworkObject({
          filter: [`tierId||eq||${component.currentTier.id}`],
          page: component.netObjTableComponentDto.page,
          limit: component.netObjTableComponentDto.perPage,
          sort: ['name,ASC'],
        })
        .subscribe(
          () => {},
          () => {
            expect(component.networkObjects).toBeNull();
          },
          () => {},
        );

      errorSubscription.unsubscribe();
    });
  });

  describe('getNetworkObjectGroups', () => {
    it('should getNetworkObjectGroups', () => {
      jest.spyOn(component['networkObjectGroupService'], 'getManyNetworkObjectGroup').mockReturnValue(of({} as any));
      component.getNetworkObjectGroups({ searchText: 'test', searchColumn: 'name' } as any);
      expect(component['networkObjectGroupService'].getManyNetworkObjectGroup).toHaveBeenCalled();
    });

    it('should handle error when getNetworkObjectGroups fails', () => {
      jest.spyOn(component['networkObjectGroupService'], 'getManyNetworkObjectGroup').mockReturnValue(throwError('Error'));
      component.getNetworkObjectGroups({ searchText: 'test', searchColumn: 'name' } as any);

      const errorSubscription = component['networkObjectGroupService']
        .getManyNetworkObjectGroup({
          filter: [`tierId||eq||${component.currentTier.id}`],
          page: component.netObjGrpTableComponentDto.page,
          limit: component.netObjGrpTableComponentDto.perPage,
          sort: ['name,ASC'],
        })
        .subscribe(
          () => {},
          () => {
            expect(component.networkObjectGroups).toBeNull();
          },
          () => {},
        );

      errorSubscription.unsubscribe();
    });
  });

  describe('openNetworkObjectModal', () => {
    it('should throw an error when in edit mode and no network object is provided', () => {
      expect(() => component.openNetworkObjectModal(ModalMode.Edit)).toThrow('Network Object required');
    });

    it('should call ngx.setModalData and ngx.getModal().open', () => {
      const networkObject = { id: 1, name: 'Test Network Object' } as any;
      component.currentTier = { id: '1' } as any;
      component.openNetworkObjectModal(ModalMode.Edit, networkObject);

      expect(component['ngx'].setModalData).toHaveBeenCalledWith(expect.any(NetworkObjectModalDto), 'networkObjectModal');
      expect(component['ngx'].getModal).toHaveBeenCalledWith('networkObjectModal');

      const modal = component['ngx'].getModal('networkObjectModal');
      expect(modal).toBeDefined();
      expect(component['datacenterContextService'].lockDatacenter).toHaveBeenCalled();
    });
  });

  describe('openNetworkObjectGroupModal', () => {
    it('should throw an error when in edit mode and no network object group is provided', () => {
      expect(() => component.openNetworkObjectGroupModal(ModalMode.Edit)).toThrow('Network Object Group required');
    });

    it('should call ngx.setModalData and ngx.getModal().open', () => {
      const networkObjectGroup = { id: 1, name: 'Test Network Object' } as any;
      component.currentTier = { id: '1' } as any;
      component.openNetworkObjectGroupModal(ModalMode.Edit, networkObjectGroup);

      expect(component['ngx'].setModalData).toHaveBeenCalled();
      expect(component['ngx'].getModal).toHaveBeenCalledWith('networkObjectGroupModal');

      const modal = component['ngx'].getModal('networkObjectGroupModal');
      expect(modal).toBeDefined();
      expect(component['datacenterContextService'].lockDatacenter).toHaveBeenCalled();
    });
  });

  describe('deleteNetworkObject', () => {
    it('should delete network object', () => {
      const networkObject = { id: '1' } as any;
      const deleteOneNetworkObjectSpy = jest
        .spyOn(component['networkObjectService'], 'deleteOneNetworkObject')
        .mockResolvedValue({} as never);
      const softDeleteOneNetworkObjectSpy = jest
        .spyOn(component['networkObjectService'], 'softDeleteOneNetworkObject')
        .mockResolvedValue({} as never);

      jest.spyOn(component['entityService'], 'deleteEntity').mockImplementationOnce((entity, options) => {
        options.onSuccess();
        return new Subscription();
      });

      const getNetworkObjectsSpy = jest.spyOn(component, 'getNetworkObjects');

      component.deleteNetworkObject(networkObject);

      expect(component['entityService'].deleteEntity).toHaveBeenCalled();
      expect(deleteOneNetworkObjectSpy).toHaveBeenCalledWith({ id: networkObject.id });
      expect(softDeleteOneNetworkObjectSpy).toHaveBeenCalledWith({ id: networkObject.id });
      expect(getNetworkObjectsSpy).toHaveBeenCalled();
    });

    it('should apply search params when filtered results is true', () => {
      const networkObject = { id: '1' } as any;
      jest.spyOn(component['networkObjectService'], 'deleteOneNetworkObject').mockResolvedValue({} as never);
      jest.spyOn(component['networkObjectService'], 'softDeleteOneNetworkObject').mockResolvedValue({} as never);

      jest.spyOn(component['entityService'], 'deleteEntity').mockImplementationOnce((entity, options) => {
        options.onSuccess();
        return new Subscription();
      });

      const params = { filteredResults: true, searchColumn: 'name', searchText: 'test' };
      jest.spyOn(component['tableContextService'], 'getSearchLocalStorage').mockReturnValue(params);
      const getNetworkObjectsSpy = jest.spyOn(component, 'getNetworkObjects');

      component.deleteNetworkObject(networkObject);

      expect(component.netObjTableComponentDto.searchColumn).toBe(params.searchColumn);
      expect(component.netObjTableComponentDto.searchText).toBe(params.searchText);
      expect(getNetworkObjectsSpy).toHaveBeenCalledWith(component.netObjTableComponentDto);
    });
  });

  describe('Restore Network Object', () => {
    it('should restore network object', () => {
      const networkObject = { id: '1', deletedAt: true } as any;
      spyOn(component['networkObjectService'], 'restoreOneNetworkObject').and.returnValue(of({} as any));
      spyOn(component, 'getNetworkObjects');
      component.restoreNetworkObject(networkObject);
      expect(component['networkObjectService'].restoreOneNetworkObject).toHaveBeenCalledWith({ id: networkObject.id });
      expect(component.getNetworkObjects).toHaveBeenCalled();
    });

    it('should apply search params when filtered results is true', () => {
      const networkObject = { id: '1', deletedAt: true } as any;
      spyOn(component['networkObjectService'], 'restoreOneNetworkObject').and.returnValue(of({} as any));

      const getNetworkObjectsSpy = jest.spyOn(component, 'getNetworkObjects');
      const params = { filteredResults: true, searchColumn: 'name', searchText: 'test' };
      jest.spyOn(component['tableContextService'], 'getSearchLocalStorage').mockReturnValue(params);

      component.restoreNetworkObject(networkObject);

      expect(component.netObjTableComponentDto.searchColumn).toBe(params.searchColumn);
      expect(component.netObjTableComponentDto.searchText).toBe(params.searchText);
      expect(getNetworkObjectsSpy).toHaveBeenCalledWith(component.netObjTableComponentDto);
    });
  });

  describe('Delete Network Object Group', () => {
    it('should delete network object group', () => {
      const networkObjectGroup = { id: '1' } as any;
      const deleteOneNetworkObjectGroupSpy = jest
        .spyOn(component['networkObjectGroupService'], 'deleteOneNetworkObjectGroup')
        .mockResolvedValue({} as never);
      const softDeleteOneServiceGroupObjectSpy = jest
        .spyOn(component['networkObjectGroupService'], 'softDeleteOneNetworkObjectGroup')
        .mockResolvedValue({} as never);

      jest.spyOn(component['entityService'], 'deleteEntity').mockImplementationOnce((entity, options) => {
        options.onSuccess();
        return new Subscription();
      });

      const getNetworkObjectGroupsSpy = jest.spyOn(component, 'getNetworkObjectGroups');

      component.deleteNetworkObjectGroup(networkObjectGroup);

      expect(component['entityService'].deleteEntity).toHaveBeenCalled();
      expect(deleteOneNetworkObjectGroupSpy).toHaveBeenCalledWith({ id: networkObjectGroup.id });
      expect(softDeleteOneServiceGroupObjectSpy).toHaveBeenCalledWith({ id: networkObjectGroup.id });
      expect(getNetworkObjectGroupsSpy).toHaveBeenCalled();
    });

    it('should apply search params when filtered results is true', () => {
      const networkObjectGroup = { id: '1' } as any;
      jest.spyOn(component['networkObjectGroupService'], 'deleteOneNetworkObjectGroup').mockResolvedValue({} as never);
      jest.spyOn(component['networkObjectGroupService'], 'softDeleteOneNetworkObjectGroup').mockResolvedValue({} as never);

      jest.spyOn(component['entityService'], 'deleteEntity').mockImplementationOnce((entity, options) => {
        options.onSuccess();
        return new Subscription();
      });

      const params = { filteredResults: true, searchColumn: 'name', searchText: 'test' };
      jest.spyOn(component['tableContextService'], 'getSearchLocalStorage').mockReturnValue(params);

      const getNetworkObjectGroupsSpy = jest.spyOn(component, 'getNetworkObjectGroups');
      component.deleteNetworkObjectGroup(networkObjectGroup);

      expect(getNetworkObjectGroupsSpy).toHaveBeenCalled();
    });
  });

  describe('Restore Network Object Group', () => {
    it('should restore network object group', () => {
      const networkObjectGroup = { id: '1', deletedAt: true } as any;
      spyOn(component['networkObjectGroupService'], 'restoreOneNetworkObjectGroup').and.returnValue(of({} as any));
      spyOn(component, 'getNetworkObjectGroups');
      component.restoreNetworkObjectGroup(networkObjectGroup);
      expect(component['networkObjectGroupService'].restoreOneNetworkObjectGroup).toHaveBeenCalledWith({
        id: networkObjectGroup.id,
      });
      expect(component.getNetworkObjectGroups).toHaveBeenCalled();
    });

    it('should apply search params when filtered results is true', () => {
      const networkObjectGroup = { id: '1', deletedAt: true } as any;
      spyOn(component['networkObjectGroupService'], 'restoreOneNetworkObjectGroup').and.returnValue(of({} as any));

      const getNetworkObjectGroupsSpy = jest.spyOn(component, 'getNetworkObjectGroups');
      const params = { filteredResults: true, searchColumn: 'name', searchText: 'test' };
      jest.spyOn(component['tableContextService'], 'getSearchLocalStorage').mockReturnValue(params);

      component.restoreNetworkObjectGroup(networkObjectGroup);

      expect(component.netObjGrpTableComponentDto.searchColumn).toBe(params.searchColumn);
      expect(component.netObjGrpTableComponentDto.searchText).toBe(params.searchText);
      expect(getNetworkObjectGroupsSpy).toHaveBeenCalledWith(component.netObjGrpTableComponentDto);
    });
  });

  it('should get network object groups when nav index is not 0', () => {
    component.navIndex = 1;
    component.currentTier = { id: '1' } as any;
    spyOn(component, 'getNetworkObjectGroups');
    component.getObjectsForNavIndex();
    expect(component.getNetworkObjectGroups).toHaveBeenCalled();
  });

  describe('importNetworkObjectsConfig', () => {
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

    it('should display a confirmation modal with the correct message', () => {
      const event = [{ name: 'Network Object 1' }, { name: 'Network Object 2' }] as any;
      const modalDto = new YesNoModalDto(
        'Import Network Objects',
        `Are you sure you would like to import ${event.length} network objects?`,
      );
      const subscribeToYesNoModalSpy = jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal');

      component.importNetworkObjectsConfig(event);

      expect(subscribeToYesNoModalSpy).toHaveBeenCalledWith(modalDto, component['ngx'], expect.any(Function), expect.any(Function));
    });

    it('should import network objects and refresh the table on confirmation', () => {
      const event = [{ name: 'Network Object 1' }, { name: 'Network Object 2' }] as any;
      spyOn(component, 'getNetworkObjects');
      jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal').mockImplementation((modalDto, ngx, onConfirm, onClose) => {
        onConfirm();

        expect(component['networkObjectService'].createManyNetworkObject).toHaveBeenCalledWith({
          createManyNetworkObjectDto: { bulk: component.sanitizeData(event) },
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

      component.importNetworkObjectsConfig(event);

      expect(component.getNetworkObjects).toHaveBeenCalled();
    });

    it('should hide the radio buttons when the confirmation modal is closed', () => {
      const event = [{ name: 'Network Object 1' }, { name: 'Network Object 2' }] as any;
      jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal').mockImplementation((modalDto, ngx, onConfirm, onClose) => {
        onClose();

        expect(component.showRadio).toBe(false);

        return new Subscription();
      });

      component.importNetworkObjectsConfig(event);
    });
  });

  describe('importNetworkObjectGroupRelationsConfig', () => {
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

    it('should display a confirmation modal with the correct message', () => {
      const event = [{ name: 'Network Object Group Relation 1' }, { name: 'Network Object Group Relation 2' }] as any;
      const modalDto = new YesNoModalDto(
        'Import Network Object Group Relations',
        `Are you sure you would like to import ${event.length} network object group relation${event.length > 1 ? 's' : ''}?`,
      );
      const subscribeToYesNoModalSpy = jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal');

      component.importNetworkObjectGroupRelationsConfig(event);

      expect(subscribeToYesNoModalSpy).toHaveBeenCalledWith(modalDto, component['ngx'], expect.any(Function), expect.any(Function));
    });

    // it('should import network object group relations and refresh the table on confirmation', () => {
    //   const event = [{ name: 'Network Object Group Relation 1' }, { name: 'Network Object Group Relation 2' }] as any;
    //   spyOn(component, 'getNetworkObjectGroups');
    //   jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal').mockImplementation((modalDto, ngx, onConfirm, onClose) => {
    //     onConfirm();

    //     const networkObjectRelationsDto = {
    //       datacenterId: component['datacenterContextService'].currentDatacenterValue.id,
    //       networkObjectRelations: event,
    //     };

    //     expect(component['networkObjectGroupService'].bulkImportRelationsNetworkObjectGroupNetworkObject).toHaveBeenCalledWith({
    //       networkObjectGroupRelationBulkImportCollectionDto: networkObjectRelationsDto,
    //     });

    //     mockNgxSmartModalComponent.onCloseFinished.subscribe((modal: typeof mockNgxSmartModalComponent) => {
    //       const data = modal.getData() as YesNoModalDto;
    //       modal.removeData();
    //       if (data && data.modalYes) {
    //         onConfirm();
    //       }
    //     });

    //     return new Subscription();
    //   });

    //   component.importNetworkObjectGroupRelationsConfig(event);

    //   expect(component.getNetworkObjectGroups).toHaveBeenCalled();
    // });

    it('should hide the radio buttons when the confirmation modal is closed', () => {
      const event = [{ name: 'Network Object Group Relation 1' }, { name: 'Network Object Group Relation 2' }] as any;
      jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal').mockImplementation((modalDto, ngx, onConfirm, onClose) => {
        onClose();

        expect(component.showRadio).toBe(false);

        return new Subscription();
      });

      component.importNetworkObjectGroupRelationsConfig(event);
    });
  });
});
