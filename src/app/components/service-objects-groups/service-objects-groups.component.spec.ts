/* eslint-disable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ServiceObjectsGroupsComponent } from './service-objects-groups.component';
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
import { ImportExportComponent } from 'src/app/common/import-export/import-export.component';
import { YesNoModalComponent } from 'src/app/common/yes-no-modal/yes-no-modal.component';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { V1NetworkSecurityServiceObjectGroupsService, V1NetworkSecurityServiceObjectsService } from 'client';
import { TierContextService } from 'src/app/services/tier-context.service';
import { FilterPipe } from '../../pipes/filter.pipe';
import { UnusedObjectsModalComponent } from './unused-objects-modal/unused-objects-modal.component';
import { of, Subscription, throwError } from 'rxjs';
import { TableConfig } from 'src/app/common/table/table.component';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { ServiceObjectModalDto } from 'src/app/models/service-objects/service-object-modal-dto';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import { UsedObjectsParentsModalComponent } from 'src/app/common/used-objects-parents-modal/used-objects-parents-modal.component';

describe('ServicesObjectsGroupsComponent', () => {
  let component: ServiceObjectsGroupsComponent;
  let fixture: ComponentFixture<ServiceObjectsGroupsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NgxPaginationModule, FormsModule, ReactiveFormsModule, RouterTestingModule.withRoutes([])],
      declarations: [
        FilterPipe,
        ImportExportComponent,
        MockComponent('app-service-object-group-modal'),
        MockComponent('app-service-object-modal'),
        MockComponent('app-tier-select'),
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
        MockComponent({
          selector: 'app-standard-component',
          inputs: ['unusedObjectsButton', 'tableData', 'tableConfig', 'objectSearchColumns', 'tableItemsPerPage', 'objectType'],
        }),
        MockFontAwesomeComponent,
        MockIconButtonComponent,
        MockNgxSmartModalComponent,
        MockTabsComponent,
        MockTooltipComponent,
        ServiceObjectsGroupsComponent,
        UnusedObjectsModalComponent,
        UsedObjectsParentsModalComponent,
        YesNoModalComponent,
      ],
      providers: [
        MockProvider(DatacenterContextService),
        MockProvider(NgxSmartModalService),
        MockProvider(V1NetworkSecurityServiceObjectGroupsService),
        MockProvider(V1NetworkSecurityServiceObjectsService),
        MockProvider(TierContextService),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceObjectsGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('serviceObjectConfig', () => {
    it('should have the correct table configuration', () => {
      const expectedConfig: TableConfig<any> = {
        description: 'Service Objects consist of source and destination ports',
        columns: [
          { name: 'Name', property: 'name' },
          { name: 'Type', property: 'protocol' },
          { name: 'Source Port', property: 'sourcePorts' },
          { name: 'Destination Port', property: 'destinationPorts' },
          { name: 'State', template: expect.any(Function) },
          { name: '', template: expect.any(Function) },
        ],
      };

      delete component.serviceObjectConfig.advancedSearchAdapter;

      expect(component.serviceObjectConfig).toEqual(expectedConfig);
    });

    it('should have a valid "State" template function', () => {
      const stateColumn = component.serviceObjectConfig.columns.find(c => c.name === 'State');
      expect(stateColumn.template()).toBeDefined();
    });

    it('should have a valid "Actions" template function', () => {
      const actionsColumn = component.serviceObjectConfig.columns.find(c => c.name === '');
      expect(actionsColumn.template()).toBeDefined();
    });
  });

  describe('serviceObjectGroupConfig', () => {
    it('should have the correct table configuration', () => {
      const expectedConfig: TableConfig<any> = {
        description: 'Service Object Groups are a collection of Service Objects',
        columns: [
          { name: 'Name', property: 'name' },
          { name: 'Type', property: 'type' },
          { name: 'Members', template: expect.any(Function) },
          { name: 'State', template: expect.any(Function) },
          { name: '', template: expect.any(Function) },
        ],
        hideAdvancedSearch: true,
      };

      delete component.serviceObjectGroupConfig.advancedSearchAdapter;

      expect(component.serviceObjectGroupConfig).toEqual(expectedConfig);
    });

    it('should have a valid "Members" template function', () => {
      const membersColumn = component.serviceObjectGroupConfig.columns.find(c => c.name === 'Members');
      expect(membersColumn.template).toBeDefined();
    });

    it('should have a valid "State" template function', () => {
      const stateColumn = component.serviceObjectGroupConfig.columns.find(c => c.name === 'State');
      expect(stateColumn.template).toBeDefined();
    });

    it('should have a valid "Actions" template function', () => {
      const actionsColumn = component.serviceObjectGroupConfig.columns.find(c => c.name === '');
      expect(actionsColumn.template()).toBeDefined();
    });
  });

  it('should call getServiceObjects on table event', () => {
    jest.spyOn(component, 'getServiceObjects');
    component.onSvcObjTableEvent({} as any);
    expect(component.getServiceObjects).toHaveBeenCalled();
  });

  it('should call getServiceObjectGroups on table event', () => {
    jest.spyOn(component, 'getServiceObjectGroups');
    component.onSvcObjGrpTableEvent({} as any);
    expect(component.getServiceObjectGroups).toHaveBeenCalled();
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

  describe('getServiceObjects', () => {
    it('should getServiceObjects', () => {
      jest.spyOn(component['serviceObjectService'], 'getManyServiceObject').mockReturnValue(of({} as any));
      component.getServiceObjects({ searchText: 'test', searchColumn: 'name' } as any);
      expect(component['serviceObjectService'].getManyServiceObject).toHaveBeenCalled();
    });

    it('should handle error when getServiceObjects fails', () => {
      jest.spyOn(component['serviceObjectService'], 'getManyServiceObject').mockReturnValue(throwError('Error'));
      component.getServiceObjects({ searchText: 'test', searchColumn: 'name' } as any);

      const errorSubscription = component['serviceObjectService']
        .getManyServiceObject({
          filter: [`tierId||eq||${component.currentTier.id}`],
          page: component.svcObjTableComponentDto.page,
          perPage: component.svcObjTableComponentDto.perPage,
          sort: ['name,ASC'],
        })
        .subscribe(
          () => {},
          () => {
            expect(component.serviceObjects).toEqual([]);
          },
          () => {},
        );

      errorSubscription.unsubscribe();
    });
  });

  describe('getServiceObjectGroups', () => {
    it('should getServiceObjectGroups', () => {
      jest.spyOn(component['serviceObjectGroupService'], 'getManyServiceObjectGroup').mockReturnValue(of({} as any));
      component.getServiceObjectGroups({ searchText: 'test', searchColumn: 'name' } as any);
      expect(component['serviceObjectGroupService'].getManyServiceObjectGroup).toHaveBeenCalled();
    });

    it('should handle error when getServiceObjectGroups fails', () => {
      jest.spyOn(component['serviceObjectGroupService'], 'getManyServiceObjectGroup').mockReturnValue(throwError('Error'));
      component.getServiceObjectGroups({ searchText: 'test', searchColumn: 'name' } as any);

      const errorSubscription = component['serviceObjectGroupService']
        .getManyServiceObjectGroup({
          filter: [`tierId||eq||${component.currentTier.id}`],
          page: component.svcObjGrpTableComponentDto.page,
          perPage: component.svcObjGrpTableComponentDto.perPage,
          sort: ['name,ASC'],
        })
        .subscribe(
          () => {},
          () => {
            expect(component.serviceObjectGroups).toBeNull();
          },
          () => {},
        );

      errorSubscription.unsubscribe();
    });
  });

  describe('openServiceObjectModal', () => {
    it('should throw an error when in edit mode and no service object is provided', () => {
      expect(() => component.openServiceObjectModal(ModalMode.Edit)).toThrow('Service Object required');
    });

    it('should call ngx.setModalData and ngx.getModal().open', () => {
      const serviceObject = { id: 1, name: 'Test Service Object' } as any;
      component.currentTier = { id: '1' } as any;
      component.openServiceObjectModal(ModalMode.Edit, serviceObject);

      expect(component['ngx'].setModalData).toHaveBeenCalledWith(expect.any(ServiceObjectModalDto), 'serviceObjectModal');
      expect(component['ngx'].getModal).toHaveBeenCalledWith('serviceObjectModal');

      const modal = component['ngx'].getModal('serviceObjectModal');
      expect(modal).toBeDefined();
      expect(component['datacenterContextService'].lockDatacenter).toHaveBeenCalled();
    });
  });

  describe('openServiceObjectGroupModal', () => {
    it('should throw an error when in edit mode and no service object group is provided', () => {
      expect(() => component.openServiceObjectGroupModal(ModalMode.Edit)).toThrow('Service Object Group required');
    });

    it('should call ngx.setModalData and ngx.getModal().open', () => {
      const serviceObjectGroup = { id: 1, name: 'Test Service Object' } as any;
      component.currentTier = { id: '1' } as any;
      component.openServiceObjectGroupModal(ModalMode.Edit, serviceObjectGroup);

      expect(component['ngx'].setModalData).toHaveBeenCalled();
      expect(component['ngx'].getModal).toHaveBeenCalledWith('serviceObjectGroupModal');

      const modal = component['ngx'].getModal('serviceObjectGroupModal');
      expect(modal).toBeDefined();
      expect(component['datacenterContextService'].lockDatacenter).toHaveBeenCalled();
    });
  });

  describe('deleteServiceObject', () => {
    it('should delete service object', () => {
      const serviceObject = { id: '1' } as any;
      const deleteOneServiceObjectSpy = jest
        .spyOn(component['serviceObjectService'], 'deleteOneServiceObject')
        .mockResolvedValue({} as never);
      const softDeleteOneServiceObjectSpy = jest
        .spyOn(component['serviceObjectService'], 'softDeleteOneServiceObject')
        .mockResolvedValue({} as never);

      jest.spyOn(component['entityService'], 'deleteEntity').mockImplementationOnce((entity, options) => {
        options.onSuccess();
        return new Subscription();
      });

      const getServiceObjectsSpy = jest.spyOn(component, 'getServiceObjects');

      component.deleteServiceObject(serviceObject);

      expect(component['entityService'].deleteEntity).toHaveBeenCalled();
      expect(deleteOneServiceObjectSpy).toHaveBeenCalledWith({ id: serviceObject.id });
      expect(softDeleteOneServiceObjectSpy).toHaveBeenCalledWith({ id: serviceObject.id });
      expect(getServiceObjectsSpy).toHaveBeenCalled();
    });

    it('should apply search params when filtered results is true', () => {
      const serviceObject = { id: '1' } as any;
      jest.spyOn(component['serviceObjectService'], 'deleteOneServiceObject').mockResolvedValue({} as never);
      jest.spyOn(component['serviceObjectService'], 'softDeleteOneServiceObject').mockResolvedValue({} as never);

      jest.spyOn(component['entityService'], 'deleteEntity').mockImplementationOnce((entity, options) => {
        options.onSuccess();
        return new Subscription();
      });

      const params = { searchString: '', filteredResults: true, searchColumn: 'name', searchText: 'test' };
      jest.spyOn(component['tableContextService'], 'getSearchLocalStorage').mockReturnValue(params);
      const getServiceObjectsSpy = jest.spyOn(component, 'getServiceObjects');

      component.deleteServiceObject(serviceObject);

      expect(component.svcObjTableComponentDto.searchColumn).toBe(params.searchColumn);
      expect(component.svcObjTableComponentDto.searchText).toBe(params.searchText);
      expect(getServiceObjectsSpy).toHaveBeenCalledWith(component.svcObjTableComponentDto);
    });
  });

  describe('Restore Service Object', () => {
    it('should restore service object', () => {
      const serviceObject = { id: '1', deletedAt: true } as any;
      jest.spyOn(component['serviceObjectService'], 'restoreOneServiceObject').mockReturnValue(of({} as any));
      jest.spyOn(component, 'getServiceObjects');
      component.restoreServiceObject(serviceObject);
      expect(component['serviceObjectService'].restoreOneServiceObject).toHaveBeenCalledWith({ id: serviceObject.id });
      expect(component.getServiceObjects).toHaveBeenCalled();
    });

    it('should apply search params when filtered results is true', () => {
      const serviceObject = { id: '1', deletedAt: true } as any;
      jest.spyOn(component['serviceObjectService'], 'restoreOneServiceObject').mockReturnValue(of({} as any));

      const getServiceObjectsSpy = jest.spyOn(component, 'getServiceObjects');
      const params = { searchString: '', filteredResults: true, searchColumn: 'name', searchText: 'test' };
      jest.spyOn(component['tableContextService'], 'getSearchLocalStorage').mockReturnValue(params);

      component.restoreServiceObject(serviceObject);

      expect(component.svcObjTableComponentDto.searchColumn).toBe(params.searchColumn);
      expect(component.svcObjTableComponentDto.searchText).toBe(params.searchText);
      expect(getServiceObjectsSpy).toHaveBeenCalledWith(component.svcObjTableComponentDto);
    });
  });

  describe('Delete Service Object Group', () => {
    it('should delete service object group', () => {
      const serviceObjectGroup = { id: '1' } as any;
      const deleteOneServiceObjectGroupSpy = jest
        .spyOn(component['serviceObjectGroupService'], 'deleteOneServiceObjectGroup')
        .mockResolvedValue({} as never);
      const softDeleteOneServiceGroupObjectSpy = jest
        .spyOn(component['serviceObjectGroupService'], 'softDeleteOneServiceObjectGroup')
        .mockResolvedValue({} as never);

      jest.spyOn(component['entityService'], 'deleteEntity').mockImplementationOnce((entity, options) => {
        options.onSuccess();
        return new Subscription();
      });

      const getServiceObjectGroupsSpy = jest.spyOn(component, 'getServiceObjectGroups');

      component.deleteServiceObjectGroup(serviceObjectGroup);

      expect(component['entityService'].deleteEntity).toHaveBeenCalled();
      expect(deleteOneServiceObjectGroupSpy).toHaveBeenCalledWith({ id: serviceObjectGroup.id });
      expect(softDeleteOneServiceGroupObjectSpy).toHaveBeenCalledWith({ id: serviceObjectGroup.id });
      expect(getServiceObjectGroupsSpy).toHaveBeenCalled();
    });

    it('should apply search params when filtered results is true', () => {
      const serviceObjectGroup = { id: '1' } as any;
      jest.spyOn(component['serviceObjectGroupService'], 'deleteOneServiceObjectGroup').mockResolvedValue({} as never);
      jest.spyOn(component['serviceObjectGroupService'], 'softDeleteOneServiceObjectGroup').mockResolvedValue({} as never);

      jest.spyOn(component['entityService'], 'deleteEntity').mockImplementationOnce((entity, options) => {
        options.onSuccess();
        return new Subscription();
      });

      const params = { searchString: '', filteredResults: true, searchColumn: 'name', searchText: 'test' };
      jest.spyOn(component['tableContextService'], 'getSearchLocalStorage').mockReturnValue(params);

      const getServiceObjectGroupsSpy = jest.spyOn(component, 'getServiceObjectGroups');
      component.deleteServiceObjectGroup(serviceObjectGroup);

      expect(getServiceObjectGroupsSpy).toHaveBeenCalled();
    });
  });

  describe('Restore Service Object Group', () => {
    it('should restore service object group', () => {
      const serviceObjectGroup = { id: '1', deletedAt: true } as any;
      jest.spyOn(component['serviceObjectGroupService'], 'restoreOneServiceObjectGroup').mockReturnValue(of({} as any));
      jest.spyOn(component, 'getServiceObjectGroups');
      component.restoreServiceObjectGroup(serviceObjectGroup);
      expect(component['serviceObjectGroupService'].restoreOneServiceObjectGroup).toHaveBeenCalledWith({
        id: serviceObjectGroup.id,
      });
      expect(component.getServiceObjectGroups).toHaveBeenCalled();
    });
    it('should apply search params when filtered results is true', () => {
      const serviceObjectGroup = { id: '1', deletedAt: true } as any;
      jest.spyOn(component['serviceObjectGroupService'], 'restoreOneServiceObjectGroup').mockReturnValue(of({} as any));

      const getServiceObjectGroupsSpy = jest.spyOn(component, 'getServiceObjectGroups');
      const params = { searchString: '', filteredResults: true, searchColumn: 'name', searchText: 'test' };
      jest.spyOn(component['tableContextService'], 'getSearchLocalStorage').mockReturnValue(params);

      component.restoreServiceObjectGroup(serviceObjectGroup);

      expect(component.svcObjGrpTableComponentDto.searchColumn).toBe(params.searchColumn);
      expect(component.svcObjGrpTableComponentDto.searchText).toBe(params.searchText);
      expect(getServiceObjectGroupsSpy).toHaveBeenCalledWith(component.svcObjGrpTableComponentDto);
    });
  });

  it('should get service object groups when nav index is not 0', () => {
    component.navIndex = 1;
    component.currentTier = { id: '1' } as any;
    jest.spyOn(component, 'getServiceObjectGroups');
    component.getObjectsForNavIndex();
    expect(component.getServiceObjectGroups).toHaveBeenCalled();
  });

  describe('importServiceObjectsConfig', () => {
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
      const event = [{ name: 'Service Object 1' }, { name: 'Service Object 2' }] as any;
      const modalDto = new YesNoModalDto(
        'Import Service Objects',
        `Are you sure you would like to import ${event.length} service objects?`,
      );
      const subscribeToYesNoModalSpy = jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal');

      component.importServiceObjectsConfig(event);

      expect(subscribeToYesNoModalSpy).toHaveBeenCalledWith(modalDto, component['ngx'], expect.any(Function), expect.any(Function));
    });

    it('should import service objects and refresh the table on confirmation', () => {
      const event = [{ name: 'Service Object 1' }, { name: 'Service Object 2' }] as any;
      jest.spyOn(component, 'getServiceObjects');
      jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal').mockImplementation((modalDto, ngx, onConfirm, onClose) => {
        onConfirm();

        expect(component['serviceObjectService'].createManyServiceObject).toHaveBeenCalledWith({
          createManyServiceObjectDto: { bulk: component.sanitizeData(event) },
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

      component.importServiceObjectsConfig(event);

      expect(component.getServiceObjects).toHaveBeenCalled();
    });

    it('should hide the radio buttons when the confirmation modal is closed', () => {
      const event = [{ name: 'Service Object 1' }, { name: 'Service Object 2' }] as any;
      jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal').mockImplementation((modalDto, ngx, onConfirm, onClose) => {
        onClose();

        expect(component.showRadio).toBe(false);

        return new Subscription();
      });

      component.importServiceObjectsConfig(event);
    });
  });

  describe('importServiceObjectGroupRelationsConfig', () => {
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
      const event = [{ name: 'Service Object Group Relation 1' }, { name: 'Service Object Group Relation 2' }] as any;
      const modalDto = new YesNoModalDto(
        'Import Service Object Group Relations',
        `Are you sure you would like to import ${event.length} service object group relation${event.length > 1 ? 's' : ''}?`,
      );
      const subscribeToYesNoModalSpy = jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal');

      component.importServiceObjectGroupRelationsConfig(event);

      expect(subscribeToYesNoModalSpy).toHaveBeenCalledWith(modalDto, component['ngx'], expect.any(Function), expect.any(Function));
    });

    it('should import service object group relations and refresh the table on confirmation', () => {
      const event = [{ name: 'Service Object Group Relation 1' }, { name: 'Service Object Group Relation 2' }] as any;
      jest.spyOn(component, 'getServiceObjectGroups');
      jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal').mockImplementation((modalDto, ngx, onConfirm, onClose) => {
        onConfirm();

        const serviceObjectRelationsDto = {
          datacenterId: component['datacenterContextService'].currentDatacenterValue.id,
          serviceObjectRelations: event,
        };

        expect(component['serviceObjectGroupService'].bulkImportRelationsServiceObjectGroup).toHaveBeenCalledWith({
          serviceObjectGroupRelationBulkImportCollectionDto: serviceObjectRelationsDto,
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

      component.importServiceObjectGroupRelationsConfig(event);

      expect(component.getServiceObjectGroups).toHaveBeenCalled();
    });

    it('should hide the radio buttons when the confirmation modal is closed', () => {
      const event = [{ name: 'Service Object Group Relation 1' }, { name: 'Service Object Group Relation 2' }] as any;
      jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal').mockImplementation((modalDto, ngx, onConfirm, onClose) => {
        onClose();

        expect(component.showRadio).toBe(false);

        return new Subscription();
      });

      component.importServiceObjectGroupRelationsConfig(event);
    });
  });

  describe('importServiceObjectGroupsConfig', () => {
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
      const event = [{ name: 'Service Object Group 1' }, { name: 'Service Object Group 2' }] as any;
      const modalDto = new YesNoModalDto(
        'Import Service Object Groups',
        `Are you sure you would like to import ${event.length} service object group${event.length > 1 ? 's' : ''}?`,
      );
      const subscribeToYesNoModalSpy = jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal');

      component.importServiceObjectGroupsConfig(event);

      expect(subscribeToYesNoModalSpy).toHaveBeenCalledWith(modalDto, component['ngx'], expect.any(Function), expect.any(Function));
    });

    it('should import service object groups and refresh the table on confirmation', () => {
      const event = [{ name: 'Service Object Group 1' }, { name: 'Service Object Group 2' }] as any;
      jest.spyOn(component, 'getServiceObjectGroups');
      jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal').mockImplementation((modalDto, ngx, onConfirm, onClose) => {
        onConfirm();

        expect(component['serviceObjectGroupService'].createManyServiceObjectGroup).toHaveBeenCalledWith({
          createManyServiceObjectGroupDto: { bulk: component.sanitizeData(event) },
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

      component.importServiceObjectGroupsConfig(event);

      expect(component.getServiceObjectGroups).toHaveBeenCalled();
    });

    it('should hide the radio buttons when the confirmation modal is closed', () => {
      const event = [{ name: 'Service Object Group 1' }, { name: 'Service Object Group 2' }] as any;
      jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal').mockImplementation((modalDto, ngx, onConfirm, onClose) => {
        onClose();

        expect(component.showRadio).toBe(false);

        return new Subscription();
      });

      component.importServiceObjectGroupsConfig(event);
    });
  });

  // it('should call mapToCsv for each entity and return the modified entities', () => {
  //   const entities = [
  //     { name: 'Entity 1', someProperty: 'Value 1' },
  //     { name: 'Entity 2', someProperty: 'Value 2' },
  //   ];

  //   spyOn(component, 'mapToCsv').and.callFake(entity => {
  //     entity.sanitized = true;
  //   });

  //   const sanitizedEntities = component.sanitizeData(entities);

  //   expect(component.mapToCsv).toHaveBeenCalledTimes(entities.length);

  //   sanitizedEntities.forEach((entity, index) => {
  //     expect(entity.sanitized).toBe(true);
  //     expect(entity).toEqual({ ...entities[index], sanitized: true });
  //   });
  // });

  describe('mapToCsv', () => {
    it('should delete a property if its value is null or an empty string', () => {
      const obj = {
        prop1: 'value1',
        prop2: null,
        prop3: '',
      };

      const result = component.mapToCsv(obj);

      expect(result).toEqual({ prop1: 'value1' });
    });

    it('should convert the "type" and "protocol" properties to uppercase', () => {
      const obj = {
        type: 'typeValue',
        protocol: 'protocolValue',
        otherProp: 'otherValue',
      };

      const result = component.mapToCsv(obj);

      expect(result).toEqual({
        type: 'TYPEVALUE',
        protocol: 'PROTOCOLVALUE',
        otherProp: 'otherValue',
      });
    });

    it('should update the "vrf_name" property, add "tierId" property, and delete the "vrf_name" property', () => {
      const obj = {
        prop1: 'value1',
        tierName: 'tier1',
      };

      jest.spyOn(ObjectUtil, 'getObjectId').mockReturnValue('tier1Id');

      const result = component.mapToCsv(obj);

      expect(ObjectUtil.getObjectId).toHaveBeenCalledWith('tier1', component.tiers);
      expect(result).toEqual({
        prop1: 'value1',
        tierId: 'tier1Id',
      });
    });

    it('should handle a combination of properties', () => {
      const obj = {
        prop1: '',
        type: 'typeValue',
        tierName: 'tier1',
      };

      jest.spyOn(ObjectUtil, 'getObjectId').mockReturnValue('tier1Id');

      const result = component.mapToCsv(obj);

      expect(ObjectUtil.getObjectId).toHaveBeenCalledWith('tier1', component.tiers);
      expect(result).toEqual({
        type: 'TYPEVALUE',
        tierId: 'tier1Id',
      });
    });
  });
});
