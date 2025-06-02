/* eslint-disable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { V2AppCentricTenantsService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import {
  MockComponent,
  MockFontAwesomeComponent,
  MockIconButtonComponent,
  MockImportExportComponent,
  MockYesNoModalComponent,
} from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';

import { TenantSelectComponent } from './tenant-select.component';
import { of, Subject, Subscription } from 'rxjs';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { TenantModalDto } from 'src/app/models/appcentric/tenant-modal-dto';

describe('TenantSelectComponent', () => {
  let component: TenantSelectComponent;
  let fixture: ComponentFixture<TenantSelectComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        TenantSelectComponent,
        MockComponent('app-tenant-select-modal'),
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
        MockFontAwesomeComponent,
        MockIconButtonComponent,
        MockImportExportComponent,
        MockYesNoModalComponent,
        MockComponent({ selector: 'app-type-delete-modal', inputs: ['objectToDelete', 'objectType'] }),
      ],
      imports: [RouterModule, RouterTestingModule],
      providers: [MockProvider(NgxSmartModalService), MockProvider(V2AppCentricTenantsService)],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TenantSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should run onInit', () => {
    const getTenantsSpy = jest.spyOn(component, 'getTenants');

    component.ngOnInit();
    expect(getTenantsSpy).toHaveBeenCalled();
  });

  it('should restore tenant', () => {
    const tenantToRestore = { id: '1', deletedAt: true } as any;
    jest.spyOn(component['tenantService'], 'restoreOneTenant').mockReturnValue(of({} as any));
    jest.spyOn(component, 'getTenants');
    component.restoreTenant(tenantToRestore);
    expect(component['tenantService'].restoreOneTenant).toHaveBeenCalledWith({ id: tenantToRestore.id });
    expect(component.getTenants).toHaveBeenCalled();
  });

  describe('openTenantModal', () => {
    beforeEach(() => {
      jest.spyOn(component, 'getTenants');
      jest.spyOn(component['ngx'], 'resetModalData');
    });

    it('should subscribe to tenantModal onCloseFinished event and unsubscribe afterwards', () => {
      const onCloseFinished = new Subject<void>();
      const mockModal = { onCloseFinished, open: jest.fn() };
      jest.spyOn(component['ngx'], 'getModal').mockReturnValue(mockModal as any);

      const unsubscribeSpy = jest.spyOn(Subscription.prototype, 'unsubscribe');

      component.subscribeToTenantModal();

      expect(component['ngx'].getModal).toHaveBeenCalledWith('tenantModal');
      expect(component.tenantModalSubscription).toBeDefined();

      onCloseFinished.next();

      expect(component.getTenants).toHaveBeenCalled();
      expect(component['ngx'].resetModalData).toHaveBeenCalledWith('tenantModal');

      expect(unsubscribeSpy).toHaveBeenCalled();
    });
    it('should call ngx.setModalData and ngx.getModal().open', () => {
      const endpointGroup = { id: 1, name: 'Test Endpoint Group' } as any;
      component.openTenantModal(ModalMode.Edit, endpointGroup);

      expect(component['ngx'].setModalData).toHaveBeenCalledWith(expect.any(TenantModalDto), 'tenantModal');
      expect(component['ngx'].getModal).toHaveBeenCalledWith('tenantModal');

      const modal = component['ngx'].getModal('tenantModal');
      expect(modal).toBeDefined();
    });
  });

  describe('thing', () => {
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
      } as any;
    });
    it('should open type delete modal', () => {
      const tenant = { id: '1', deletedAt: 'now' } as any;

      const openDeleteSpy = jest.spyOn(component, 'subscribeToTypeDeleteModal').mockImplementation(() => {
        mockNgxSmartModalComponent.onCloseFinished.subscribe(() => {
          expect(component.getTenants()).toHaveBeenCalled();
        });
        return new Subscription();
      });

      jest.spyOn(component['tenantService'], 'getManyTenant').mockReturnValue(of({} as any));

      component.deleteTenant(tenant);

      expect(component['ngx'].getModal).toHaveBeenCalledWith('typeDeleteModal');
      expect(openDeleteSpy).toHaveBeenCalled();

      const modal = component['ngx'].getModal('typeDeleteModal');
      expect(modal).toBeDefined();
    });
    it('should delete tenant', () => {
      const tenant = { id: '1' } as any;
      jest.spyOn(component, 'getTenants');
      const softDeleteOneTenantSpy = jest.spyOn(component['tenantService'], 'softDeleteOneTenant');
      component.deleteTenant(tenant);
      expect(softDeleteOneTenantSpy).toHaveBeenCalled();
    });
  });
});
