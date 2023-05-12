/* tslint:disable:no-string-literal */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FirewallRulesDetailComponent } from './firewall-rules-detail.component';
import {
  MockFontAwesomeComponent,
  MockTooltipComponent,
  MockIconButtonComponent,
  MockComponent,
  MockNgxSmartModalComponent,
} from 'src/test/mock-components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { NgxPaginationModule } from 'ngx-pagination';
import { ResolvePipe } from 'src/app/pipes/resolve.pipe';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { MockProvider } from 'src/test/mock-providers';
import { ImportExportComponent } from 'src/app/common/import-export/import-export.component';
import { YesNoModalComponent } from 'src/app/common/yes-no-modal/yes-no-modal.component';
import { PreviewModalComponent } from 'src/app/common/preview-modal/preview-modal.component';
import {
  V1NetworkSecurityFirewallRulesService,
  V1NetworkSecurityFirewallRuleGroupsService,
  V1TiersService,
  V1NetworkSecurityNetworkObjectsService,
  V1NetworkSecurityNetworkObjectGroupsService,
  V1NetworkSecurityServiceObjectsService,
  V1NetworkSecurityServiceObjectGroupsService,
} from 'client';
import { HttpClientModule } from '@angular/common/http';
import { of, Subject, Subscription, throwError } from 'rxjs';
import { ModalMode } from 'src/app/models/other/modal-mode';

