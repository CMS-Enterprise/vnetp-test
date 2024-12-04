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

  it('should delete app profile', () => {
    const contractToDelete = { id: '123', description: 'Bye!' } as Contract;
    const subscribeToYesNoModalSpy = jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal');
    component.deleteContract(contractToDelete);
    const getContractsMock = jest.spyOn(component['contractService'], 'getManyContract');
    expect(subscribeToYesNoModalSpy).toHaveBeenCalled();
    expect(getContractsMock).toHaveBeenCalled();
  });

  it('should restore application profile', () => {
    const contract = { id: '1', deletedAt: true } as any;
    jest.spyOn(component['contractService'], 'restoreOneContract').mockReturnValue(of({} as any));
    jest.spyOn(component, 'getContracts');
    component.restoreContract(contract);
    expect(component['contractService'].restoreOneContract).toHaveBeenCalledWith({ id: contract.id });
    expect(component.getContracts).toHaveBeenCalled();
  });

  it('should apply search params when filtered results is true', () => {
    const contract = { id: '1', deletedAt: true } as any;
    jest.spyOn(component['contractService'], 'restoreOneContract').mockReturnValue(of({} as any));

    const getAppProfilesSpy = jest.spyOn(component, 'getContracts');
    const params = { searchString: '', filteredResults: true, searchColumn: 'name', searchText: 'test' };
    jest.spyOn(component['tableContextService'], 'getSearchLocalStorage').mockReturnValue(params);

    component.restoreContract(contract);

    // expect(component.tableComponentDto.searchColumn).toBe(params.searchColumn);
    // expect(component.tableComponentDto.searchText).toBe(params.searchText);
    expect(getAppProfilesSpy).toHaveBeenCalledWith(params);
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
        const contract = { id: 1, name: 'Test App Profile' } as any;
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
