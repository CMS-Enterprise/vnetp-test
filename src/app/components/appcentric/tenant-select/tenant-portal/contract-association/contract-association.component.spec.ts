/* eslint-disable */
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { MockFontAwesomeComponent, MockComponent, MockIconButtonComponent, MockImportExportComponent } from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';
import { ContractAssociationComponent } from './contract-association.component';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { Subscription } from 'rxjs';
import {
  Contract,
  V2AppCentricContractsService,
  V2AppCentricEndpointGroupsService,
  V2AppCentricEndpointSecurityGroupsService,
} from 'client';

describe('ContractAssociationComponent', () => {
  let component: ContractAssociationComponent;
  let fixture: ComponentFixture<ContractAssociationComponent>;
  let endpointSecurityGroupsService: V2AppCentricEndpointSecurityGroupsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        ContractAssociationComponent,
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

    endpointSecurityGroupsService = TestBed.inject(V2AppCentricEndpointSecurityGroupsService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContractAssociationComponent);
    component = fixture.componentInstance;
    component.endpointGroupId = 'uuid';
    component.endpointSecurityGroupId = 'uuid';
    component.tenantId = 'tenantId';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Consumed Contracts', () => {
    beforeEach(() => {
      component.contractType = 'consumed';
    });

    it('should remove consumed contract from EPG', () => {
      component.mode = 'epg';
      const contractToDelete = {
        id: '123',
        name: 'Test Contract',
        description: 'Bye!',
        endpointGroupId: 'epgId-123',
        tenantId: 'tenantId-123',
      } as Contract;
      component.removeContract(contractToDelete);
      const getContractsMock = jest.spyOn(component['endpointGroupsService'], 'getOneEndpointGroup');
      expect(getContractsMock).toHaveBeenCalled();
    });

    it('should add consumed contract to EPG', () => {
      component.mode = 'epg';
      component.selectedContract = { id: '123', tenantId: 'tenantId-123' } as Contract;
      component.addContract();
      const getContractsMock = jest.spyOn(component['endpointGroupsService'], 'getOneEndpointGroup');
      expect(getContractsMock).toHaveBeenCalled();
    });

    it('should remove consumed contract from ESG', () => {
      component.mode = 'esg';
      const contractToDelete = {
        id: '123',
        name: 'Test Contract',
        description: 'Bye!',
        endpointSecurityGroupId: 'esgId-123',
        tenantId: 'tenantId-123',
      } as Contract;

      // Mock the modal service behavior
      jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal').mockImplementation((dto, service, onConfirm) => {
        onConfirm();
        return new Subscription();
      });

      const removeSpy = jest
        .spyOn(endpointSecurityGroupsService, 'removeConsumedContractToEndpointSecurityGroupEndpointSecurityGroup')
        .mockReturnValue({ subscribe: jest.fn(fn => fn()) } as any);

      component.removeContract(contractToDelete);

      expect(removeSpy).toHaveBeenCalledWith({
        endpointSecurityGroupId: component.endpointSecurityGroupId,
        contractId: contractToDelete.id,
      });
    });

    it('should add consumed contract to ESG', () => {
      component.mode = 'esg';
      component.selectedContract = { id: '123', tenantId: 'tenantId-123' } as Contract;
      component.addContract();
      const getContractsMock = jest.spyOn(component['endpointSecurityGroupsService'], 'getOneEndpointSecurityGroup');
      expect(getContractsMock).toHaveBeenCalled();
    });
  });

  describe('Provided Contracts', () => {
    beforeEach(() => {
      component.contractType = 'provided';
    });

    it('should remove provided contract from EPG', () => {
      component.mode = 'epg';
      const contractToDelete = {
        id: '123',
        name: 'Test Contract',
        description: 'Bye!',
        endpointGroupId: 'epgId-123',
        tenantId: 'tenantId-123',
      } as Contract;
      component.removeContract(contractToDelete);
      const getContractsMock = jest.spyOn(component['endpointGroupsService'], 'getOneEndpointGroup');
      expect(getContractsMock).toHaveBeenCalled();
    });

    it('should add provided contract to EPG', () => {
      component.mode = 'epg';
      component.selectedContract = { id: '123', tenantId: 'tenantId-123' } as Contract;
      component.addContract();
      const getContractsMock = jest.spyOn(component['endpointGroupsService'], 'getOneEndpointGroup');
      expect(getContractsMock).toHaveBeenCalled();
    });

    it('should remove provided contract from ESG', () => {
      component.mode = 'esg';
      const contractToDelete = {
        id: '123',
        name: 'Test Contract',
        description: 'Bye!',
        endpointSecurityGroupId: 'esgId-123',
        tenantId: 'tenantId-123',
      } as Contract;

      // Mock the modal service behavior
      jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal').mockImplementation((dto, service, onConfirm) => {
        onConfirm();
        return new Subscription();
      });

      const removeSpy = jest
        .spyOn(endpointSecurityGroupsService, 'removeProvidedContractToEndpointSecurityGroupEndpointSecurityGroup')
        .mockReturnValue({ subscribe: jest.fn(fn => fn()) } as any);

      component.removeContract(contractToDelete);

      expect(removeSpy).toHaveBeenCalledWith({
        endpointSecurityGroupId: component.endpointSecurityGroupId,
        contractId: contractToDelete.id,
      });
    });

    it('should add provided contract to ESG', () => {
      component.mode = 'esg';
      component.selectedContract = { id: '123', tenantId: 'tenantId-123' } as Contract;
      component.addContract();
      const getContractsMock = jest.spyOn(component['endpointSecurityGroupsService'], 'getOneEndpointSecurityGroup');
      expect(getContractsMock).toHaveBeenCalled();
    });
  });

  describe('Intra Contracts', () => {
    beforeEach(() => {
      component.contractType = 'intra';
    });

    it('should remove intra contract from EPG', () => {
      component.mode = 'epg';
      const contractToDelete = {
        id: '123',
        name: 'Test Contract',
        description: 'Bye!',
        endpointGroupId: 'epgId-123',
        tenantId: 'tenantId-123',
      } as Contract;
      component.removeContract(contractToDelete);
      const getContractsMock = jest.spyOn(component['endpointGroupsService'], 'getOneEndpointGroup');
      expect(getContractsMock).toHaveBeenCalled();
    });

    it('should add intra contract to EPG', () => {
      component.mode = 'epg';
      component.selectedContract = { id: '123', tenantId: 'tenantId-123' } as Contract;
      component.addContract();
      const getContractsMock = jest.spyOn(component['endpointGroupsService'], 'getOneEndpointGroup');
      expect(getContractsMock).toHaveBeenCalled();
    });

    it('should remove intra contract from ESG', () => {
      component.mode = 'esg';
      const contractToDelete = {
        id: '123',
        name: 'Test Contract',
        description: 'Bye!',
        endpointSecurityGroupId: 'esgId-123',
        tenantId: 'tenantId-123',
      } as Contract;

      // Mock the modal service behavior
      jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal').mockImplementation((dto, service, onConfirm) => {
        onConfirm();
        return new Subscription();
      });

      const removeSpy = jest
        .spyOn(endpointSecurityGroupsService, 'removeIntraContractToEndpointSecurityGroupEndpointSecurityGroup')
        .mockReturnValue({ subscribe: jest.fn(fn => fn()) } as any);

      component.removeContract(contractToDelete);

      expect(removeSpy).toHaveBeenCalledWith({
        endpointSecurityGroupId: component.endpointSecurityGroupId,
        contractId: contractToDelete.id,
      });
    });

    it('should add intra contract to ESG', () => {
      component.mode = 'esg';
      component.selectedContract = { id: '123', tenantId: 'tenantId-123' } as Contract;
      component.addContract();
      const getContractsMock = jest.spyOn(component['endpointSecurityGroupsService'], 'getOneEndpointSecurityGroup');
      expect(getContractsMock).toHaveBeenCalled();
    });

    it('should not attempt bulk import for intra contracts', () => {
      const importSpy = jest.spyOn(component, 'importContractEpgRelation');
      component.importContractRelation([{ name: 'Test' }]);
      expect(importSpy).not.toHaveBeenCalled();
    });
  });

  describe('Import Contract Relations', () => {
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

      // Reset all mocks before each test
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    describe('Consumed Contracts', () => {
      beforeEach(() => {
        component.contractType = 'consumed';
        component.mode = 'epg'; // Set default mode for tests
      });

      it('should display a confirmation modal for importing consumed contracts', () => {
        const event = [{ name: 'Consumed Contract 1' }, { name: 'Consumed Contract 2' }] as any;

        // Mock the importContractEpgRelation to isolate the test
        const importSpy = jest.spyOn(component, 'importContractEpgRelation').mockImplementation(() => {});

        // Mock subscribeToYesNoModal so we know it's called with the right params
        const modalSpy = jest
          .spyOn(SubscriptionUtil, 'subscribeToYesNoModal')
          .mockImplementation((modalDto, service, onConfirm, onClose) => {
            return new Subscription();
          });

        // Call the method we're testing
        component.importContractRelation(event);

        // Verify modalSpy was called at least once
        expect(modalSpy).toHaveBeenCalled();

        // For the consumed contract case, method should call importContractEpgRelation
        // since we set mode to 'epg' in beforeEach
        expect(importSpy).toHaveBeenCalledWith(event);
      });

      it('should import consumed contracts to EPG relations and refresh the table on confirmation', () => {
        component.mode = 'epg';
        const event = [{ name: 'Consumed Contract 1' }, { name: 'Consumed Contract 2' }] as any;

        // Mock getEpgContracts to verify it gets called
        jest.spyOn(component, 'getEpgContracts').mockImplementation(() => {});

        // Mock the endpointGroupsService.addManyConsumedContractsToEndpointGroupEndpointGroup
        const addManySpy = jest
          .spyOn(component['endpointGroupsService'], 'addManyConsumedContractsToEndpointGroupEndpointGroup')
          .mockReturnValue({
            subscribe: jest.fn((success, error, complete) => {
              // Call the complete callback to simulate successful API call
              if (complete) complete();
              return {} as any;
            }),
          } as any);

        // Call the method we're testing directly since we're testing what happens after confirmation
        component.importContractEpgRelation(event);

        // Verify the service method was called
        expect(addManySpy).toHaveBeenCalled();

        // Verify getEpgContracts was called to refresh data
        expect(component.getEpgContracts).toHaveBeenCalled();
      });

      it('should import consumed contracts to ESG relations and refresh the table on confirmation', () => {
        component.mode = 'esg';
        const event = [{ name: 'Consumed Contract 1' }, { name: 'Consumed Contract 2' }] as any;

        // Mock getEsgContracts to verify it gets called
        jest.spyOn(component, 'getEsgContracts').mockImplementation(() => {});

        // Mock the endpointSecurityGroupsService.addManyConsumedContractsToEndpointSecurityGroupEndpointSecurityGroup
        const addManySpy = jest
          .spyOn(component['endpointSecurityGroupsService'], 'addManyConsumedContractsToEndpointSecurityGroupEndpointSecurityGroup')
          .mockReturnValue({
            subscribe: jest.fn((success, error, complete) => {
              // Call the complete callback to simulate successful API call
              if (complete) complete();
              return {} as any;
            }),
          } as any);

        // Call the method we're testing directly since we're testing what happens after confirmation
        component.importContractEsgRelation(event);

        // Verify the service method was called
        expect(addManySpy).toHaveBeenCalled();

        // Verify getEsgContracts was called to refresh data
        expect(component.getEsgContracts).toHaveBeenCalled();
      });
    });

    describe('Provided Contracts', () => {
      beforeEach(() => {
        component.contractType = 'provided';
        component.mode = 'epg'; // Set default mode for tests
      });

      it('should display a confirmation modal for importing provided contracts', () => {
        const event = [{ name: 'Provided Contract 1' }, { name: 'Provided Contract 2' }] as any;

        // Mock the importContractEpgRelation to isolate the test
        const importSpy = jest.spyOn(component, 'importContractEpgRelation').mockImplementation(() => {});

        // Mock subscribeToYesNoModal so we know it's called with the right params
        const modalSpy = jest
          .spyOn(SubscriptionUtil, 'subscribeToYesNoModal')
          .mockImplementation((modalDto, service, onConfirm, onClose) => {
            return new Subscription();
          });

        // Call the method we're testing
        component.importContractRelation(event);

        // Verify modalSpy was called at least once
        expect(modalSpy).toHaveBeenCalled();

        // For the provided contract case, method should call importContractEpgRelation
        // since we set mode to 'epg' in beforeEach
        expect(importSpy).toHaveBeenCalledWith(event);
      });

      it('should import provided contracts to EPG relations and refresh the table on confirmation', () => {
        component.mode = 'epg';
        const event = [{ name: 'Provided Contract 1' }, { name: 'Provided Contract 2' }] as any;

        // Mock getEpgContracts to verify it gets called
        jest.spyOn(component, 'getEpgContracts').mockImplementation(() => {});

        // Mock the endpointGroupsService.addManyProvidedContractsToEndpointGroupEndpointGroup
        const addManySpy = jest
          .spyOn(component['endpointGroupsService'], 'addManyProvidedContractsToEndpointGroupEndpointGroup')
          .mockReturnValue({
            subscribe: jest.fn((success, error, complete) => {
              // Call the complete callback to simulate successful API call
              if (complete) complete();
              return {} as any;
            }),
          } as any);

        // Call the method we're testing directly since we're testing what happens after confirmation
        component.importContractEpgRelation(event);

        // Verify the service method was called
        expect(addManySpy).toHaveBeenCalled();

        // Verify getEpgContracts was called to refresh data
        expect(component.getEpgContracts).toHaveBeenCalled();
      });

      it('should import provided contracts to ESG relations and refresh the table on confirmation', () => {
        component.mode = 'esg';
        const event = [{ name: 'Provided Contract 1' }, { name: 'Provided Contract 2' }] as any;

        // Mock getEsgContracts to verify it gets called
        jest.spyOn(component, 'getEsgContracts').mockImplementation(() => {});

        // Mock the endpointSecurityGroupsService.addManyProvidedContractsToEndpointSecurityGroupEndpointSecurityGroup
        const addManySpy = jest
          .spyOn(component['endpointSecurityGroupsService'], 'addManyProvidedContractsToEndpointSecurityGroupEndpointSecurityGroup')
          .mockReturnValue({
            subscribe: jest.fn((success, error, complete) => {
              // Call the complete callback to simulate successful API call
              if (complete) complete();
              return {} as any;
            }),
          } as any);

        // Call the method we're testing directly since we're testing what happens after confirmation
        component.importContractEsgRelation(event);

        // Verify the service method was called
        expect(addManySpy).toHaveBeenCalled();

        // Verify getEsgContracts was called to refresh data
        expect(component.getEsgContracts).toHaveBeenCalled();
      });
    });
  });

  describe('Component Lifecycle', () => {
    it('should initialize with correct configuration based on contractType', () => {
      component.contractType = 'consumed';
      component.setupConfig();
      expect(component.config.description).toBe('Consumed Contracts');

      component.contractType = 'provided';
      component.setupConfig();
      expect(component.config.description).toBe('Provided Contracts');

      component.contractType = 'intra';
      component.setupConfig();
      expect(component.config.description).toBe('Intra Contracts');
    });

    it('should update configuration when contractType changes', () => {
      const setupConfigSpy = jest.spyOn(component, 'setupConfig');

      component.contractType = 'consumed';
      component.ngOnChanges({
        contractType: {
          currentValue: 'consumed',
          previousValue: 'provided',
          firstChange: false,
          isFirstChange: () => false,
        },
      });

      expect(setupConfigSpy).toHaveBeenCalled();
    });

    it('should clear selected contract', () => {
      component.selectedContract = { id: '123' } as Contract;
      component.clearSelectedContract();
      expect(component.selectedContract).toBeNull();
    });
  });
});
