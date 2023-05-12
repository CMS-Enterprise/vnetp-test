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
import { SharedModule } from 'src/app/common/shared.module';
import { MockProvider } from 'src/test/mock-providers';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { of } from 'rxjs';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { NatRuleModalDto } from 'src/app/models/nat/nat-rule-modal-dto';

describe('NatRulesDetailComponent', () => {
  let component: NatRulesDetailComponent;
  let fixture: ComponentFixture<NatRulesDetailComponent>;
  const mockDatacenterService = {
    currentDatacenter: jest.fn().mockReturnValue(of({ tiers: {} })),
    lockDatacenter: jest.fn(),
    currentTiersValue: 'id',
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
      ],
      imports: [SharedModule, RouterTestingModule, HttpClientModule],
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
    it('should throw an error if modalMode is Edit and natRule is undefined', () => {
      expect(() => component.openNatRuleModal(ModalMode.Edit)).toThrow(new Error('Nat Rule Required'));
    });

    // it('should set dto and open modal with new Nat Rule if modalMode is Create', () => {
    //   const modalMode = ModalMode.Create;
    //   spyOn(component, 'subscribeToNatRuleModal');
    //   spyOn(component['ngx'], 'setModalData');
    //   spyOn(component['ngx'], 'getModal').and.returnValue({ open: () => {} });

    //   component.latestRuleIndex = 0;
    //   component.networkObjectGroups = ['networkObjectGroup1'] as any;
    //   component.networkObjects = ['networkObject1'] as any;
    //   component.serviceObjects = ['serviceObject1'] as any;
    //   component.Id = 'natRuleGroupId';
    //   component.TierId = 'tierId';

    //   component.openNatRuleModal(modalMode);

    //   const expectedDto = new NatRuleModalDto();
    //   expectedDto.tierId = component.TierId;
    //   expectedDto.natRuleGroupId = component.Id;
    //   expectedDto.modalMode = modalMode;
    //   expectedDto.NetworkObjectGroups = component.networkObjectGroups;
    //   expectedDto.NetworkObjects = component.networkObjects;
    //   expectedDto.ServiceObjects = component.serviceObjects;
    //   expectedDto.natRule = {} as any;
    //   expectedDto.natRule.ruleIndex = component.latestRuleIndex + 1;

    //   expect(component.subscribeToNatRuleModal).toHaveBeenCalled();
    //   expect(component['ngx'].setModalData).toHaveBeenCalledWith(expectedDto, 'natRuleModal');
    //   expect(component['ngx'].getModal('natRuleModal').open).toHaveBeenCalled();
    // });

    // it('should set dto and open modal with existing Nat Rule if modalMode is Edit and natRule is defined', () => {
    //   const modalMode = ModalMode.Edit;
    //   spyOn(component, 'subscribeToNatRuleModal');
    //   spyOn(component['ngx'], 'setModalData');
    //   spyOn(component['ngx'], 'getModal').and.returnValue({ open: () => {} });

    //   const natRule = { id: 'natRuleId', ruleIndex: 1 } as any;

    //   component.networkObjectGroups = ['networkObjectGroup1'] as any;
    //   component.networkObjects = ['networkObject1'] as any;
    //   component.serviceObjects = ['serviceObject1'] as any;
    //   component.Id = 'natRuleGroupId';
    //   component.TierId = 'tierId';

    //   component.openNatRuleModal(modalMode, natRule);

    //   const expectedDto = new NatRuleModalDto();
    //   expectedDto.tierId = component.TierId;
    //   expectedDto.natRuleGroupId = component.Id;
    //   expectedDto.modalMode = modalMode;
    //   expectedDto.NetworkObjectGroups = component.networkObjectGroups;
    //   expectedDto.NetworkObjects = component.networkObjects;
    //   expectedDto.ServiceObjects = component.serviceObjects;
    //   expectedDto.natRule = natRule;

    //   expect(component.subscribeToNatRuleModal).toHaveBeenCalled();
    //   expect(component['ngx'].setModalData).toHaveBeenCalledWith(expectedDto, 'natRuleModal');
    //   expect(component['ngx'].getModal('natRuleModal').open).toHaveBeenCalled();
    // });
  });
});
