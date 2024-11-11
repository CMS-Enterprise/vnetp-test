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
import { V1TiersService, V1NetworkSecurityFirewallRuleGroupsService, PaginationDTO, V1NetworkSecurityZonesService } from 'client';
import { TierContextService } from 'src/app/services/tier-context.service';
import { of, Subject, Subscription } from 'rxjs';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { RuleGroupZonesComponent } from './rule-group-zones.component';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { RouterTestingModule } from '@angular/router/testing';

describe('RuleGroupZonesComponent', () => {
  let component: RuleGroupZonesComponent;
  let fixture: ComponentFixture<RuleGroupZonesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, NgxPaginationModule, RouterTestingModule.withRoutes([])],
      declarations: [
        FilterPipe,
        RuleGroupZonesComponent,
        MockComponent('app-rule-group-zones-modal'),
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage'] }),
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
        MockProvider(V1NetworkSecurityZonesService),
      ],
    });
  });
  beforeEach(() => {
    fixture = TestBed.createComponent(RuleGroupZonesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Get Zones', () => {
    it('should fetch zones', () => {
      const zoneService = TestBed.inject(V1NetworkSecurityZonesService);

      const zoneMock = [{ name: 'zone1' }, { name: 'zone2' }];

      component.zones = zoneMock;

      const getManyZonesSpy = jest.spyOn(zoneService, 'getManyZone').mockReturnValue(of({ zoneMock } as any));

      zoneService.getManyZone({ page: 1, perPage: 20 });

      expect(getManyZonesSpy).toHaveBeenCalledWith({ page: 1, perPage: 20 });
    });
  });

  describe('restore zone', () => {
    it('should restore zone', () => {
      const zoneService = TestBed.inject(V1NetworkSecurityZonesService);
      const zoneMock = { id: '1', deletedAt: true };
      const restoreOneSpy = jest.spyOn(zoneService, 'restoreOneZone').mockReturnValue(of({} as any));
      const getManyZoneSpy = jest.spyOn(zoneService, 'getManyZone');
      component.restoreZone(zoneMock);
      expect(restoreOneSpy).toHaveBeenCalledWith({ id: zoneMock.id });
      expect(getManyZoneSpy).toHaveBeenCalled();
    });
  });
  describe('openModal', () => {
    beforeEach(() => {
      jest.spyOn(component, 'getZones');
      jest.spyOn(component['ngx'], 'resetModalData');
    });

    it('should subscribe to RuleGroupZoneModal onCloseFinished event and unsubscribe afterwards', () => {
      const onCloseFinished = new Subject<void>();
      const mockModal = { onCloseFinished, open: jest.fn() };
      jest.spyOn(component['ngx'], 'getModal').mockReturnValue(mockModal as any);

      const unsubscribeSpy = jest.spyOn(Subscription.prototype, 'unsubscribe');

      component.subscribeToRuleGroupZonesModal();

      expect(component['ngx'].getModal).toHaveBeenCalledWith('ruleGroupZonesModal');
      expect(component.ruleGroupZoneModalSubscription).toBeDefined();

      onCloseFinished.next();

      expect(component.getZones).toHaveBeenCalled();
      expect(component['ngx'].resetModalData).toHaveBeenCalledWith('ruleGroupZonesModal');

      expect(unsubscribeSpy).toHaveBeenCalled();
    });
    it('should open modal with correct modalMode', () => {
      const modalMode = ModalMode.Create;
      jest.spyOn(component['ngx'], 'setModalData');
      const onCloseFinished = new Subject<void>();
      jest.spyOn(component['ngx'], 'getModal').mockReturnValue({ open: jest.fn(), onCloseFinished } as any);

      component.openRuleGroupZonesModal(modalMode);

      const expectedDto = {
        ModalMode: modalMode,
      };

      expect(component['ngx'].setModalData).toHaveBeenCalledWith(expectedDto, 'ruleGroupZonesModal');
      expect(component['ngx'].getModal).toHaveBeenCalledWith('ruleGroupZonesModal');
      expect(component['ngx'].getModal('ruleGroupZonesModal').open).toHaveBeenCalled();
    });
  });

  describe('Delete Zone', () => {
    it('should delete zone', () => {
      const zoneService = TestBed.inject(V1NetworkSecurityZonesService);
      const zoneToDelete = { id: '1', tierId: '123' } as any;
      component.deleteZone(zoneToDelete);
      const getZonesMock = jest.spyOn(zoneService, 'getManyZone');
      expect(getZonesMock).toHaveBeenCalled();
    });
  });
});
