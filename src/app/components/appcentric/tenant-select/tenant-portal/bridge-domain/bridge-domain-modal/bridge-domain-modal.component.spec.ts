/* eslint-disable */
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NgSelectModule } from '@ng-select/ng-select';
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

import { BridgeDomainModalComponent } from './bridge-domain-modal.component';
import { V2AppCentricBridgeDomainsService } from 'client';
import { Subscription } from 'rxjs';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { By } from '@angular/platform-browser';
import { L3Out } from 'client';

describe('BridgeDomainModalComponent', () => {
  let component: BridgeDomainModalComponent;
  let fixture: ComponentFixture<BridgeDomainModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        BridgeDomainModalComponent,
        MockNgxSmartModalComponent,
        MockFontAwesomeComponent,
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
        MockIconButtonComponent,
        MockImportExportComponent,
        MockYesNoModalComponent,
      ],
      imports: [NgSelectModule, FormsModule, ReactiveFormsModule, RouterTestingModule, HttpClientModule],
      providers: [MockProvider(NgxSmartModalService), MockProvider(V2AppCentricBridgeDomainsService)],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BridgeDomainModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const getFormControl = (prop: string): FormControl => component.form.controls[prop] as FormControl;
  const isRequired = (prop: string): boolean => {
    const fc = getFormControl(prop);
    fc.setValue(null);
    return !!fc.errors && !!fc.errors.required;
  };

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Name', () => {
    it('should have a minimum length of 3 and maximum length of 100', () => {
      const { name } = component.form.controls;

      name.setValue('a');
      expect(name.valid).toBe(false);

      name.setValue('a'.repeat(3));
      expect(name.valid).toBe(true);

      name.setValue('a'.repeat(101));
      expect(name.valid).toBe(false);
    });

    it('should not allow invalid characters', () => {
      const { name } = component.form.controls;

      name.setValue('invalid/name!');
      expect(name.valid).toBe(false);
    });
  });

  describe('alias', () => {
    it('should have a maximum length of 100', () => {
      const { alias } = component.form.controls;

      alias.setValue('a');
      expect(alias.valid).toBe(true);

      alias.setValue('a'.repeat(101));
      expect(alias.valid).toBe(false);
    });
  });

  describe('description', () => {
    it('should have a maximum length of 500', () => {
      const { description } = component.form.controls;

      description.setValue('a');
      expect(description.valid).toBe(true);

      description.setValue('a'.repeat(501));
      expect(description.valid).toBe(false);
    });
  });

  it('should have correct required and optional fields by default', () => {
    const requiredFields = ['name', 'vrfId'];
    const optionalFields = [
      'alias',
      'description',
      'unicastRouting',
      'arpFlooding',
      'bdMacAddress',
      'limitLocalIpLearning',
      'epMoveDetectionModeGarp',
    ];

    requiredFields.forEach(r => {
      expect(isRequired(r)).toBe(true);
    });
    optionalFields.forEach(r => {
      expect(isRequired(r)).toBe(false);
    });
  });

  describe('bdMacAddress', () => {
    it('should have a valid mac address', () => {
      const { bdMacAddress } = component.form.controls;

      bdMacAddress.setValue('00:0a:95:9d:68:16');
      expect(bdMacAddress.valid).toBe(true);

      bdMacAddress.setValue('ma:ca:dd:re:ss');
      expect(bdMacAddress.valid).toBe(false);
    });
  });

  describe('routeProfile', () => {
    it('should be required when l3OutForRouteProfileId is set', () => {
      const { l3OutForRouteProfileId, routeProfileId } = component.form.controls;

      l3OutForRouteProfileId.setValue('123');
      expect(l3OutForRouteProfileId.valid).toBe(true);
      expect(routeProfileId.valid).toBe(false);

      routeProfileId.setValue('123');
      expect(routeProfileId.valid).toBe(true);
    });
  });

  describe('importAssociatedL3Outs', () => {
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
        resetModalData: jest.fn(),
        setModalData: jest.fn(),
      } as any;
    });

    it('should display a confirmation modal with the correct message', () => {
      const event = [{ name: 'L3Out 1' }, { name: 'L3Out 2' }] as any;
      const modalDto = new YesNoModalDto('Import L3 Outs', `Are you sure you would like to import ${event.length} L3 Outs?`);
      const subscribeToYesNoModalSpy = jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal');

      component.importBridgeDomainL3OutRelation(event);

      expect(subscribeToYesNoModalSpy).toHaveBeenCalledWith(modalDto, component['ngx'], expect.any(Function), expect.any(Function));
    });

    it('should import L3Outs and refresh on confirmation', () => {
      const event = [{ name: 'L3Out 1' }, { name: 'L3Out 2' }] as any;
      jest.spyOn(component, 'getL3OutsTableData');
      jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal').mockImplementation((modalDto, ngx, onConfirm, onClose) => {
        onConfirm();

        expect(component['bridgeDomainService'].addL3OutToBridgeDomainBridgeDomain).toHaveBeenCalledTimes(2);

        mockNgxSmartModalComponent.onCloseFinished.subscribe((modal: typeof mockNgxSmartModalComponent) => {
          const data = modal.getData() as YesNoModalDto;
          modal.removeData();
          if (data && data.modalYes) {
            onConfirm();
          }
        });

        return new Subscription();
      });

      component.importBridgeDomainL3OutRelation(event);

      expect(component.getL3OutsTableData).toHaveBeenCalled();
    });
  });

  it('should add associated l3out', () => {
    component.selectedL3Out = { id: '123', tenantId: 'tenantId-123', vrfId: 'vrfId-123' } as L3Out;
    component.addL3Out();
    const getL3OutTableDataMock = jest.spyOn(component['bridgeDomainService'], 'getOneBridgeDomain');
    expect(getL3OutTableDataMock).toHaveBeenCalled();
  });

  it('should remove associated l3out', () => {
    jest.spyOn(component, 'getL3OutsTableData');
    jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal').mockImplementation((modalDto, ngx, onConfirm, onClose) => {
      onConfirm();

      expect(component['bridgeDomainService'].removeL3OutFromBridgeDomainBridgeDomain).toHaveBeenCalled();

      return new Subscription();
    });

    const l3OutToDelete = { id: '123', description: 'Bye!', tenantId: 'tenantId-123', vrfId: 'vrfId-123' } as L3Out;
    component.bridgeDomainId = 'bridgeDomainId-123';
    component.removeL3Out(l3OutToDelete);
    expect(component.getL3OutsTableData).toHaveBeenCalled();
  });

  it('should call to create an Bridge Domain', () => {
    const service = TestBed.inject(V2AppCentricBridgeDomainsService);
    const createBridgeDomainSpy = jest.spyOn(service, 'createOneBridgeDomain');

    component.modalMode = ModalMode.Create;
    component.form.setValue({
      name: 'bridge-domain1',
      arpFlooding: true,
      bdMacAddress: '',
      epMoveDetectionModeGarp: false,
      limitLocalIpLearning: true,
      unicastRouting: true,
      vrfId: 'vrfId123',
      alias: '',
      description: 'description!',
      l3OutForRouteProfileId: 'uuid123',
      routeProfileId: 'route-profile123',
      hostBasedRouting: false,
    });

    const saveButton = fixture.debugElement.query(By.css('.btn.btn-success'));
    saveButton.nativeElement.click();

    expect(createBridgeDomainSpy).toHaveBeenCalled();
  });

  it('should call to update a Bridge Domain', () => {
    const service = TestBed.inject(V2AppCentricBridgeDomainsService);
    const updateBridgeDomainSpy = jest.spyOn(service, 'updateOneBridgeDomain');
    jest.spyOn(component, 'closeModal');

    component.modalMode = ModalMode.Edit;
    component.bridgeDomainId = '123';
    component.form.setValue({
      name: 'bridge-domain1',
      arpFlooding: true,
      bdMacAddress: '',
      epMoveDetectionModeGarp: false,
      limitLocalIpLearning: true,
      unicastRouting: true,
      vrfId: 'vrfId123',
      alias: '',
      description: 'description!',
      l3OutForRouteProfileId: 'uuid123',
      routeProfileId: 'route-profile123',
      hostBasedRouting: false,
    });

    const saveButton = fixture.debugElement.query(By.css('.btn.btn-success'));
    saveButton.nativeElement.click();

    expect(updateBridgeDomainSpy).toHaveBeenCalled();
    expect(component['closeModal']).toHaveBeenCalled();
  });

  describe('getData', () => {
    const createBridgeDomainDto = () => ({
      ModalMode: ModalMode.Edit,
      BridgeDomain: { id: 1 },
    });
    it('should run getData', () => {
      jest.spyOn(component, 'getVrfs');
      const ngx = TestBed.inject(NgxSmartModalService);
      jest.spyOn(ngx, 'getModalData').mockImplementation(() => createBridgeDomainDto());

      component.getData();

      expect(component.form.controls.description.enabled).toBe(true);
      expect(component.getVrfs).toHaveBeenCalled();
    });
  });

  it('should call ngx.close with the correct argument when cancelled', () => {
    const ngx = component['ngx'];

    const ngxSpy = jest.spyOn(ngx, 'close');

    component['closeModal']();

    expect(ngxSpy).toHaveBeenCalledWith('bridgeDomainModal');
  });

  it('should reset the form when closing the modal', () => {
    component.form.controls.description.setValue('Test');

    const cancelButton = fixture.debugElement.query(By.css('.btn.btn-link'));
    cancelButton.nativeElement.click();

    expect(component.form.controls.description.value).toBe('');
  });
});
