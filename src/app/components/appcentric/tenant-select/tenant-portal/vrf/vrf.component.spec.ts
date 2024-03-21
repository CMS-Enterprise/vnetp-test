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

import { VrfComponent } from './vrf.component';
import { Subscription } from 'rxjs';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { V2AppCentricVrfsService } from 'client';

describe('VrfComponent', () => {
  let component: VrfComponent;
  let fixture: ComponentFixture<VrfComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        VrfComponent,
        MockNgxSmartModalComponent,
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
        MockFontAwesomeComponent,
        MockImportExportComponent,
        MockIconButtonComponent,
        MockYesNoModalComponent,
        MockComponent({ selector: 'app-vrf-modal', inputs: ['tenantId'] }),
        MockComponent({
          selector: 'app-standard-component',
          inputs: ['unusedObjectsButton', 'tableData', 'tableConfig', 'objectSearchColumns', 'tableItemsPerPage', 'objectType'],
        }),
      ],
      imports: [RouterTestingModule, HttpClientModule],
      providers: [MockProvider(NgxSmartModalService), MockProvider(V2AppCentricVrfsService)],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VrfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('importVrfsConfig', () => {
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
      const event = [{ name: 'Vrf 1' }, { name: 'Vrf 2' }] as any;
      const modalDto = new YesNoModalDto('Import Vrfs', `Are you sure you would like to import ${event.length} Vrfs?`);
      const subscribeToYesNoModalSpy = jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal');

      component.importVrfs(event);

      expect(subscribeToYesNoModalSpy).toHaveBeenCalledWith(modalDto, component['ngx'], expect.any(Function), expect.any(Function));
    });

    it('should import vrfs and refresh the table on confirmation', () => {
      const event = [{ name: 'Vrf 1' }, { name: 'Vrf 2' }] as any;
      jest.spyOn(component, 'getVrfs');
      jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal').mockImplementation((modalDto, ngx, onConfirm, onClose) => {
        onConfirm();

        expect(component['vrfService'].createManyVrf).toHaveBeenCalledWith({
          createManyVrfDto: { bulk: component.sanitizeData(event) },
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

      component.importVrfs(event);

      expect(component.getVrfs).toHaveBeenCalled();
    });
  });
});
