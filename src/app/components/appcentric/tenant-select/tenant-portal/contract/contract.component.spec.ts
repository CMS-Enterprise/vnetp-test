/* eslint-disable */
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import {
  MockComponent,
  MockFontAwesomeComponent,
  MockIconButtonComponent,
  MockImportExportComponent,
  MockNgxSmartModalComponent,
  MockYesNoModalComponent,
} from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';

import { ContractComponent } from './contract.component';
import { Contract, V2AppCentricContractsService } from 'client';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { of, Subject, Subscription } from 'rxjs';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { ContractModalDto } from 'src/app/models/appcentric/contract-modal-dto';

describe('ContractComponent', () => {
  let component: ContractComponent;
  let fixture: ComponentFixture<ContractComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        ContractComponent,
        MockNgxSmartModalComponent,
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
        MockFontAwesomeComponent,
        MockImportExportComponent,
        MockIconButtonComponent,
        MockYesNoModalComponent,
        MockComponent({ selector: 'app-contract-modal', inputs: ['tenantId'] }),
      ],
      imports: [RouterTestingModule, HttpClientModule],
      providers: [MockProvider(NgxSmartModalService), MockProvider(V2AppCentricContractsService)],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContractComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('importContractsConfig', () => {
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
      const event = [{ name: 'Contract 1' }, { name: 'v 2' }] as any;
      const modalDto = new YesNoModalDto('Import Contracts', `Are you sure you would like to import ${event.length} Contracts?`);
      const subscribeToYesNoModalSpy = jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal');

      component.importContracts(event);

      expect(subscribeToYesNoModalSpy).toHaveBeenCalledWith(modalDto, component['ngx'], expect.any(Function), expect.any(Function));
    });

    it('should import contracts and refresh the table on confirmation', () => {
      const event = [{ name: 'Contract 1' }, { name: 'Contract 2' }] as any;
      jest.spyOn(component, 'getContracts');
      jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal').mockImplementation((modalDto, ngx, onConfirm, onClose) => {
        onConfirm();

        expect(component['contractService'].createManyContract).toHaveBeenCalledWith({
          createManyContractDto: { bulk: component.sanitizeData(event) },
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

      component.importContracts(event);

      expect(component.getContracts).toHaveBeenCalled();
    });
  });

  it('should delete contract', () => {
    const contractToDelete = { id: '123', name: 'Test Contract', description: 'Bye!' } as any;
    const subscribeToYesNoModalSpy = jest
      .spyOn(SubscriptionUtil, 'subscribeToYesNoModal')
      .mockImplementation((modalDto, ngx, onConfirm, onClose) => {
        // Just call onConfirm immediately for testing
        onConfirm();
        return new Subscription();
      });
    jest.spyOn(component['contractService'], 'softDeleteOneContract').mockReturnValue(of({} as any));
    jest.spyOn(component as any, 'refreshContracts');

    component.deleteContract(contractToDelete);

    expect(subscribeToYesNoModalSpy).toHaveBeenCalled();
    expect(component['contractService'].softDeleteOneContract).toHaveBeenCalledWith({ id: '123' });
  });

  it('should restore contract', () => {
    const contract = { id: '1', name: 'Test Contract', deletedAt: true } as any;
    const subscribeToYesNoModalSpy = jest
      .spyOn(SubscriptionUtil, 'subscribeToYesNoModal')
      .mockImplementation((modalDto, ngx, onConfirm, onClose) => {
        // Just call onConfirm immediately for testing
        onConfirm();
        return new Subscription();
      });
    jest.spyOn(component['contractService'], 'restoreOneContract').mockReturnValue(of({} as any));
    jest.spyOn(component as any, 'refreshContracts');

    component.restoreContract(contract);

    expect(subscribeToYesNoModalSpy).toHaveBeenCalled();
    expect(component['contractService'].restoreOneContract).toHaveBeenCalledWith({ id: '1' });
  });

  it('should apply search params when filtered results is true', () => {
    const getContractsSpy = jest.spyOn(component, 'getContracts');
    const params = { searchString: '', filteredResults: true, searchColumn: 'name', searchText: 'test' };
    jest.spyOn(component['tableContextService'], 'getSearchLocalStorage').mockReturnValue(params);

    // Test refreshContracts helper method
    component['refreshContracts']();

    expect(getContractsSpy).toHaveBeenCalledWith(params);
  });

  describe('openContractModal', () => {
    describe('openModal', () => {
      beforeEach(() => {
        jest.spyOn(component, 'getContracts');
        jest.spyOn(component['ngx'], 'resetModalData');
      });

      it('should subscribe to contractModal onCloseFinished event and unsubscribe afterwards', () => {
        const onCloseFinished = new Subject<void>();
        const mockModal = { onCloseFinished, open: jest.fn() };
        jest.spyOn(component['ngx'], 'getModal').mockReturnValue(mockModal as any);

        const unsubscribeSpy = jest.spyOn(Subscription.prototype, 'unsubscribe');

        component.subscribeToContractModal();

        expect(component['ngx'].getModal).toHaveBeenCalledWith('contractModal');
        expect(component.contractModalSubscription).toBeDefined();

        onCloseFinished.next();

        expect(component.getContracts).toHaveBeenCalled();
        expect(component['ngx'].resetModalData).toHaveBeenCalledWith('contractModal');

        expect(unsubscribeSpy).toHaveBeenCalled();
      });
      it('should call ngx.setModalData and ngx.getModal().open', () => {
        const contract = { id: 1, name: 'Test Contract' } as any;
        component.tenantId = { id: '1' } as any;
        component.openContractModal(ModalMode.Edit, contract);

        expect(component['ngx'].setModalData).toHaveBeenCalledWith(expect.any(ContractModalDto), 'contractModal');
        expect(component['ngx'].getModal).toHaveBeenCalledWith('contractModal');

        const modal = component['ngx'].getModal('contractModal');
        expect(modal).toBeDefined();
      });
    });
  });
});
