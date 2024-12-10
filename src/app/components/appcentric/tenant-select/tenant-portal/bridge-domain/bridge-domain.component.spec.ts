/* eslint-disable */
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import {
  MockNgxSmartModalComponent,
  MockFontAwesomeComponent,
  MockComponent,
  MockIconButtonComponent,
  MockImportExportComponent,
  MockYesNoModalComponent,
} from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';

import { BridgeDomainComponent } from './bridge-domain.component';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { of, Subject, Subscription } from 'rxjs';
import { BridgeDomain, V2AppCentricBridgeDomainsService, V2AppCentricVrfsService } from 'client';
import { BridgeDomainModalDto } from 'src/app/models/appcentric/bridge-domain-modal-dto';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { SubnetModalDto } from 'src/app/models/network/subnet-modal-dto';

describe('BridgeDomainComponent', () => {
  let component: BridgeDomainComponent;
  let fixture: ComponentFixture<BridgeDomainComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        BridgeDomainComponent,
        MockNgxSmartModalComponent,
        MockFontAwesomeComponent,
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
        MockIconButtonComponent,
        MockImportExportComponent,
        MockYesNoModalComponent,
        MockComponent({ selector: 'app-bridge-domain-modal', inputs: ['tenantId'] }),
        MockComponent({ selector: 'app-subnets-modal', inputs: ['tenantId'] }),
      ],
      imports: [HttpClientModule, RouterTestingModule],
      providers: [
        MockProvider(NgxSmartModalService),
        MockProvider(V2AppCentricBridgeDomainsService),
        MockProvider(V2AppCentricVrfsService),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BridgeDomainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('importBridgeDomainsConfig', () => {
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
        setModalData: jest.fn(),
      } as any;
    });

    it('should display a confirmation modal with the correct message', () => {
      const event = [{ name: 'Bridge Domain 1' }, { name: 'Bridge Domain 2' }] as any;
      const modalDto = new YesNoModalDto('Import Bridge Domain', `Are you sure you would like to import ${event.length} Bridge Domains?`);
      const subscribeToYesNoModalSpy = jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal');

      component.importBridgeDomains(event);

      expect(subscribeToYesNoModalSpy).toHaveBeenCalledWith(modalDto, component['ngx'], expect.any(Function), expect.any(Function));
    });

    it('should import bridge domains and refresh the table on confirmation', () => {
      const event = [{ name: 'Bridge Domain 1' }, { name: 'Bridge Domain 2' }] as any;
      jest.spyOn(component, 'getBridgeDomains');
      jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal').mockImplementation((modalDto, ngx, onConfirm, onClose) => {
        onConfirm();

        expect(component['bridgeDomainService'].createManyBridgeDomain).toHaveBeenCalledWith({
          createManyBridgeDomainDto: { bulk: component.sanitizeData(event) },
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

      component.importBridgeDomains(event);

      expect(component.getBridgeDomains).toHaveBeenCalled();
    });
  });

  it('should delete bridge domain', () => {
    const bridgeDomainToDelete = { id: '123', description: 'Bye!' } as BridgeDomain;
    const subscribeToYesNoModalSpy = jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal');
    component.deleteBridgeDomain(bridgeDomainToDelete);
    const getAppProfilesMock = jest.spyOn(component['bridgeDomainService'], 'getManyBridgeDomain');
    expect(subscribeToYesNoModalSpy).toHaveBeenCalled();
    expect(getAppProfilesMock).toHaveBeenCalled();
  });

  it('should restore bridge domain', () => {
    const bridgeDomain = { id: '1', deletedAt: true } as any;
    jest.spyOn(component['bridgeDomainService'], 'restoreOneBridgeDomain').mockReturnValue(of({} as any));
    jest.spyOn(component, 'getBridgeDomains');
    component.restoreBridgeDomain(bridgeDomain);
    expect(component['bridgeDomainService'].restoreOneBridgeDomain).toHaveBeenCalledWith({ id: bridgeDomain.id });
    expect(component.getBridgeDomains).toHaveBeenCalled();
  });

  it('should routely search params when filtered results is true', () => {
    const bridgeDomain = { id: '1', deletedAt: true } as any;
    jest.spyOn(component['bridgeDomainService'], 'restoreOneBridgeDomain').mockReturnValue(of({} as any));

    const getAppProfilesSpy = jest.spyOn(component, 'getBridgeDomains');
    const params = { searchString: '', filteredResults: true, searchColumn: 'name', searchText: 'test' };
    jest.spyOn(component['tableContextService'], 'getSearchLocalStorage').mockReturnValue(params);

    component.restoreBridgeDomain(bridgeDomain);

    // expect(component.tableComponentDto.searchColumn).toBe(params.searchColumn);
    // expect(component.tableComponentDto.searchText).toBe(params.searchText);
    expect(getAppProfilesSpy).toHaveBeenCalledWith(params);
  });

  describe('openBridgeDomainModal', () => {
    describe('openModal', () => {
      beforeEach(() => {
        jest.spyOn(component, 'getBridgeDomains');
        jest.spyOn(component['ngx'], 'resetModalData');
      });

      it('should subscribe to bridgeDomainModal onCloseFinished event and unsubscribe afterwards', () => {
        const onCloseFinished = new Subject<void>();
        const mockModal = { onCloseFinished, open: jest.fn() };
        jest.spyOn(component['ngx'], 'getModal').mockReturnValue(mockModal as any);

        const unsubscribeSpy = jest.spyOn(Subscription.prototype, 'unsubscribe');

        component.subscribeToBridgeDomainModal();

        expect(component['ngx'].getModal).toHaveBeenCalledWith('bridgeDomainModal');
        expect(component.bridgeDomainModalSubscription).toBeDefined();

        onCloseFinished.next();

        expect(component.getBridgeDomains).toHaveBeenCalled();
        expect(component['ngx'].resetModalData).toHaveBeenCalledWith('bridgeDomainModal');

        expect(unsubscribeSpy).toHaveBeenCalled();
      });
      it('should call ngx.setModalData and ngx.getModal().open', () => {
        const bridgeDomain = { id: 1, name: 'Test App Profile' } as any;
        component.tenantId = { id: '1' } as any;
        component.openBridgeDomainModal(ModalMode.Edit, bridgeDomain);

        expect(component['ngx'].setModalData).toHaveBeenCalledWith(expect.any(BridgeDomainModalDto), 'bridgeDomainModal');
        expect(component['ngx'].getModal).toHaveBeenCalledWith('bridgeDomainModal');

        const modal = component['ngx'].getModal('bridgeDomainModal');
        expect(modal).toBeDefined();
      });

      it('should subscribe to subnetModal onCloseFinished event and unsubscribe afterwards', () => {
        const onCloseFinished = new Subject<void>();
        const mockModal = { onCloseFinished, open: jest.fn() };
        jest.spyOn(component['ngx'], 'getModal').mockReturnValue(mockModal as any);

        const unsubscribeSpy = jest.spyOn(Subscription.prototype, 'unsubscribe');

        component.subscribeToSubnetsModal();

        expect(component['ngx'].getModal).toHaveBeenCalledWith('subnetsModal');
        expect(component.subnetsModalSubscription).toBeDefined();

        onCloseFinished.next();

        expect(component['ngx'].resetModalData).toHaveBeenCalledWith('subnetsModal');

        expect(unsubscribeSpy).toHaveBeenCalled();
      });

      it('should run onInit', () => {
        const bridgeDomainsSpy = jest.spyOn(component, 'getBridgeDomains');
        const vrfsSpy = jest.spyOn(component, 'getVrfs');

        component.ngOnInit();
        expect(bridgeDomainsSpy).toHaveBeenCalled();
        expect(vrfsSpy).toHaveBeenCalled();
      });
    });
  });
});
