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

describe('NatRuleGroupComponent', () => {
  let component: NatRuleGroupComponent;
  let fixture: ComponentFixture<NatRuleGroupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, NgxPaginationModule],
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
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(NatRuleGroupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Get Tiers', () => {
    it('should fetch tiers joined with nat rule group', () => {
      const tierService = TestBed.inject(V1TiersService);
      const tiersMock = [
        { name: 'tier1', natRuleGroups: ['tier1NatRuleGroup1', 'tier1NatRuleGroup2'] },
        { name: 'tier2', natRuleGroups: ['tierNatRuleGroup1', 'tier2NatRuleGroup2'] },
      ];
      component.tiers = tiersMock;

      // const natRuleGroupsMock = ['tier1FWRuleGroup1', 'tier1FWRuleGroup2','tier2FWRuleGroup1', 'tier2FWRuleGroup2']

      // component.natRuleGroups = natRuleGroupsMock

      // const mapSpy = jest.spyOn(component.tiers, 'map')

      const getManyTiersSpy = jest.spyOn(tierService, 'getManyTier').mockReturnValue(of({ tiersMock } as any));

      tierService.getManyTier({ join: ['natRuleGroups'] });
      expect(getManyTiersSpy).toHaveBeenCalledWith({ join: ['natRuleGroups'] });

      // expect(mapSpy).toHaveBeenCalled()
    });
  });
  describe('openModal', () => {
    beforeEach(() => {
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

      expect(component.getTiers).toHaveBeenCalled();
      expect(component['ngx'].resetModalData).toHaveBeenCalledWith('natRuleGroupModal');

      expect(unsubscribeSpy).toHaveBeenCalled();
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

      expect(component['ngx'].setModalData).toHaveBeenCalledWith(expectedDto, 'natRuleGroupModal');
      expect(component['ngx'].getModal).toHaveBeenCalledWith('natRuleGroupModal');
      expect(component['ngx'].getModal('natRuleGroupModal').open).toHaveBeenCalled();
    });
  });
});
