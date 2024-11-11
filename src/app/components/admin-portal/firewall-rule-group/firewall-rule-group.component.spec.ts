/* eslint-disable */
import { FilterPipe } from 'src/app/pipes/filter.pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MockFontAwesomeComponent,
  MockYesNoModalComponent,
  MockNgxSmartModalComponent,
  MockImportExportComponent,
  MockComponent,
  MockIconButtonComponent,
} from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { V1TiersService, V1NetworkSecurityFirewallRuleGroupsService, PaginationDTO } from 'client';
import { TierContextService } from 'src/app/services/tier-context.service';
import { FirewallRuleGroupComponent } from './firewall-rule-group.component';
import { of, Subject, Subscription } from 'rxjs';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { TableContextService } from 'src/app/services/table-context.service';
import { RouterTestingModule } from '@angular/router/testing';
import { EntityService } from 'src/app/services/entity.service';

describe('FirewallRuleGroupComponent', () => {
  let component: FirewallRuleGroupComponent;
  let fixture: ComponentFixture<FirewallRuleGroupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, NgxPaginationModule, RouterTestingModule.withRoutes([])],
      declarations: [
        FilterPipe,
        FirewallRuleGroupComponent,
        MockComponent('app-firewall-rule-group-modal'),
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
        MockFontAwesomeComponent,
        MockNgxSmartModalComponent,
        MockYesNoModalComponent,
        MockImportExportComponent,
        MockIconButtonComponent,
      ],
      providers: [
        MockProvider(NgxSmartModalService),
        MockProvider(TierContextService),
        MockProvider(V1TiersService),
        MockProvider(V1NetworkSecurityFirewallRuleGroupsService),
      ],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FirewallRuleGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getFirewallRules on table event', () => {
    jest.spyOn(component, 'getFirewallRuleGroups');
    component.onTableEvent({} as any);
    expect(component.getFirewallRuleGroups).toHaveBeenCalled();
  });

  describe('Get Rule Groups', () => {
    it('Get Firewall Rule Groups and add tierName as a property', () => {
      const tierService = TestBed.inject(V1TiersService);
      const firewallRuleGroupService = TestBed.inject(V1NetworkSecurityFirewallRuleGroupsService);
      const tiersMock = [
        { name: 'tier1', firewallRuleGroups: ['tier1FWRuleGroup1', 'tier1FWRuleGroup2'] },
        { name: 'tier2', firewallRuleGroups: ['tier2FWRuleGroup1', 'tier2FWRuleGroup2'] },
      ];
      component.tiers = tiersMock;

      const getManyTiersSpy = jest.spyOn(tierService, 'getManyTier').mockReturnValue(of({ tiersMock } as any));

      const firewallRuleGroupsMock = [
        { name: 'fwRuleGroup1', tierName: 'tier1' },
        { name: 'fwRuleGroup2', tierName: 'tier1' },
        { name: 'fwRuleGroup1', tierName: 'tier2' },
        { name: 'fwRuleGroup1', tierName: 'tier2' },
      ];

      component.firewallRuleGroups = firewallRuleGroupsMock;

      const getManyFirewallRuleGroupSpy = jest
        .spyOn(firewallRuleGroupService, 'getManyFirewallRuleGroup')
        .mockReturnValue(of({ firewallRuleGroupsMock } as any));

      firewallRuleGroupService.getManyFirewallRuleGroup({
        page: 1,
        perPage: 20,
        s: `{"AND": [], "OR": [{"name": {"eq": "External"}}, {"name": {"eq": "Intervrf"}}, {"type": {"eq": "ZoneBased"}}]}`,
      });
      component.getFirewallRuleGroups();

      expect(getManyFirewallRuleGroupSpy).toHaveBeenCalled();
    });
  });

  describe('restore firewall rule group', () => {
    it('should restore firewall rule', () => {
      const firewallRuleGroupService = TestBed.inject(V1NetworkSecurityFirewallRuleGroupsService);
      const firewallRuleGroup = { id: '1', deletedAt: true } as any;
      const restoreOneSpy = jest.spyOn(firewallRuleGroupService, 'restoreOneFirewallRuleGroup').mockReturnValue(of({} as any));
      const getManyFirewallRuleGroupSpy = jest.spyOn(firewallRuleGroupService, 'getManyFirewallRuleGroup');
      component.restoreFirewallRuleGroup(firewallRuleGroup);
      expect(restoreOneSpy).toHaveBeenCalledWith({ id: firewallRuleGroup.id });
      expect(getManyFirewallRuleGroupSpy).toHaveBeenCalled();
    });
  });

  // describe('Delete Firewall Rule Group', () => {
  //   it('should delete firewallrulegroup', () => {
  //     const service = TestBed.inject(V1NetworkSecurityFirewallRuleGroupsService);
  //     const ruleGroupToDelete = { id: '1', tierId: '123' } as any;
  //     component.deleteFirewallRuleGroup(ruleGroupToDelete);
  //     const getZonesMock = jest.spyOn(service, 'getManyFirewallRuleGroup');
  //     expect(getZonesMock).toHaveBeenCalled();
  //   });
  // });

  // describe('delete FirewaullRuleGroup', () => {

  // it('should call deleteOneFirewallRuleGroup without event params', () => {
  //   const firewallRuleGroupService = TestBed.inject(V1NetworkSecurityFirewallRuleGroupsService);
  //   const entityService = TestBed.inject(EntityService);

  //   const firewallRuleGroup = { id: 'testId' } as any;
  //   const deleteOneFirewallRuleGroupSpy = jest.spyOn(firewallRuleGroupService, 'deleteOneFirewallRuleGroup').mockResolvedValue({} as never);
  //   const softDeleteOneFirewallRuleGroupSpy = jest.spyOn(firewallRuleGroupService, 'softDeleteOneFirewallRuleGroup').mockResolvedValue({} as never);
  //   const firewallRuleGroupsMock = [{ name: 'fwRuleGroup1', tierName: 'tier1' }, { name: 'fwRuleGroup2', tierName: 'tier1' }, { name: 'fwRuleGroup1', tierName: 'tier2' }, { name: 'fwRuleGroup1', tierName: 'tier2' }]

  //   const getManyFirewallRuleGroupSpy = jest.spyOn(firewallRuleGroupService, 'getManyFirewallRuleGroup').mockReturnValue(of({ firewallRuleGroupsMock } as any));

  //   const entityServiceDeleteSpy = jest.spyOn(entityService, 'deleteEntity').mockImplementationOnce((entity, options) => {
  //     options.onSuccess();
  //     return new Subscription();
  //   });

  //   component.deleteFirewallRuleGroup(firewallRuleGroup);
  //   firewallRuleGroupService.getManyFirewallRuleGroup({ page: 1, perPage: 20, s: `{"AND": [], "OR": [{"name": {"eq": "External"}}, {"name": {"eq": "Intervrf"}}, {"type": {"eq": "ZoneBased"}}]}` });
  //   expect(entityServiceDeleteSpy).toHaveBeenCalled()

  //   expect(deleteOneFirewallRuleGroupSpy).toHaveBeenCalledWith({ id: firewallRuleGroup.id });
  //   expect(softDeleteOneFirewallRuleGroupSpy).toHaveBeenCalledWith({ id: firewallRuleGroup.id });
  //   expect(getManyFirewallRuleGroupSpy).toHaveBeenCalled();

  // });
  // it('should call deleteOneFirewallRule without event params', () => {
  //   const firewallRuleGroupService = TestBed.inject(V1NetworkSecurityFirewallRuleGroupsService);
  //   const entityService = TestBed.inject(EntityService);

  //   const firewallRuleGroup = { id: 'testId' } as any;
  //   const deleteOneFirewallRuleGroupSpy = jest.spyOn(firewallRuleGroupService, 'deleteOneFirewallRuleGroup').mockResolvedValue({} as never);
  //   const softDeleteOneFirewallRuleGroupSpy = jest.spyOn(firewallRuleGroupService, 'softDeleteOneFirewallRuleGroup').mockResolvedValue({} as never);
  //   const firewallRuleGroupsMock = [{ name: 'fwRuleGroup1', tierName: 'tier1' }, { name: 'fwRuleGroup2', tierName: 'tier1' }, { name: 'fwRuleGroup1', tierName: 'tier2' }, { name: 'fwRuleGroup1', tierName: 'tier2' }]

  //   const getManyFirewallRuleGroupSpy = jest.spyOn(firewallRuleGroupService, 'getManyFirewallRuleGroup').mockReturnValue(of({ firewallRuleGroupsMock } as any));

  //   const entityServiceDeleteSpy = jest.spyOn(entityService, 'deleteEntity').mockImplementationOnce((entity, options) => {
  //     options.onSuccess();
  //     return new Subscription();
  //   });

  //   component.deleteFirewallRuleGroup(firewallRuleGroup);
  //   firewallRuleGroupService.getManyFirewallRuleGroup({ page: 1, perPage: 20, s: `{"AND": [], "OR": [{"name": {"eq": "External"}}, {"name": {"eq": "Intervrf"}}, {"type": {"eq": "ZoneBased"}}]}` });
  //   expect(entityServiceDeleteSpy).toHaveBeenCalled()

  //   expect(deleteOneFirewallRuleGroupSpy).toHaveBeenCalledWith({ id: firewallRuleGroup.id });
  //   expect(softDeleteOneFirewallRuleGroupSpy).toHaveBeenCalledWith({ id: firewallRuleGroup.id });
  //   expect(getManyFirewallRuleGroupSpy).toHaveBeenCalled();

  // });
  // });

  // it('should call deleteOneFirewallRule without event params', () => {
  //   const firewallRuleGroupService = TestBed.inject(V1NetworkSecurityFirewallRuleGroupsService);
  //   const firewallRuleGroup = { id: 'testId' } as any;
  //   const deleteOneFirewallRuleGroupSpy = jest.spyOn(firewallRuleGroupService, 'deleteOneFirewallRuleGroup').mockResolvedValue({} as never);
  //   const softDeleteOneFirewallRuleGroupSpy = jest.spyOn(firewallRuleGroupService, 'softDeleteOneFirewallRuleGroup').mockResolvedValue({} as never);

  //   jest.spyOn(component['entityService'], 'deleteEntity').mockImplementationOnce((entity, options) => {
  //     options.onSuccess();
  //     return new Subscription();
  //   });

  //   const getFirewallRuleGroupsSpy = jest.spyOn(component, 'getFirewallRuleGroups');
  //   component.deleteFirewallRuleGroup(firewallRuleGroup);

  //   expect(component['entityService'].deleteEntity).toHaveBeenCalled();
  //   expect(deleteOneFirewallRuleGroupSpy).toHaveBeenCalledWith({ id: firewallRuleGroup.id });
  //   expect(softDeleteOneFirewallRuleGroupSpy).toHaveBeenCalledWith({ id: firewallRuleGroup.id });
  //   expect(getFirewallRuleGroupsSpy).toHaveBeenCalled();
  // });

  // it('should call deleteOneFirewallRule with event params', () => {
  //   const firewallRuleGroup = { id: 'testId' } as any;
  //   // component.firewallRuleGroups;
  //   jest.spyOn(component['firewallRuleGroupService'], 'deleteOneFirewallRuleGroup').mockResolvedValue({} as never);
  //   jest.spyOn(component['firewallRuleGroupService'], 'softDeleteOneFirewallRuleGroup').mockResolvedValue({} as never);

  //   jest.spyOn(component['entityService'], 'deleteEntity').mockImplementationOnce((entity, options) => {
  //     options.onSuccess();
  //     return new Subscription();
  //   });

  //   const params = { searchString: '', filteredResults: true, searchColumn: 'name', searchText: 'test' };
  //   jest.spyOn(component['tableContextService'], 'getSearchLocalStorage').mockReturnValue(params);
  //   const getFirewallRuleGroupsSpy = jest.spyOn(component, 'getFirewallRuleGroups');

  //   component.deleteFirewallRuleGroup(firewallRuleGroup);

  //   expect(component.tableComponentDto.searchColumn).toBe(params.searchColumn);
  //   expect(component.tableComponentDto.searchText).toBe(params.searchText);
  //   expect(getFirewallRuleGroupsSpy).toHaveBeenCalledWith(component.tableComponentDto);
  // });

  // it('should call deleteOneFirewallRule without event params', () => {
  //   const firewallRuleGroup = { id: 'testId' } as any;
  //   component.firewallRuleGroups = { id: 'test' } as any;
  //   const deleteOneFirewallRuleSpy = jest.spyOn(component['firewallRuleService'], 'deleteOneFirewallRule').mockResolvedValue({} as never);
  //   const softDeleteOneFirewallRuleSpy = jest
  //     .spyOn(component['firewallRuleService'], 'softDeleteOneFirewallRule')
  //     .mockResolvedValue({} as never);

  //   jest.spyOn(component['entityService'], 'deleteEntity').mockImplementationOnce((entity, options) => {
  //     options.onSuccess();
  //     return new Subscription();
  //   });

  //   const getFirewallRulesSpy = jest.spyOn(component, 'getFirewallRules');
  //   component.deleteFirewallRule(firewallRule);

  //   expect(component['entityService'].deleteEntity).toHaveBeenCalled();
  //   expect(deleteOneFirewallRuleSpy).toHaveBeenCalledWith({ id: firewallRule.id });
  //   expect(softDeleteOneFirewallRuleSpy).toHaveBeenCalledWith({ id: firewallRule.id });
  //   expect(getFirewallRulesSpy).toHaveBeenCalled();
  // });

  // describe('Get Tiers', () => {
  //   it('should fetch tiers joined with firewall rule group', () => {
  //     const tierService = TestBed.inject(V1TiersService);
  //     const tiersMock = [
  //       { name: 'tier1', firewallRuleGroups: ['tier1FWRuleGroup1', 'tier1FWRuleGroup2'] },
  //       { name: 'tier2', firewallRuleGroups: ['tier2FWRuleGroup1', 'tier2FWRuleGroup2'] },
  //     ];
  //     component.tiers = tiersMock;

  //     // const firewallRuleGroupsMock = ['tier1FWRuleGroup1', 'tier1FWRuleGroup2','tier2FWRuleGroup1', 'tier2FWRuleGroup2']

  //     // component.firewallRuleGroups = firewallRuleGroupsMock

  //     // const mapSpy = jest.spyOn(component.tiers, 'map')

  //     const getManyTiersSpy = jest.spyOn(tierService, 'getManyTier').mockReturnValue(of({ tiersMock } as any));

  //     tierService.getManyTier({ join: ['firewallRuleGroups'] });
  //     expect(getManyTiersSpy).toHaveBeenCalledWith({ page: 1, perPage: 20, join: ['firewallRuleGroups'] });

  //     // expect(mapSpy).toHaveBeenCalled()
  //   });
  // });

  describe('openModal', () => {
    beforeEach(() => {
      jest.spyOn(component, 'getFirewallRuleGroups');
      jest.spyOn(component, 'getTiers');
      jest.spyOn(component['ngx'], 'resetModalData');
    });

    it('should subscribe to firewallRuleGroupModal onCloseFinished event and unsubscribe afterwards', () => {
      const onCloseFinished = new Subject<void>();
      const mockModal = { onCloseFinished, open: jest.fn() };
      jest.spyOn(component['ngx'], 'getModal').mockReturnValue(mockModal as any);

      const unsubscribeSpy = jest.spyOn(Subscription.prototype, 'unsubscribe');

      component.subscribeToFirewallRuleGroupModal();

      expect(component['ngx'].getModal).toHaveBeenCalledWith('firewallRuleGroupModal');
      expect(component.fwRuleGroupModalSubscription).toBeDefined();

      onCloseFinished.next();

      expect(component['ngx'].resetModalData).toHaveBeenCalledWith('firewallRuleGroupModal');

      expect(component.getFirewallRuleGroups).toHaveBeenCalled();
    });
    it('should open modal with correct modalMode', () => {
      const modalMode = ModalMode.Create;
      jest.spyOn(component['ngx'], 'setModalData');
      const onCloseFinished = new Subject<void>();
      jest.spyOn(component['ngx'], 'getModal').mockReturnValue({ open: jest.fn(), onCloseFinished } as any);

      component.openFWRuleGroupModal(modalMode);

      const expectedDto = {
        ModalMode: modalMode,
      };

      expect(component['ngx'].setModalData).toHaveBeenCalledWith(expectedDto, 'firewallRuleGroupModal');
      expect(component['ngx'].getModal).toHaveBeenCalledWith('firewallRuleGroupModal');
      expect(component['ngx'].getModal('firewallRuleGroupModal').open).toHaveBeenCalled();
    });
  });

  it('should apply search params when filtered results is true', () => {
    const natRuleGroup = { id: '1' } as any;
    jest.spyOn(component['firewallRuleGroupService'], 'deleteOneFirewallRuleGroup').mockResolvedValue({} as never);
    jest.spyOn(component['firewallRuleGroupService'], 'softDeleteOneFirewallRuleGroup').mockResolvedValue({} as never);

    jest.spyOn(component['entityService'], 'deleteEntity').mockImplementationOnce((entity, options) => {
      options.onSuccess();
      return new Subscription();
    });

    const params = { searchString: '', filteredResults: true, searchColumn: 'name', searchText: 'test' };
    jest.spyOn(component['tableContextService'], 'getSearchLocalStorage').mockReturnValue(params);
    const getFirewallRuleGroupsSpy = jest.spyOn(component, 'getFirewallRuleGroups');

    component.deleteFirewallRuleGroup(natRuleGroup);

    expect(component.tableComponentDto.searchColumn).toBe(params.searchColumn);
    expect(component.tableComponentDto.searchText).toBe(params.searchText);
    expect(getFirewallRuleGroupsSpy).toHaveBeenCalledWith(component.tableComponentDto);
  });
});
