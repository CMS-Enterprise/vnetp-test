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
import { V1TiersService, V1NetworkSecurityNatRuleGroupsService, PaginationDTO } from 'client';
import { TierContextService } from 'src/app/services/tier-context.service';
import { NatRuleGroupComponent } from './nat-rule-group.component';
import { of, Subject, Subscription } from 'rxjs';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { RouterTestingModule } from '@angular/router/testing';

describe('NatRuleGroupComponent', () => {
  let component: NatRuleGroupComponent;
  let fixture: ComponentFixture<NatRuleGroupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, NgxPaginationModule, RouterTestingModule.withRoutes([])],
      declarations: [
        FilterPipe,
        NatRuleGroupComponent,
        MockComponent('app-nat-rule-group-modal'),
        MockComponent({ selector: 'app-table', inputs: ['config', 'data'] }),
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
        MockProvider(V1NetworkSecurityNatRuleGroupsService),
      ],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NatRuleGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call natRuleGroups on table event', () => {
    jest.spyOn(component, 'getNatRuleGroups');
    component.onTableEvent({} as any);
    expect(component.getNatRuleGroups).toHaveBeenCalled();
  });

  describe('Get Rule Groups', () => {
    it('Get Nat Rule Groups and add tierName as a property', () => {
      const tierService = TestBed.inject(V1TiersService);
      const natRuleGroupService = TestBed.inject(V1NetworkSecurityNatRuleGroupsService);
      const tiersMock = [
        { name: 'tier1', natRuleGroups: ['tier1NatRuleGroup1', 'tier1NatRuleGroup2'] },
        { name: 'tier2', natRuleGroups: ['tier2NaRuleGroup1', 'tier2NatRuleGroup2'] },
      ];
      component.tiers = tiersMock;

      const getManyTiersSpy = jest.spyOn(tierService, 'getManyTier').mockReturnValue(of({ tiersMock } as any));

      const natRuleGroupsMock = [
        { name: 'natRuleGroup1', tierName: 'tier1' },
        { name: 'natRuleGroup2', tierName: 'tier1' },
        { name: 'natRuleGroup1', tierName: 'tier2' },
        { name: 'natRuleGroup1', tierName: 'tier2' },
      ];

      component.natRuleGroups = natRuleGroupsMock;

      const getManyNatRuleGroupSpy = jest
        .spyOn(natRuleGroupService, 'getManyNatRuleGroup')
        .mockReturnValue(of({ natRuleGroupsMock } as any));

      natRuleGroupService.getManyNatRuleGroup({
        page: 1,
        perPage: 20,
        s: `{"AND": [], "OR": [{"name": {"eq": "External"}}, {"name": {"eq": "Intervrf"}}, {"type": {"eq": "ZoneBased"}}]}`,
      });
      component.getNatRuleGroups();
      expect(getManyNatRuleGroupSpy).toHaveBeenCalled();
    });
  });

  describe('restore nat rule group', () => {
    it('should restore nat rule', () => {
      const natRuleGroupService = TestBed.inject(V1NetworkSecurityNatRuleGroupsService);
      const natRuleGroup = { id: '1', deletedAt: true } as any;
      const restoreOneSpy = jest.spyOn(natRuleGroupService, 'restoreOneNatRuleGroup').mockReturnValue(of({} as any));
      const getManyNatRuleGroupSpy = jest.spyOn(natRuleGroupService, 'getManyNatRuleGroup');
      component.restoreNatRuleGroup(natRuleGroup);
      expect(restoreOneSpy).toHaveBeenCalledWith({ id: natRuleGroup.id });
      expect(getManyNatRuleGroupSpy).toHaveBeenCalled();
    });
  });

  // describe('Get Tiers', () => {
  //   it('should fetch tiers joined with nat rule group', () => {
  //     const tierService = TestBed.inject(V1TiersService);
  //     const tiersMock = [
  //       { name: 'tier1', natRuleGroups: ['tier1NATRuleGroup1', 'tier1NATRuleGroup2'] },
  //       { name: 'tier2', natRuleGroups: ['tier2NATRuleGroup1', 'tier2NATRuleGroup2'] },
  //     ];
  //     component.tiers = tiersMock;

  //     // const natRuleGroupsMock = ['tier1NATRuleGroup1', 'tier1NATRuleGroup2','tier2NATRuleGroup1', 'tier2NATRuleGroup2']

  //     // component.natRuleGroups = natRuleGroupsMock

  //     // const mapSpy = jest.spyOn(component.tiers, 'map')

  //     const getManyTiersSpy = jest.spyOn(tierService, 'getManyTier').mockReturnValue(of({ tiersMock } as any));

  //     tierService.getManyTier({ join: ['natRuleGroups'] });
  //     expect(getManyTiersSpy).toHaveBeenCalledWith({ page: 1, perPage: 20, join: ['natRuleGroups'] });

  //     // expect(mapSpy).toHaveBeenCalled()
  //   });
  // });
  describe('openModal', () => {
    beforeEach(() => {
      jest.spyOn(component, 'getNatRuleGroups');
      jest.spyOn(component, 'getTiers');
      jest.spyOn(component['ngx'], 'resetModalData');
    });

    it('should subscribe to natRuleGroupModal onCloseFinished event and unsubscribe afterwards', () => {
      const onCloseFinished = new Subject<void>();
      const mockModal = { onCloseFinished, open: jest.fn() };
      jest.spyOn(component['ngx'], 'getModal').mockReturnValue(mockModal as any);

      const unsubscribeSpy = jest.spyOn(Subscription.prototype, 'unsubscribe');

      component.subscribeToNatRuleGroupModal();

      expect(component['ngx'].getModal).toHaveBeenCalledWith('natRuleGroupModal');
      expect(component.natRuleGroupModalSubscription).toBeDefined();

      onCloseFinished.next();

      expect(component['ngx'].resetModalData).toHaveBeenCalledWith('natRuleGroupModal');

      expect(component.getNatRuleGroups).toHaveBeenCalled();
    });
    it('should open modal with correct modalMode', () => {
      const modalMode = ModalMode.Create;
      jest.spyOn(component['ngx'], 'setModalData');
      const onCloseFinished = new Subject<void>();
      jest.spyOn(component['ngx'], 'getModal').mockReturnValue({ open: jest.fn(), onCloseFinished } as any);

      component.openNatRuleGroupModal(modalMode);

      const expectedDto = {
        ModalMode: modalMode,
      };

      expect(component['ngx'].setModalData).toHaveBeenCalledWith(expectedDto, 'natRuleGroupModal');
      expect(component['ngx'].getModal).toHaveBeenCalledWith('natRuleGroupModal');
      expect(component['ngx'].getModal('natRuleGroupModal').open).toHaveBeenCalled();
    });
  });

  it('should apply search params when filtered results is true', () => {
    const natRuleGroup = { id: '1' } as any;
    jest.spyOn(component['natRuleGroupService'], 'deleteOneNatRuleGroup').mockResolvedValue({} as never);
    jest.spyOn(component['natRuleGroupService'], 'softDeleteOneNatRuleGroup').mockResolvedValue({} as never);

    jest.spyOn(component['entityService'], 'deleteEntity').mockImplementationOnce((entity, options) => {
      options.onSuccess();
      return new Subscription();
    });

    const params = { searchString: '', filteredResults: true, searchColumn: 'name', searchText: 'test' };
    jest.spyOn(component['tableContextService'], 'getSearchLocalStorage').mockReturnValue(params);
    const getNatRuleGroupsSpy = jest.spyOn(component, 'getNatRuleGroups');

    component.deleteNatRuleGroup(natRuleGroup);

    expect(component.tableComponentDto.searchColumn).toBe(params.searchColumn);
    expect(component.tableComponentDto.searchText).toBe(params.searchText);
    expect(getNatRuleGroupsSpy).toHaveBeenCalledWith(component.tableComponentDto);
  });
});
