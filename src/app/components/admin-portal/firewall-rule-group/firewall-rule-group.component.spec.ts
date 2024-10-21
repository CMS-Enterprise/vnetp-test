/* eslint-disable */
import { FilterPipe } from 'src/app/pipes/filter.pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MockFontAwesomeComponent,
  MockYesNoModalComponent,
  MockNgxSmartModalComponent,
  MockImportExportComponent,
  MockComponent,
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

describe('FirewallRuleGroupComponent', () => {
  let component: FirewallRuleGroupComponent;
  let fixture: ComponentFixture<FirewallRuleGroupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, NgxPaginationModule],
      declarations: [
        FilterPipe,
        FirewallRuleGroupComponent,
        MockComponent('app-firewall-rule-group-modal'),
        MockComponent({ selector: 'app-table', inputs: ['config', 'data'] }),
        MockFontAwesomeComponent,
        MockNgxSmartModalComponent,
        MockYesNoModalComponent,
        MockImportExportComponent,
      ],
      providers: [
        MockProvider(NgxSmartModalService),
        MockProvider(TierContextService),
        MockProvider(V1TiersService),
        MockProvider(V1NetworkSecurityFirewallRuleGroupsService),
      ],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(FirewallRuleGroupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Get Tiers', () => {
    it('should fetch tiers joined with firewall rule group', () => {
      const tierService = TestBed.inject(V1TiersService);
      const tiersMock = [
        { name: 'tier1', firewallRuleGroups: ['tier1FWRuleGroup1', 'tier1FWRuleGroup2'] },
        { name: 'tier2', firewallRuleGroups: ['tier2FWRuleGroup1', 'tier2FWRuleGroup2'] },
      ];
      component.tiers = tiersMock;

      // const firewallRuleGroupsMock = ['tier1FWRuleGroup1', 'tier1FWRuleGroup2','tier2FWRuleGroup1', 'tier2FWRuleGroup2']

      // component.firewallRuleGroups = firewallRuleGroupsMock

      // const mapSpy = jest.spyOn(component.tiers, 'map')

      const getManyTiersSpy = jest.spyOn(tierService, 'getManyTier').mockReturnValue(of({ tiersMock } as any));

      tierService.getManyTier({ join: ['firewallRuleGroups'] });
      expect(getManyTiersSpy).toHaveBeenCalledWith({ join: ['firewallRuleGroups'] });

      // expect(mapSpy).toHaveBeenCalled()
    });
  });
  describe('openModal', () => {
    beforeEach(() => {
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

      expect(component.getTiers).toHaveBeenCalled();
      expect(component['ngx'].resetModalData).toHaveBeenCalledWith('firewallRuleGroupModal');

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

      expect(component['ngx'].setModalData).toHaveBeenCalledWith(expectedDto, 'firewallRuleGroupModal');
      expect(component['ngx'].getModal).toHaveBeenCalledWith('firewallRuleGroupModal');
      expect(component['ngx'].getModal('firewallRuleGroupModal').open).toHaveBeenCalled();
    });
  });
});
