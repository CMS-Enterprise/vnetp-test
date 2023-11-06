/* tslint:disable:no-string-literal */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NatRulesDetailComponent } from './nat-rules-detail.component';
import {
  MockComponent,
  MockFontAwesomeComponent,
  MockIconButtonComponent,
  MockImportExportComponent,
  MockNgxSmartModalComponent,
  MockYesNoModalComponent,
} from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { of, Subject, Subscription } from 'rxjs';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { NatRule, NatRuleImport, NatRulePreview } from 'client';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import { ApplicationPipesModule } from 'src/app/pipes/application-pipes.module';
import { YesNoModalComponent } from 'src/app/common/yes-no-modal/yes-no-modal.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('NatRulesDetailComponent', () => {
  let component: NatRulesDetailComponent;
  let fixture: ComponentFixture<NatRulesDetailComponent>;
  const mockDatacenterService = {
    currentDatacenter: jest.fn().mockReturnValue(of({ tiers: {} })),
    lockDatacenter: jest.fn(),
    currentTiersValue: 'id',
    currentDatacenterValue: { id: 'id' },
  };
  const mockActivatedRoute = {
    snapshot: {
      paramsMap: {
        get: 'id',
      },
    },
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        NatRulesDetailComponent,
        MockIconButtonComponent,
        MockFontAwesomeComponent,
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
        MockComponent('app-nat-rule-modal'),
        MockComponent('app-preview-modal'),
        MockNgxSmartModalComponent,
        MockImportExportComponent,
        MockYesNoModalComponent,
      ],
      imports: [ApplicationPipesModule, RouterTestingModule.withRoutes([]), HttpClientTestingModule],
      providers: [
        MockProvider(NgxSmartModalService),
        { provide: 'DatacenterService', useValue: mockDatacenterService },
        { provide: 'ActivatedRoute', useValue: mockActivatedRoute },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NatRulesDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get natRuleGroup on refresh', () => {
    spyOn(component, 'getNatRuleGroup');
    component.refresh();
    expect(component.getNatRuleGroup).toHaveBeenCalled();
  });

  it('should get natRules on table event', () => {
    spyOn(component, 'getNatRules');
    component.onTableEvent({ page: 1, perPage: 10 } as any);
    expect(component.getNatRules).toHaveBeenCalled();
  });

  it('should get nat rule group', () => {
    component.Id = 'id';
    jest
      .spyOn(component['natRuleGroupService'], 'getOneNatRuleGroup')
      .mockReturnValue(of({ data: { name: 'name', type: 'type', id: 'id', tierId: 'tierId' } } as any));
    spyOn(component, 'getObjects');
    spyOn(component, 'getNatRuleLastIndex');

    component.getNatRuleGroup();
    expect(component['natRuleGroupService'].getOneNatRuleGroup).toHaveBeenCalled();
    expect(component.getObjects).toHaveBeenCalled();
    expect(component.getNatRuleLastIndex).toHaveBeenCalled();
  });

  describe('getNatRules', () => {
    it('should get nat rules with no table event', () => {
      component.perPage = 5;
      component.NatRuleGroup = { id: 'id' } as any;
      jest.spyOn(component['natRuleService'], 'getManyNatRule').mockReturnValue(of({} as any));
      component.getNatRules();
      expect(component['natRuleService'].getManyNatRule).toHaveBeenCalled();
    });

    it('should get nat rules with table event', () => {
      const event = { page: 1, perPage: 10, searchColumn: 'name', searchText: 'name' } as any;
      component.NatRuleGroup = { id: 'id' } as any;
      jest.spyOn(component['natRuleService'], 'getManyNatRule').mockReturnValue(of({} as any));
      component.getNatRules(event);
      expect(component['natRuleService'].getManyNatRule).toHaveBeenCalled();
    });
  });

  it('should set latest rule index', () => {
    component.NatRuleGroup = { id: 'id' } as any;
    jest.spyOn(component['natRuleService'], 'getManyNatRule').mockReturnValue(of({ data: [{ ruleIndex: 1 }] } as any));
    component.getNatRuleLastIndex();
    expect(component.latestRuleIndex).toEqual(1);
    expect(component['natRuleService'].getManyNatRule).toHaveBeenCalled();
  });

  it('should get objects and set properties when getObjects is called', () => {
    const testTierId = 'testTierId';
    component.TierId = testTierId;

    const tierResponse = { name: 'Test Tier' };
    const networkObjectResponse = { data: ['networkObject1', 'networkObject2'] };
    const networkObjectGroupResponse = { data: ['networkObjectGroup1', 'networkObjectGroup2'] };
    const serviceObjectResponse = { data: ['serviceObject1', 'serviceObject2'] };

    spyOn(component['tierService'], 'getOneTier').and.returnValue(of(tierResponse));
    spyOn(component['networkObjectService'], 'getManyNetworkObject').and.returnValue(of(networkObjectResponse));
    spyOn(component['networkObjectGroupService'], 'getManyNetworkObjectGroup').and.returnValue(of(networkObjectGroupResponse));
    spyOn(component['serviceObjectService'], 'getManyServiceObject').and.returnValue(of(serviceObjectResponse));

    spyOn(component, 'getNatRules');

    component.getObjects();

    expect(component.TierName).toEqual(tierResponse.name);
    expect(component.networkObjects).toEqual(networkObjectResponse.data);
    expect(component.networkObjectGroups).toEqual(networkObjectGroupResponse.data);
    expect(component.serviceObjects).toEqual(serviceObjectResponse.data);

    expect(component.getNatRules).toHaveBeenCalled();
  });

  it('should open nat rule modal in create mode', () => {
    spyOn(component, 'openNatRuleModal');
    component.createNatRule();
    expect(component.openNatRuleModal).toHaveBeenCalledWith(ModalMode.Create);
  });

  describe('openNatRuleModal', () => {
    beforeEach(() => {
      component.TierId = 'testTierId';
      component.Id = 'testGroupId';
      component.networkObjectGroups = [];
      component.networkObjects = [];
      component.serviceObjects = [];
      component.latestRuleIndex = 1;
      spyOn(component, 'subscribeToNatRuleModal');
      spyOn(component['ngx'], 'setModalData');
      const onCloseFinished = new Subject<void>();
      spyOn(component['ngx'], 'getModal').and.returnValue({ open: jest.fn(), onCloseFinished });
    });

    it('should throw an error if Edit mode is called without a nat rule', () => {
      const modalMode = ModalMode.Edit;
      expect(() => component.openNatRuleModal(modalMode)).toThrowError('Nat Rule Required');
    });

    it('should open Nat Rule modal with correct data in Create mode', () => {
      const mm = ModalMode.Create;

      component.openNatRuleModal(mm);

      const expectedDto = {
        tierId: component.TierId,
        natRuleGroupId: component.Id,
        modalMode: mm,
        NetworkObjectGroups: component.networkObjectGroups,
        NetworkObjects: component.networkObjects,
        ServiceObjects: component.serviceObjects,
        natRule: { ruleIndex: component.latestRuleIndex + 1 },
      };

      expect(component['ngx'].setModalData).toHaveBeenCalledWith(expectedDto, 'natRuleModal');
      expect(component['ngx'].getModal).toHaveBeenCalledWith('natRuleModal');
      expect(component['ngx'].getModal('natRuleModal').open).toHaveBeenCalled();
    });

    it('should open Nat Rule modal with correct data in Edit mode', () => {
      const mm = ModalMode.Edit;
      const nr: NatRule = { id: 'testNatRuleId', ruleIndex: 2 } as any;

      component.openNatRuleModal(mm, nr);

      const expectedDto = {
        tierId: component.TierId,
        natRuleGroupId: component.Id,
        modalMode: mm,
        NetworkObjectGroups: component.networkObjectGroups,
        NetworkObjects: component.networkObjects,
        ServiceObjects: component.serviceObjects,
        natRule: nr,
      };

      expect(component['ngx'].setModalData).toHaveBeenCalledWith(expectedDto, 'natRuleModal');
      expect(component['ngx'].getModal).toHaveBeenCalledWith('natRuleModal');
      expect(component['ngx'].getModal('natRuleModal').open).toHaveBeenCalled();
    });
  });

  describe('subscribeToNatRuleModal', () => {
    beforeEach(() => {
      spyOn(component, 'getNatRuleGroup');
      spyOn(component['ngx'], 'resetModalData');
    });

    it('should subscribe to natRuleModal onCloseFinished event', () => {
      const onCloseFinished = new Subject<void>();
      const mockModal = { onCloseFinished, open: jest.fn() };
      spyOn(component['ngx'], 'getModal').and.returnValue(mockModal);

      component.subscribeToNatRuleModal();

      expect(component['ngx'].getModal).toHaveBeenCalledWith('natRuleModal');
      expect(component.natRuleModalSubscription).toBeDefined();

      onCloseFinished.next();

      expect(component.getNatRuleGroup).toHaveBeenCalled();
      expect(component['ngx'].resetModalData).toHaveBeenCalledWith('natRuleModal');
    });
  });

  it('should get the service object name for a given id', () => {
    const serviceObjectId = 'testServiceObjectId';
    const serviceName = 'testServiceName';
    component.serviceObjects = [{ id: serviceObjectId, name: serviceName } as any];

    spyOn(ObjectUtil, 'getObjectName').and.callThrough();

    const result = component.getServiceObjectName(serviceObjectId);

    expect(ObjectUtil.getObjectName).toHaveBeenCalledWith(serviceObjectId, component.serviceObjects);
    expect(result).toEqual(serviceName);
  });

  it('should get the network object name for a given id', () => {
    const networkObjectId = 'testNetworkObjectId';
    const networkObjectName = 'testNetworkObjectName';
    component.networkObjects = [{ id: networkObjectId, name: networkObjectName } as any];

    spyOn(ObjectUtil, 'getObjectName').and.callThrough();

    const result = component.getNetworkObjectName(networkObjectId);

    expect(ObjectUtil.getObjectName).toHaveBeenCalledWith(networkObjectId, component.networkObjects);
    expect(result).toEqual(networkObjectName);
  });

  it('should get the network object group name for a given id', () => {
    const networkObjectGroupId = 'testNetworkObjectGroupId';
    const networkObjectGroupName = 'testNetworkObjectGroupName';
    component.networkObjectGroups = [{ id: networkObjectGroupId, name: networkObjectGroupName } as any];

    spyOn(ObjectUtil, 'getObjectName').and.callThrough();

    const result = component.getNetworkObjectGroupName(networkObjectGroupId);

    expect(ObjectUtil.getObjectName).toHaveBeenCalledWith(networkObjectGroupId, component.networkObjectGroups);
    expect(result).toEqual(networkObjectGroupName);
  });

  describe('deleteNatRule', () => {
    it('should delete a NatRule and update the nat rules list with search parameters', () => {
      component.NatRuleGroup = { id: 'testNatRuleGroupId' } as any;
      const natRule: NatRule = { id: 'testNatRuleId' } as any;
      const deleteOneNatRuleSpy = jest.spyOn(component['natRuleService'], 'deleteOneNatRule').mockResolvedValue({} as never);
      const softDeleteOneNatRuleSpy = jest.spyOn(component['natRuleService'], 'softDeleteOneNatRule').mockResolvedValue({} as never);

      jest.spyOn(component['entityService'], 'deleteEntity').mockImplementationOnce((entity, options) => {
        options.onSuccess();
        return new Subscription();
      });

      const getNatRuleSpy = jest.spyOn(component, 'getNatRules');

      component.deleteNatRule(natRule);

      expect(component['entityService'].deleteEntity).toHaveBeenCalled();
      expect(deleteOneNatRuleSpy).toHaveBeenCalledWith({ id: natRule.id });
      expect(softDeleteOneNatRuleSpy).toHaveBeenCalledWith({ id: natRule.id });
      expect(getNatRuleSpy).toHaveBeenCalled();
    });

    it('should delete a NatRule and update the nat rules list without search parameters', () => {
      component.NatRuleGroup = { id: 'testNatRuleGroupId' } as any;
      const natRule = { id: '1' } as any;
      jest.spyOn(component['natRuleService'], 'deleteOneNatRule').mockResolvedValue({} as never);
      jest.spyOn(component['natRuleService'], 'softDeleteOneNatRule').mockResolvedValue({} as never);

      jest.spyOn(component['entityService'], 'deleteEntity').mockImplementationOnce((entity, options) => {
        options.onSuccess();
        return new Subscription();
      });

      const params = { searchString: '', filteredResults: true, searchColumn: 'name', searchText: 'test' };
      jest.spyOn(component['tableContextService'], 'getSearchLocalStorage').mockReturnValue(params);
      const getNatRuleSpy = jest.spyOn(component, 'getNatRules');

      component.deleteNatRule(natRule);

      expect(component.tableComponentDto.searchColumn).toBe(params.searchColumn);
      expect(component.tableComponentDto.searchText).toBe(params.searchText);
      expect(getNatRuleSpy).toHaveBeenCalledWith(component.tableComponentDto);
    });
  });

  describe('restoreNatRule', () => {
    it('should restore without filtered results', () => {
      component.NatRuleGroup = { id: 'testNatRuleGroupId' } as any;
      const natRule = { id: '1', deletedAt: true } as any;
      spyOn(component['natRuleService'], 'restoreOneNatRule').and.returnValue(of({} as any));
      spyOn(component, 'getNatRules');
      component.restoreNatRule(natRule);
      expect(component['natRuleService'].restoreOneNatRule).toHaveBeenCalledWith({ id: natRule.id });
      expect(component.getNatRules).toHaveBeenCalled();
    });

    it('should restore with filtered results', () => {
      component.NatRuleGroup = { id: 'testNatRuleGroupId' } as any;
      const natRule = { id: '1', deletedAt: true } as any;
      spyOn(component['natRuleService'], 'restoreOneNatRule').and.returnValue(of({} as any));

      const getNatRulesSpy = jest.spyOn(component, 'getNatRules');
      const params = { searchString: '', filteredResults: true, searchColumn: 'name', searchText: 'test' };
      jest.spyOn(component['tableContextService'], 'getSearchLocalStorage').mockReturnValue(params);

      component.restoreNatRule(natRule);

      expect(component.tableComponentDto.searchColumn).toBe(params.searchColumn);
      expect(component.tableComponentDto.searchText).toBe(params.searchText);
      expect(getNatRulesSpy).toHaveBeenCalledWith(component.tableComponentDto);
    });
  });

  describe('importNatRulesConfig', () => {
    it('should import NAT rules, sanitize data, map CSV values, and create a preview', () => {
      const natRuleImports: NatRuleImport[] = [{ ruleIndex: '5' } as any]; // Define initial data.
      const sanitizedNatRuleImports: NatRuleImport[] = [{ ruleIndex: 5 } as any]; // Define expected sanitized data.
      const natRulePreview: NatRulePreview = { natRulesToBeUploaded: [] } as any; // Define response data.

      const importResponse = of(natRulePreview) as any;
      const getNatRuleGroupResponse = of({}) as any; // Define response for getNatRuleGroup.

      jest.spyOn(component['datacenterService'], 'currentDatacenterValue', 'get').mockReturnValue({ id: 'testDatacenterId' } as any);
      jest.spyOn(component['natRuleService'], 'bulkImportNatRulesNatRule').mockReturnValue(importResponse);
      jest.spyOn(component, 'getNatRuleGroup').mockReturnValue(getNatRuleGroupResponse);
      jest.spyOn(component['ngx'], 'setModalData');
      jest.spyOn(component['ngx'], 'getModal').mockReturnValue({
        open: jest.fn(),
        onCloseFinished: { subscribe: jest.fn() },
      } as any);

      component.importNatRulesConfig(natRuleImports);

      expect(component['natRuleService'].bulkImportNatRulesNatRule).toHaveBeenCalledWith({
        natRuleImportCollectionDto: {
          dryRun: true,
          datacenterId: component['datacenterService'].currentDatacenterValue.id,
          natRules: sanitizedNatRuleImports,
        },
      });

      expect(component['ngx'].setModalData).toHaveBeenCalled();
      expect(component['ngx'].getModal).toHaveBeenCalledWith('previewModal');
    });
  });
});
