/* eslint-disable */
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { MockIconButtonComponent, MockFontAwesomeComponent, MockComponent, MockImportExportComponent } from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';
import { ProvidedContractComponent } from './provided-contract.component';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { Subscription } from 'rxjs';
import {
  Contract,
  V2AppCentricContractsService,
  V2AppCentricEndpointGroupsService,
  V2AppCentricEndpointSecurityGroupsService,
} from 'client';

describe('ProvidedContractsComponent', () => {
  let component: ProvidedContractComponent;
  let fixture: ComponentFixture<ProvidedContractComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        ProvidedContractComponent,
        MockIconButtonComponent,
        MockFontAwesomeComponent,
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
        MockImportExportComponent,
      ],
      imports: [HttpClientModule, NgSelectModule, FormsModule],
      providers: [
        MockProvider(NgxSmartModalService),
        MockProvider(V2AppCentricEndpointGroupsService),
        MockProvider(V2AppCentricEndpointSecurityGroupsService),
        MockProvider(V2AppCentricContractsService),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProvidedContractComponent);
    component = fixture.componentInstance;
    component.endpointGroupId = 'uuid';
    component.endpointSecurityGroupId = 'uuid';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should remove provided contract', () => {
    const contractToDelete = { id: '123', description: 'Bye!', endpointGroupId: 'epgId-123', tenantId: 'tenantId-123' } as Contract;
    component.removeContract(contractToDelete);
    const getProvidedContractsMock = jest.spyOn(component['endpointGroupsService'], 'getOneEndpointGroup');
    expect(getProvidedContractsMock).toHaveBeenCalled();
  });

  it('should add provided contract', () => {
    component.selectedContract = { id: '123', tenantId: 'tenantId-123' };
    component.addContract();
    const getProvidedContractsMock = jest.spyOn(component['endpointGroupsService'], 'getOneEndpointGroup');
    expect(getProvidedContractsMock).toHaveBeenCalled();
  });

  describe('importProvidedContractsEpgRelationonfig', () => {
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
      const event = [{ name: 'Provided Contract 1' }, { name: 'Provided Contract 1' }] as any;
      const modalDto = new YesNoModalDto(
        'Import Provided Contracts',
        `Are you sure you would like to import ${event.length} Provided Contracts?`,
      );
      const subscribeToYesNoModalSpy = jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal');

      component.importProvidedContractRelation(event);

      expect(subscribeToYesNoModalSpy).toHaveBeenCalledWith(modalDto, component['ngx'], expect.any(Function), expect.any(Function));
    });

    it('should import provided contracts to EPG relations and refresh on confirmation', () => {
      const event = [{ name: 'Provided Contract 1' }, { name: 'Provided Contract 1' }] as any;
      jest.spyOn(component, 'getEpgProvidedContracts');
      jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal').mockImplementation((modalDto, ngx, onConfirm, onClose) => {
        onConfirm();

        expect(component['endpointGroupsService'].addManyProvidedContractsToEndpointGroupEndpointGroup).toHaveBeenCalledTimes(1);

        mockNgxSmartModalComponent.onCloseFinished.subscribe((modal: typeof mockNgxSmartModalComponent) => {
          const data = modal.getData() as YesNoModalDto;
          modal.removeData();
          if (data && data.modalYes) {
            onConfirm();
          }
        });

        return new Subscription();
      });

      component.importProvidedContractRelation(event);

      expect(component.getEpgProvidedContracts).toHaveBeenCalled();
    });

    it('should import provided contracts to ESG relations and refresh on confirmation', () => {
      const event = [{ name: 'Provided Contract 1' }, { name: 'Provided Contract 1' }] as any;
      jest.spyOn(component, 'getEsgProvidedContracts');
      jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal').mockImplementation((modalDto, ngx, onConfirm, onClose) => {
        onConfirm();

        expect(
          component['endpointSecurityGroupService'].addManyProvidedContractsToEndpointSecurityGroupEndpointSecurityGroup,
        ).toHaveBeenCalledTimes(1);

        mockNgxSmartModalComponent.onCloseFinished.subscribe((modal: typeof mockNgxSmartModalComponent) => {
          const data = modal.getData() as YesNoModalDto;
          modal.removeData();
          if (data && data.modalYes) {
            onConfirm();
          }
        });

        return new Subscription();
      });
      component.mode = 'esg';

      component.importProvidedContractRelation(event);

      expect(component.getEsgProvidedContracts).toHaveBeenCalled();
    });
  });
});
