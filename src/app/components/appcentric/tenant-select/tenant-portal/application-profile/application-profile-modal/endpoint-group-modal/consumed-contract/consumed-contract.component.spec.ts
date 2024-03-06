import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { MockFontAwesomeComponent, MockComponent, MockIconButtonComponent, MockImportExportComponent } from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';
import { ConsumedContractComponent } from './consumed-contract.component';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { Subscription } from 'rxjs';
import { V2AppCentricContractsService, V2AppCentricEndpointGroupsService } from 'client';

describe('ConsumedContractsComponent', () => {
  let component: ConsumedContractComponent;
  let fixture: ComponentFixture<ConsumedContractComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        ConsumedContractComponent,
        MockIconButtonComponent,
        MockFontAwesomeComponent,
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
        MockImportExportComponent,
      ],
      imports: [HttpClientModule, NgSelectModule, FormsModule],
      providers: [
        MockProvider(NgxSmartModalService),
        MockProvider(V2AppCentricEndpointGroupsService),
        MockProvider(V2AppCentricContractsService),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsumedContractComponent);
    component = fixture.componentInstance;
    component.endpointGroupId = 'uuid';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('importAppProfilesConfig', () => {
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
      const event = [{ name: 'Consumed Contract 1' }, { name: 'Consumed Contract 1' }] as any;
      const modalDto = new YesNoModalDto(
        'Import Consumed Contracts',
        `Are you sure you would like to import ${event.length} Consumed Contracts?`,
      );
      const subscribeToYesNoModalSpy = jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal');

      component.importConsumedContractEpgRelation(event);

      expect(subscribeToYesNoModalSpy).toHaveBeenCalledWith(modalDto, component['ngx'], expect.any(Function), expect.any(Function));
    });

    it('should import application profiles and refresh the table on confirmation', () => {
      const event = [{ name: 'Consumed Contract 1' }, { name: 'Consumed Contract 1' }] as any;
      jest.spyOn(component, 'getConsumedContracts');
      jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal').mockImplementation((modalDto, ngx, onConfirm, onClose) => {
        onConfirm();

        expect(component['endpointGroupsService'].addConsumedContractToEndpointGroupEndpointGroup).toHaveBeenCalledTimes(2);

        mockNgxSmartModalComponent.onCloseFinished.subscribe((modal: typeof mockNgxSmartModalComponent) => {
          const data = modal.getData() as YesNoModalDto;
          modal.removeData();
          if (data && data.modalYes) {
            onConfirm();
          }
        });

        return new Subscription();
      });

      component.importConsumedContractEpgRelation(event);

      expect(component.getConsumedContracts).toHaveBeenCalled();
    });
  });
});
