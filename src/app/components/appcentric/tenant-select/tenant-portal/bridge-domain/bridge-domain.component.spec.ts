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
import { Subscription } from 'rxjs';
import { V2AppCentricBridgeDomainsService, V2AppCentricVrfsService } from 'client';

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
});