describe('FirewallRulesDetailComponent', () => {
  let component: FirewallRulesDetailComponent;
  let fixture: ComponentFixture<FirewallRulesDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, NgxPaginationModule, ReactiveFormsModule, RouterTestingModule, HttpClientModule],
      declarations: [
        FirewallRulesDetailComponent,
        ImportExportComponent,
        MockComponent('app-firewall-rule-modal'),
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
        MockFontAwesomeComponent,
        MockIconButtonComponent,
        MockNgxSmartModalComponent,
        MockTooltipComponent,
        PreviewModalComponent,
        ResolvePipe,
        YesNoModalComponent,
      ],
      providers: [
        // MockProvider(DatacenterContextService),
        MockProvider(NgxSmartModalService),
        // MockProvider(V1NetworkSecurityFirewallRuleGroupsService),
        // MockProvider(V1NetworkSecurityFirewallRulesService),
        // MockProvider(V1NetworkSecurityNetworkObjectGroupsService),
        // MockProvider(V1NetworkSecurityNetworkObjectsService),
        // MockProvider(V1NetworkSecurityServiceObjectGroupsService),
        // MockProvider(V1NetworkSecurityServiceObjectsService),
        // MockProvider(V1TiersService),
      ],
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FirewallRulesDetailComponent);
    component = fixture.componentInstance;
    component.FirewallRuleGroup = { id: '1' } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getFirewallRuleGroup when refresh', () => {
    spyOn(component, 'getFirewallRuleGroup');
    component.refresh();
    expect(component.getFirewallRuleGroup).toHaveBeenCalled();
  });

  it('should call getFirewallRules on table event', () => {
    spyOn(component, 'getFirewallRules');
    component.onTableEvent({} as any);
    expect(component.getFirewallRules).toHaveBeenCalled();
  });

  it('should getOneFirewallRuleGroup', () => {
    component.Id = 'test';
    spyOn(component['firewallRuleGroupService'], 'getOneFirewallRuleGroup').and.returnValue(of({ name: 'test', type: 'test', id: 'test' }));
    spyOn(component, 'getObjects');
    spyOn(component, 'getFirewallRuleLastIndex');
    component.getFirewallRuleGroup();
    expect(component['firewallRuleGroupService'].getOneFirewallRuleGroup).toHaveBeenCalled();
    expect(component.getObjects).toHaveBeenCalled();
    expect(component.getFirewallRuleLastIndex).toHaveBeenCalled();
  });

  describe('getFirewallRules', () => {
    it('should getManyFirewallRules with event', () => {
      component.FirewallRuleGroup = { id: 'test' } as any;
      spyOn(component['firewallRuleService'], 'getManyFirewallRule').and.returnValue(of({}));
      component.getFirewallRules({ searchText: 'test', searchColumn: 'name' } as any);
      expect(component['firewallRuleService'].getManyFirewallRule).toHaveBeenCalled();
    });

    it('should getManyFirewallRules without event', () => {
      component.FirewallRuleGroup = { id: 'test' } as any;
      component.perPage = 10;
      spyOn(component['firewallRuleService'], 'getManyFirewallRule').and.returnValue(of({}));
      component.getFirewallRules();
      expect(component['firewallRuleService'].getManyFirewallRule).toHaveBeenCalled();
    });

    it('should handle error when getManyFirewallRules fails', () => {
      component.FirewallRuleGroup = { id: 'test' } as any;
      jest.spyOn(component['firewallRuleService'], 'getManyFirewallRule').mockReturnValue(throwError('Error') as any);
      component.getFirewallRules();

      const errorSubscription = component['firewallRuleService']
        .getManyFirewallRule({
          filter: ['', ''],
          page: 1,
          limit: 1,
          sort: ['ruleIndex,ASC'],
        })
        .subscribe(
          () => {},
          () => {
            expect(component.firewallRules).toBeNull();
          },
          () => {},
        );

      errorSubscription.unsubscribe();
    });
  });

  it('should set latestRuleIndex when getFirewallRuleLastIndex', () => {
    component.FirewallRuleGroup = { id: 'test' } as any;
    spyOn(component['firewallRuleService'], 'getManyFirewallRule').and.returnValue(of({ data: [{ ruleIndex: 1 }] }));
    component.getFirewallRuleLastIndex();
    expect(component.latestRuleIndex).toEqual(1);
    expect(component['firewallRuleService'].getManyFirewallRule).toHaveBeenCalled();
  });

  it('should get objects and set properties when getObjects is called', () => {
    const testTierId = 'testTierId';
    component.TierId = testTierId;

    const tierResponse = { name: 'Test Tier' };
    const networkObjectResponse = { data: ['networkObject1', 'networkObject2'] };
    const networkObjectGroupResponse = { data: ['networkObjectGroup1', 'networkObjectGroup2'] };
    const serviceObjectResponse = { data: ['serviceObject1', 'serviceObject2'] };
    const serviceObjectGroupResponse = { data: ['serviceObjectGroup1', 'serviceObjectGroup2'] };

    spyOn(component['tierService'], 'getOneTier').and.returnValue(of(tierResponse));
    spyOn(component['networkObjectService'], 'getManyNetworkObject').and.returnValue(of(networkObjectResponse));
    spyOn(component['networkObjectGroupService'], 'getManyNetworkObjectGroup').and.returnValue(of(networkObjectGroupResponse));
    spyOn(component['serviceObjectService'], 'getManyServiceObject').and.returnValue(of(serviceObjectResponse));
    spyOn(component['serviceObjectGroupService'], 'getManyServiceObjectGroup').and.returnValue(of(serviceObjectGroupResponse));

    spyOn(component, 'getFirewallRules');

    component.getObjects();

    expect(component.TierName).toEqual(tierResponse.name);
    expect(component.networkObjects).toEqual(networkObjectResponse.data);
    expect(component.networkObjectGroups).toEqual(networkObjectGroupResponse.data);
    expect(component.serviceObjects).toEqual(serviceObjectResponse.data);
    expect(component.serviceObjectGroups).toEqual(serviceObjectGroupResponse.data);

    expect(component.getFirewallRules).toHaveBeenCalled();
  });

  it('should openFirewallRuleModal when createFirewallRule', () => {
    spyOn(component, 'openFirewallRuleModal');
    component.createFirewallRule();
    expect(component.openFirewallRuleModal).toHaveBeenCalled();
  });

  describe('openFirewallRuleModal', () => {
    it('should open firewall rule modal with correct data in Create mode', () => {
      component.Id = 'testGroupId';
      component.TierId = 'testTierId';
      component.latestRuleIndex = 1;
      const modalMode = ModalMode.Create;
      spyOn(component['ngx'], 'setModalData');
      const onCloseFinished = new Subject<void>();
      spyOn(component['ngx'], 'getModal').and.returnValue({ open: jest.fn(), onCloseFinished });

      component.openFirewallRuleModal(modalMode);

      const expectedDto = {
        FirewallRuleGroupId: 'testGroupId',
        TierId: 'testTierId',
        ModalMode: modalMode,
        NetworkObjects: component.networkObjects,
        NetworkObjectGroups: component.networkObjectGroups,
        ServiceObjects: component.serviceObjects,
        ServiceObjectGroups: component.serviceObjectGroups,
        FirewallRule: { ruleIndex: component.latestRuleIndex + 1 },
      };

      expect(component['ngx'].setModalData).toHaveBeenCalledWith(expectedDto, 'firewallRuleModal');
      expect(component['ngx'].getModal).toHaveBeenCalledWith('firewallRuleModal');
      expect(component['ngx'].getModal('firewallRuleModal').open).toHaveBeenCalled();
    });

    it('should open firewall rule modal with correct data in Edit mode', () => {
      component.Id = 'testGroupId';
      component.TierId = 'testTierId';
      const modalMode = ModalMode.Edit;
      const firewallRule = { id: 'testFirewallRuleId', ruleIndex: 2 } as any;
      spyOn(component['ngx'], 'setModalData');
      const onCloseFinished = new Subject<void>();
      spyOn(component['ngx'], 'getModal').and.returnValue({ open: jest.fn(), onCloseFinished });

      component.openFirewallRuleModal(modalMode, firewallRule);

      const expectedDto = {
        FirewallRuleGroupId: 'testGroupId',
        TierId: 'testTierId',
        ModalMode: modalMode,
        NetworkObjects: component.networkObjects,
        NetworkObjectGroups: component.networkObjectGroups,
        ServiceObjects: component.serviceObjects,
        ServiceObjectGroups: component.serviceObjectGroups,
        FirewallRule: firewallRule,
      };

      expect(component['ngx'].setModalData).toHaveBeenCalledWith(expectedDto, 'firewallRuleModal');
      expect(component['ngx'].getModal).toHaveBeenCalledWith('firewallRuleModal');
      expect(component['ngx'].getModal('firewallRuleModal').open).toHaveBeenCalled();
    });

    it('should throw an error if Edit mode is called without a firewall rule', () => {
      const modalMode = ModalMode.Edit;
      expect(() => component.openFirewallRuleModal(modalMode)).toThrowError('Firewall Rule Required');
    });
  });

  describe('deleteFirewallRule', () => {
    it('should call deleteOneFirewallRule with event params', () => {
      const firewallRule = { id: 'testId' } as any;
      component.FirewallRuleGroup = { id: 'test' } as any;
      const deleteOneFirewallRuleSpy = jest.spyOn(component['firewallRuleService'], 'deleteOneFirewallRule').mockResolvedValue({} as never);
      const softDeleteOneFirewallRuleSpy = jest
        .spyOn(component['firewallRuleService'], 'softDeleteOneFirewallRule')
        .mockResolvedValue({} as never);

      jest.spyOn(component['entityService'], 'deleteEntity').mockImplementationOnce((entity, options) => {
        options.onSuccess();
        return new Subscription();
      });

      const params = { filteredResults: true, searchColumn: 'name', searchText: 'test' };
      jest.spyOn(component['tableContextService'], 'getSearchLocalStorage').mockReturnValue(params);
      const getFirewallRulesSpy = jest.spyOn(component, 'getFirewallRules');

      component.deleteFirewallRule(firewallRule);

      expect(component.tableComponentDto.searchColumn).toBe(params.searchColumn);
      expect(component.tableComponentDto.searchText).toBe(params.searchText);
      expect(getFirewallRulesSpy).toHaveBeenCalledWith(component.tableComponentDto);
    });

    it('should call deleteOneFirewallRule without event params', () => {
      const firewallRule = { id: 'testId' } as any;
      component.FirewallRuleGroup = { id: 'test' } as any;
      const deleteOneFirewallRuleSpy = jest.spyOn(component['firewallRuleService'], 'deleteOneFirewallRule').mockResolvedValue({} as never);
      const softDeleteOneFirewallRuleSpy = jest
        .spyOn(component['firewallRuleService'], 'softDeleteOneFirewallRule')
        .mockResolvedValue({} as never);

      jest.spyOn(component['entityService'], 'deleteEntity').mockImplementationOnce((entity, options) => {
        options.onSuccess();
        return new Subscription();
      });

      const getFirewallRulesSpy = jest.spyOn(component, 'getFirewallRules');
      component.deleteFirewallRule(firewallRule);

      expect(component['entityService'].deleteEntity).toHaveBeenCalled();
      expect(deleteOneFirewallRuleSpy).toHaveBeenCalledWith({ id: firewallRule.id });
      expect(softDeleteOneFirewallRuleSpy).toHaveBeenCalledWith({ id: firewallRule.id });
      expect(getFirewallRulesSpy).toHaveBeenCalled();
    });
  });

  describe('Restore Firewall Rule', () => {
    it('should restore firewall rule', () => {
      const firewallRule = { id: '1', deletedAt: true } as any;
      spyOn(component['firewallRuleService'], 'restoreOneFirewallRule').and.returnValue(of({} as any));
      spyOn(component, 'getFirewallRules');
      component.restoreFirewallRule(firewallRule);
      expect(component['firewallRuleService'].restoreOneFirewallRule).toHaveBeenCalledWith({ id: firewallRule.id });
      expect(component.getFirewallRules).toHaveBeenCalled();
    });

    it('should apply search params when filtered results is true', () => {
      // TODO: Error: connect ECONNREFUSED 127.0.0.1:80 from this test for some reason
      const firewallRule = { id: '1', deletedAt: true } as any;
      spyOn(component['firewallRuleService'], 'restoreOneFirewallRule').and.returnValue(of({} as any));

      const getFirewallRulesSpy = jest.spyOn(component, 'getFirewallRules');
      const params = {
        filteredResults: true,
        searchColumn: 'name',
        searchText: 'test',
      };
      jest.spyOn(component['tableContextService'], 'getSearchLocalStorage').mockReturnValue(params);

      component.restoreFirewallRule(firewallRule);

      expect(component.tableComponentDto.searchColumn).toBe(params.searchColumn);
      expect(component.tableComponentDto.searchText).toBe(params.searchText);
      expect(getFirewallRulesSpy).toHaveBeenCalledWith(component.tableComponentDto);
    });
  });

  describe('Import Firewall Rules Config', () => {
    it('should call bulkImportFirewallRulesFirewallRule and create preview', () => {
      component.FirewallRuleGroup = { id: '1' } as any;
      const event = [{}] as any;

      const sanitizedData = [{}];

      const datacenterValue = { id: '1' } as any;

      jest.spyOn(component['datacenterService'], 'currentDatacenterValue', 'get').mockReturnValue(datacenterValue);
      spyOn(component, 'sanitizeData').and.returnValue(sanitizedData);
      spyOn(component, 'createPreview');
      spyOn(component['firewallRuleService'], 'getManyFirewallRule');

      const bulkImportSpy = jest
        .spyOn(component['firewallRuleService'], 'bulkImportFirewallRulesFirewallRule')
        .mockReturnValue(of({ data: {} } as any));

      component.importFirewallRulesConfig(event);

      expect(component.sanitizeData).toHaveBeenCalledWith(event);
      expect(bulkImportSpy).toHaveBeenCalled();
      expect(component.createPreview).toHaveBeenCalled();
    });
  });

  it('should sanitize and map the input data', () => {
    const inputEntities = [
      { ruleIndex: '1', someBooleanProperty: 't', anotherBooleanProperty: 'F', emptyProperty: '', nullProperty: null },
      { ruleIndex: '2', someBooleanProperty: 'TRUE', anotherBooleanProperty: 'false', emptyProperty: '', nullProperty: null },
    ] as any;

    const mappedEntities = [
      { ruleIndex: 1, someBooleanProperty: true, anotherBooleanProperty: false },
      { ruleIndex: 2, someBooleanProperty: true, anotherBooleanProperty: false },
    ];

    const mapCsvSpy = spyOn(component, 'mapCsv').and.callFake(entity => {
      Object.entries(entity).forEach(([key, val]) => {
        if (val === 'FALSE' || val === 'false' || val === 'f' || val === 'F') {
          entity[key] = false;
        }
        if (val === 'TRUE' || val === 'true' || val === 't' || val === 'T') {
          entity[key] = true;
        }
        if (val === null || val === '') {
          delete entity[key];
        }
      });
      return entity;
    });

    const sanitizedData = component.sanitizeData(inputEntities);

    expect(sanitizedData).toEqual(mappedEntities);
    expect(mapCsvSpy).toHaveBeenCalledTimes(inputEntities.length);
    inputEntities.forEach((entity, index) => {
      expect(mapCsvSpy.calls.argsFor(index)[0]).toBe(sanitizedData[index]);
    });
  });

  describe('mapCsv', () => {
    it('should map the input entity correctly', () => {
      const inputEntity = {
        ruleIndex: '1',
        someBooleanProperty: 't',
        anotherBooleanProperty: 'F',
        emptyProperty: '',
        nullProperty: null,
      } as any;

      const expectedMappedEntity = {
        ruleIndex: '1',
        someBooleanProperty: true,
        anotherBooleanProperty: false,
      } as any;

      const mappedEntity = component.mapCsv(inputEntity);

      expect(mappedEntity).toEqual(expectedMappedEntity);
    });

    it('should handle multiple boolean representations correctly', () => {
      const inputEntities = [
        { someBooleanProperty: 't', anotherBooleanProperty: 'F' },
        { someBooleanProperty: 'T', anotherBooleanProperty: 'f' },
        { someBooleanProperty: 'true', anotherBooleanProperty: 'FALSE' },
        { someBooleanProperty: 'TRUE', anotherBooleanProperty: 'false' },
      ] as any;

      const expectedMappedEntities = [
        { someBooleanProperty: true, anotherBooleanProperty: false },
        { someBooleanProperty: true, anotherBooleanProperty: false },
        { someBooleanProperty: true, anotherBooleanProperty: false },
        { someBooleanProperty: true, anotherBooleanProperty: false },
      ] as any;

      inputEntities.forEach((inputEntity, index) => {
        const mappedEntity = component.mapCsv(inputEntity);
        expect(mappedEntity).toEqual(expectedMappedEntities[index]);
      });
    });
  });

  describe('createPreview', () => {
    let previewModalOpenSpy: jest.SpyInstance;
    let previewModalCloseFinishedSpy: jest.SpyInstance;
    let fakePreviewModal: any;

    beforeEach(() => {
      fakePreviewModal = {
        open: jest.fn(),
        onCloseFinished: {
          subscribe: jest.fn(),
        },
      };

      jest.spyOn(component['ngx'], 'setModalData');
      jest.spyOn(component['ngx'], 'getModal').mockReturnValue(fakePreviewModal);
      jest.spyOn(component['datacenterService'], 'currentDatacenterValue', 'get').mockReturnValue({ id: '1' } as any);

      previewModalOpenSpy = jest.spyOn(fakePreviewModal, 'open');
      previewModalCloseFinishedSpy = jest.spyOn(fakePreviewModal.onCloseFinished, 'subscribe');
    });

    it('should open the preview modal with correct data and handle the onCloseFinished event', () => {
      const data = {
        firewallRulesToBeUploaded: [],
        firewallRulesToBeDeleted: [],
      } as any;

      const firewallRules = [] as any;

      component.createPreview(data, firewallRules);

      expect(component['ngx'].setModalData).toHaveBeenCalled();
      expect(component['ngx'].getModal).toHaveBeenCalledWith('previewModal');
      expect(previewModalOpenSpy).toHaveBeenCalled();
      expect(previewModalCloseFinishedSpy).toHaveBeenCalled();
    });

    it('should execute bulk import and refresh the data when the modal is confirmed', done => {
      const data = {
        firewallRulesToBeUploaded: [],
        firewallRulesToBeDeleted: [],
      } as any;

      const firewallRules = [] as any;

      const previewModalDto = {
        confirm: true,
      } as any;

      const fakeModal = {
        getData: () => previewModalDto,
        removeData: jest.fn(),
      };

      const bulkImportSpy = jest
        .spyOn(component['firewallRuleService'], 'bulkImportFirewallRulesFirewallRule')
        .mockReturnValue(of({} as any));
      jest.spyOn(component, 'getFirewallRuleGroup');

      const subscribeCallback = modal => {
        const modalData = modal.getData();
        modal.removeData();
        if (modalData && modalData.confirm) {
          const firewallConfirmDto = {
            datacenterId: component['datacenterService'].currentDatacenterValue.id,
            firewallRules: component.sanitizeData(firewallRules),
            dryRun: false,
          };

          component['firewallRuleService']
            .bulkImportFirewallRulesFirewallRule({
              firewallRuleImportCollectionDto: firewallConfirmDto,
            })
            .subscribe(() => {});
        }
      };

      fakePreviewModal.onCloseFinished.subscribe = jest.fn((callback: (modal: any) => void) => {
        subscribeCallback(fakeModal);
      });

      component.createPreview(data, firewallRules);

      expect(fakeModal.removeData).toHaveBeenCalled();
      expect(bulkImportSpy).toHaveBeenCalled();
      done();
    });
  });
});
