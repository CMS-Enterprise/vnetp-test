import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MockComponent,
  MockFontAwesomeComponent,
  MockIconButtonComponent,
  MockImportExportComponent,
  MockTooltipComponent,
  MockYesNoModalComponent,
} from 'src/test/mock-components';
import { NgxSmartModalModule, NgxSmartModalService } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TiersComponent } from './tiers.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { RouterTestingModule } from '@angular/router/testing';
import { ResolvePipe } from 'src/app/pipes/resolve.pipe';
import { MockProvider } from 'src/test/mock-providers';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { of, Subscription, throwError } from 'rxjs';
import {
  V1TiersService,
  V1TierGroupsService,
  V1NetworkSecurityFirewallRuleGroupsService,
  V1NetworkSecurityNatRuleGroupsService,
  V1NetworkSecurityServiceObjectsService,
  V1NetworkSecurityServiceObjectGroupsService,
  V1NetworkSecurityNetworkObjectsService,
  V1NetworkSecurityNetworkObjectGroupsService,
} from 'client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { TierModalDto } from 'src/app/models/network/tier-modal-dto';

describe('TiersComponent', () => {
  let component: TiersComponent;
  let fixture: ComponentFixture<TiersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NgxSmartModalModule, NgxPaginationModule, FormsModule, ReactiveFormsModule, RouterTestingModule.withRoutes([])],
      declarations: [
        MockComponent('app-tier-modal'),
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
        MockComponent({ selector: 'app-type-delete-modal', inputs: ['objectToDelete', 'objectType'] }),
        MockFontAwesomeComponent,
        MockIconButtonComponent,
        MockImportExportComponent,
        MockTooltipComponent,
        MockYesNoModalComponent,
        ResolvePipe,
        TiersComponent,
      ],
      providers: [
        MockProvider(DatacenterContextService),
        MockProvider(NgxSmartModalService),
        MockProvider(V1TierGroupsService, { getManyTierGroup: () => of([]) }),
        MockProvider(V1TiersService, { getManyTier: () => of([]) }),
        MockProvider(V1NetworkSecurityFirewallRuleGroupsService),
        MockProvider(V1NetworkSecurityNatRuleGroupsService),
        MockProvider(V1NetworkSecurityNetworkObjectsService),
        MockProvider(V1NetworkSecurityNetworkObjectGroupsService),
        MockProvider(V1NetworkSecurityServiceObjectsService),
        MockProvider(V1NetworkSecurityServiceObjectGroupsService),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TiersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getTiers on table event', () => {
    jest.spyOn(component['tierService'], 'getManyTier').mockReturnValue(of({} as any));
    component.onTableEvent({} as any);
    expect(component['tierService'].getManyTier).toHaveBeenCalled();
  });

  describe('getTiers', () => {
    it('should getTiers', () => {
      jest.spyOn(component['tierService'], 'getManyTier').mockReturnValue(of({} as any));
      component.getTiers();
      expect(component['tierService'].getManyTier).toHaveBeenCalled();
    });

    it('should handle error when getTiers fails', () => {
      jest.spyOn(component['tierService'], 'getManyTier').mockReturnValue(throwError('Error'));
      component.getTiers();

      const errorSubscription = component['tierService']
        .getManyTier({
          filter: [`datacenterId||eq||${component.currentDatacenter.id}`],
          page: component.tableComponentDto.page,
          perPage: component.tableComponentDto.perPage,
          sort: ['updatedAt,ASC'],
        })
        .subscribe(
          () => {},
          () => {
            expect(component.tiers).toEqual([]);
          },
          () => {},
        );

      errorSubscription.unsubscribe();
    });
  });

  describe('getExportTiers', () => {
    it('should getExportTiers', () => {
      jest.spyOn(component['networkObjectService'], 'getManyNetworkObject').mockReturnValue(of({} as any));
      jest.spyOn(component['networkObjectGroupService'], 'getManyNetworkObjectGroup').mockReturnValue(of({} as any));
      jest.spyOn(component['serviceObjectService'], 'getManyServiceObject').mockReturnValue(of({} as any));
      jest.spyOn(component['serviceObjectGroupService'], 'getManyServiceObjectGroup').mockReturnValue(of({} as any));
      jest.spyOn(component['firewallRuleGroupService'], 'getManyFirewallRuleGroup').mockReturnValue(of({} as any));
      jest.spyOn(component['natRuleGroupService'], 'getManyNatRuleGroup').mockReturnValue(of({} as any));

      component.tiers.data = [{ name: 'tier1' }] as any;
      component.getExportTiers();
      expect(component['networkObjectService'].getManyNetworkObject).toHaveBeenCalled();
      expect(component['networkObjectGroupService'].getManyNetworkObjectGroup).toHaveBeenCalled();
      expect(component['serviceObjectService'].getManyServiceObject).toHaveBeenCalled();
      expect(component['serviceObjectGroupService'].getManyServiceObjectGroup).toHaveBeenCalled();
      expect(component['firewallRuleGroupService'].getManyFirewallRuleGroup).toHaveBeenCalled();
      expect(component['natRuleGroupService'].getManyNatRuleGroup).toHaveBeenCalled();
    });
  });

  describe('openTierModal', () => {
    it('should call ngx.setModalData and ngx.getModal().open', () => {
      // const mockWindow = jest.spyOn(window['location'], 'reload')
      Object.defineProperty(window, 'location', {
        value: { reload: jest.fn() },
      });
      const tier = { id: 1, name: 'Test Tier' } as any;
      component.currentDatacenter = { id: '1' } as any;
      component.openTierModal(ModalMode.Edit, tier);

      expect(component['ngx'].setModalData).toHaveBeenCalledWith(expect.any(TierModalDto), 'tierModal');
      expect(component['ngx'].getModal).toHaveBeenCalledWith('tierModal');

      const modal = component['ngx'].getModal('tierModal');
      expect(modal).toBeDefined();
      expect(component['datacenterContextService'].lockDatacenter).toHaveBeenCalled();
    });
  });

  describe('deleteTier', () => {
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
      } as any;
    });
    it('should open type delete modal', () => {
      const tier = { id: '1', deletedAt: 'now' } as any;

      const openDeleteSpy = jest.spyOn(component, 'subscribeToTypeDeleteModal').mockImplementation(() => {
        mockNgxSmartModalComponent.onCloseFinished.subscribe(() => {
          expect(component.getTiers()).toHaveBeenCalled();
        });
        return new Subscription();
      });

      component.currentDatacenter = { id: '1' } as any;
      jest.spyOn(component['tierService'], 'getManyTier').mockReturnValue(of({} as any));

      component.deleteTier(tier);

      expect(component['ngx'].getModal).toHaveBeenCalledWith('typeDeleteModal');
      expect(openDeleteSpy).toHaveBeenCalled();
      // expect(deleteOneTierSpy).toHaveBeenCalled();
      // expect(softDeleteOneTierSpy).toHaveBeenCalled();

      const modal = component['ngx'].getModal('typeDeleteModal');
      expect(modal).toBeDefined();
      // expect(component['datacenterContextService'].lockDatacenter).toHaveBeenCalled();

      // expect(component['entityService'].deleteEntity).toHaveBeenCalled();
      // expect(deleteOneTierSpy).toHaveBeenCalledWith({ id: tier.id });
      // expect(softDeleteOneTierSpy).toHaveBeenCalledWith({ id: tier.id });
      // expect(component['tierService'].getManyTier).toHaveBeenCalled();
    });

    it('should delete tier', () => {
      const tier = { id: '1' } as any;
      const deleteOneTierSpy = jest.spyOn(component['tierService'], 'deleteOneTier').mockResolvedValue({} as never);
      const softDeleteOneTierSpy = jest.spyOn(component['tierService'], 'softDeleteOneTier').mockResolvedValue({} as never);

      jest.spyOn(component['entityService'], 'deleteEntity').mockImplementationOnce((entity, options) => {
        options.onSuccess();
        return new Subscription();
      });

      // const openDeleteSpy = jest.spyOn(component, 'subscribeToTypeDeleteModal').mockImplementation(() => {

      //         mockNgxSmartModalComponent.onCloseFinished.subscribe((modal: typeof mockNgxSmartModalComponent) => {
      //           expect(component.getTiers()).toHaveBeenCalled()
      //         });
      //         return new Subscription();
      //       });

      component.currentDatacenter = { id: '1' } as any;
      jest.spyOn(component['tierService'], 'getManyTier').mockReturnValue(of({} as any));

      component.deleteTier(tier);

      // expect(component['ngx'].getModal).toHaveBeenCalledWith('typeDeleteModal');
      // expect(openDeleteSpy).toHaveBeenCalled();
      expect(deleteOneTierSpy).toHaveBeenCalled();
      expect(softDeleteOneTierSpy).toHaveBeenCalled();

      // const modal = component['ngx'].getModal('typeDeleteModal');
      // expect(modal).toBeDefined();
      // expect(component['datacenterContextService'].lockDatacenter).toHaveBeenCalled();

      expect(component['entityService'].deleteEntity).toHaveBeenCalled();
      expect(deleteOneTierSpy).toHaveBeenCalledWith({ id: tier.id });
      // expect(softDeleteOneTierSpy).toHaveBeenCalledWith({ id: tier.id });
      // expect(component['tierService'].getManyTier).toHaveBeenCalled();
    });
  });

  it('should restore tier', () => {
    const tier = { id: '1', deletedAt: true } as any;
    jest.spyOn(component['tierService'], 'restoreOneTier').mockReturnValue(of({} as any));
    jest.spyOn(component, 'getTiers');
    component.restoreTier(tier);
    expect(component['tierService'].restoreOneTier).toHaveBeenCalledWith({ id: tier.id });
    expect(component.getTiers).toHaveBeenCalled();
  });
});
