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
import { V1TiersService, V1NetworkSecurityFirewallRuleGroupsService, V1NetworkSecurityZonesService } from 'client';
import { TierContextService } from 'src/app/services/tier-context.service';
import { of, Subject, Subscription } from 'rxjs';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { RuleGroupZonesComponent } from './rule-group-zones.component';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { RouterTestingModule } from '@angular/router/testing';
import { EntityService } from 'src/app/services/entity.service';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';

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
      const zoneMock = { id: '1', deletedAt: true } as any;
      const restoreOneSpy = jest.spyOn(zoneService, 'restoreOneZone').mockReturnValue(of({} as any));
      const getManyZoneSpy = jest.spyOn(zoneService, 'getManyZone');
      component.restoreZone(zoneMock);
      expect(restoreOneSpy).toHaveBeenCalledWith({ id: zoneMock.id });
      expect(getManyZoneSpy).toHaveBeenCalled();
    });
  });

  it('should call delete one zone without event params', () => {
    const service = TestBed.inject(V1NetworkSecurityZonesService);
    const entityService = TestBed.inject(EntityService);

    const zone = { id: 'testId' } as any;
    const deleteOneZoneSpy = jest.spyOn(service, 'deleteOneZone').mockResolvedValue({} as never);
    const softDeleteOneZoneSpy = jest.spyOn(service, 'softDeleteOneZone').mockResolvedValue({} as never);
    const zonesMock = [
      { name: 'zone1', tierName: 'tier1' },
      { name: 'zone2', tierName: 'tier1' },
      { name: 'zone1', tierName: 'tier2' },
      { name: 'zone2', tierName: 'tier2' },
    ];

    const getManyZoneSpy = jest.spyOn(service, 'getManyZone').mockReturnValue(of({ zonesMock } as any));

    const entityServiceDeleteSpy = jest.spyOn(entityService, 'deleteEntity').mockImplementationOnce((entity, options) => {
      options.onSuccess();
      return new Subscription();
    });

    component.deleteZone(zone);
    expect(entityServiceDeleteSpy).toHaveBeenCalled();

    expect(deleteOneZoneSpy).toHaveBeenCalledWith({ id: zone.id });
    expect(softDeleteOneZoneSpy).toHaveBeenCalledWith({ id: zone.id });
    expect(getManyZoneSpy).toHaveBeenCalled();
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

  it('should apply search params when filtered results is true', () => {
    const zone = { id: '1' } as any;
    jest.spyOn(component['zoneService'], 'deleteOneZone').mockResolvedValue({} as never);
    jest.spyOn(component['zoneService'], 'softDeleteOneZone').mockResolvedValue({} as never);

    jest.spyOn(component['entityService'], 'deleteEntity').mockImplementationOnce((entity, options) => {
      options.onSuccess();
      return new Subscription();
    });

    const params = { searchString: '', filteredResults: true, searchColumn: 'name', searchText: 'test' };
    jest.spyOn(component['tableContextService'], 'getSearchLocalStorage').mockReturnValue(params);
    const getZonesSpy = jest.spyOn(component, 'getZones');

    component.deleteZone(zone);

    expect(component.tableComponentDto.searchColumn).toBe(params.searchColumn);
    expect(component.tableComponentDto.searchText).toBe(params.searchText);
    expect(getZonesSpy).toHaveBeenCalledWith(component.tableComponentDto);
  });

  it('should import zones', () => {
    const mockNgxSmartModalComponent = {
      getData: jest.fn().mockReturnValue({ modalYes: true }),
      removeData: jest.fn(),
      onCloseFinished: {
        subscribe: jest.fn(),
      },
    };
    component['ngx'] = {
      getModal: jest.fn().mockReturnValue({
        ...mockNgxSmartModalComponent,
        open: jest.fn(),
      }),
      setModalData: jest.fn(),
    } as any;
    const event = [{ name: 'zone1' }, { name: 'zone2' }] as any;
    jest.spyOn(component, 'getZones');
    jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal').mockImplementation((modalDto, ngx, onConfirm, onClose) => {
      onConfirm();

      expect(component['zoneService'].createManyZone).toHaveBeenCalledWith({
        createManyZoneDto: { bulk: component.sanitizeData(event) },
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

    component.importZonesConfig(event);

    expect(component.getZones).toHaveBeenCalled();
  });
});
