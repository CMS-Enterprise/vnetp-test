/* eslint-disable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
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
import { V2AppCentricTenantsService, V2AppCentricVrfsService, V3GlobalWanFormRequestService, Vrf, WanFormRequest } from 'client';
import { VrfModalDto } from 'src/app/models/appcentric/vrf-modal-dto';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { Tenant } from 'client';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';

describe('VrfComponent', () => {
  let component: VrfComponent;
  let fixture: ComponentFixture<VrfComponent>;
  let mockTenantService: jest.Mocked<V2AppCentricTenantsService>;
  let mockWanFormRequestService: jest.Mocked<V3GlobalWanFormRequestService>;
  let mockWanFormRequest: jest.Mocked<WanFormRequest>;

  beforeEach(() => {
    mockWanFormRequest = {
      id: '123',
      tenantId: '123',
      status: 'PENDING',
    } as any;

    const mockTenant = {
      wanFormStatus: 'PENDING',
      id: '123',
      name: 'Test Tenant',
    } as any;
    mockTenantService = {
      getOneTenant: jest.fn().mockReturnValue(of(mockTenant)),
    } as any;
    mockWanFormRequestService = {
      getManyWanFormRequests: jest.fn().mockReturnValue(of([mockWanFormRequest])),
    } as any;
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
      imports: [HttpClientTestingModule],
      providers: [
        MockProvider(NgxSmartModalService),
        MockProvider(V2AppCentricVrfsService),
        { provide: V3GlobalWanFormRequestService, useValue: mockWanFormRequestService },
        { provide: V2AppCentricTenantsService, useValue: mockTenantService },
        { provide: ActivatedRoute, useValue: { snapshot: { params: { tenantId: '123' } } } },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VrfComponent);
    component = fixture.componentInstance;
    component.tenantId = '123';
    component.tenant = { id: '123', wanFormStatus: 'PENDING' } as Tenant;
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
      const modalDto = new YesNoModalDto(
        'Import VRFs',
        `Are you sure you would like to import ${event.length} VRF${event.length > 1 ? 's' : ''}?`,
      );
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
    const vrfToDelete = { id: '123', name: 'Test VRF', description: 'Bye!' } as any;
    const subscribeToYesNoModalSpy = jest
      .spyOn(SubscriptionUtil, 'subscribeToYesNoModal')
      .mockImplementation((modalDto, ngx, onConfirm, onClose) => {
        // Just call onConfirm immediately for testing
        onConfirm();
        return new Subscription();
      });
    jest.spyOn(component['vrfService'], 'softDeleteOneVrf').mockReturnValue(of({} as any));
    jest.spyOn(component as any, 'refreshVrfs');

    component.deleteVrf(vrfToDelete);

    expect(subscribeToYesNoModalSpy).toHaveBeenCalled();
    expect(component['vrfService'].softDeleteOneVrf).toHaveBeenCalledWith({ id: '123' });
  });

  it('should restore a vrf', () => {
    const vrf = { id: '1', name: 'Test VRF', deletedAt: true } as any;
    const subscribeToYesNoModalSpy = jest
      .spyOn(SubscriptionUtil, 'subscribeToYesNoModal')
      .mockImplementation((modalDto, ngx, onConfirm, onClose) => {
        // Just call onConfirm immediately for testing
        onConfirm();
        return new Subscription();
      });
    jest.spyOn(component['vrfService'], 'restoreOneVrf').mockReturnValue(of({} as any));
    jest.spyOn(component as any, 'refreshVrfs');

    component.restoreVrf(vrf);

    expect(subscribeToYesNoModalSpy).toHaveBeenCalled();
    expect(component['vrfService'].restoreOneVrf).toHaveBeenCalledWith({ id: '1' });
  });

  it('should apply search params when filtered results is true', () => {
    const getVrfsMock = jest.spyOn(component, 'getVrfs');
    const params = { searchString: '', filteredResults: true, searchColumn: 'name', searchText: 'test' };
    jest.spyOn(component['tableContextService'], 'getSearchLocalStorage').mockReturnValue(params);

    // Test refreshVrfs helper method
    component['refreshVrfs']();

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
