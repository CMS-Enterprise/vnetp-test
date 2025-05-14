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
import { of, Subject, Subscription } from 'rxjs';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { V2AppCentricVrfsService, Vrf } from 'client';
import { VrfModalDto } from 'src/app/models/appcentric/vrf-modal-dto';
import { ModalMode } from 'src/app/models/other/modal-mode';

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

  it('should delete a vrf', () => {
    const vrfToDelete = { id: '123', description: 'Bye!' } as Vrf;
    const subscribeToYesNoModalSpy = jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal');
    component.deleteVrf(vrfToDelete);
    const getVrfsMock = jest.spyOn(component['vrfService'], 'getManyVrf');
    expect(subscribeToYesNoModalSpy).toHaveBeenCalled();
    expect(getVrfsMock).toHaveBeenCalled();
  });

  it('should restore a vrf', () => {
    const vrf = { id: '1', deletedAt: true } as any;
    jest.spyOn(component['vrfService'], 'restoreOneVrf').mockReturnValue(of({} as any));
    jest.spyOn(component, 'getVrfs');
    component.restoreVrf(vrf);
    expect(component['vrfService'].restoreOneVrf).toHaveBeenCalledWith({ id: vrf.id });
    expect(component.getVrfs).toHaveBeenCalled();
  });

  it('should apply search params when filtered results is true', () => {
    const vrf = { id: '1', deletedAt: true } as any;
    jest.spyOn(component['vrfService'], 'restoreOneVrf').mockReturnValue(of({} as any));

    const getVrfsMock = jest.spyOn(component, 'getVrfs');
    const params = { searchString: '', filteredResults: true, searchColumn: 'name', searchText: 'test' };
    jest.spyOn(component['tableContextService'], 'getSearchLocalStorage').mockReturnValue(params);

    component.restoreVrf(vrf);
    expect(getVrfsMock).toHaveBeenCalledWith(params);
  });

  describe('openVrfModal', () => {
    describe('openModal', () => {
      beforeEach(() => {
        jest.spyOn(component, 'getVrfs');
        jest.spyOn(component['ngx'], 'resetModalData');
      });

      it('should subscribe to vrfModal onCloseFinished event and unsubscribe afterwards', () => {
        const onCloseFinished = new Subject<void>();
        const mockModal = { onCloseFinished, open: jest.fn() };
        jest.spyOn(component['ngx'], 'getModal').mockReturnValue(mockModal as any);

        const unsubscribeSpy = jest.spyOn(Subscription.prototype, 'unsubscribe');

        component.subscribeToVrfModal();

        expect(component['ngx'].getModal).toHaveBeenCalledWith('vrfModal');
        expect(component.vrfModalSubscription).toBeDefined();

        onCloseFinished.next();

        expect(component.getVrfs).toHaveBeenCalled();
        expect(component['ngx'].resetModalData).toHaveBeenCalledWith('vrfModal');

        expect(unsubscribeSpy).toHaveBeenCalled();
      });
      it('should call ngx.setModalData and ngx.getModal().open', () => {
        const vrf = { id: 1, name: 'Test Vrf' } as any;
        component.tenantId = { id: '1' } as any;
        component.openVrfModal(ModalMode.Edit, vrf);

        expect(component['ngx'].setModalData).toHaveBeenCalledWith(expect.any(VrfModalDto), 'vrfModal');
        expect(component['ngx'].getModal).toHaveBeenCalledWith('vrfModal');

        const modal = component['ngx'].getModal('vrfModal');
        expect(modal).toBeDefined();
      });
    });
  });
});
