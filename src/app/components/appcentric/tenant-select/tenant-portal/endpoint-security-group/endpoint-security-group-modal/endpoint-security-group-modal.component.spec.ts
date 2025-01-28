/* eslint-disable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';
import {
  Selector,
  V2AppCentricApplicationProfilesService,
  V2AppCentricBridgeDomainsService,
  V2AppCentricContractsService,
  V2AppCentricEndpointSecurityGroupsService,
} from '../../../../../../../../client';
import { MockComponent, MockFontAwesomeComponent, MockNgxSmartModalComponent } from '../../../../../../../test/mock-components';
import { NgSelectModule } from '@ng-select/ng-select';
import { By } from '@angular/platform-browser';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { MockProvider } from 'src/test/mock-providers';
import { HttpClientModule } from '@angular/common/http';
import { EndpointSecurityGroupModalComponent } from './endpoint-security-group-modal.component';
import { RouterTestingModule } from '@angular/router/testing';
import { Subject, Subscription } from 'rxjs';
import { SelectorModalDto } from 'src/app/models/appcentric/appcentric-selector-modal-dto';

describe('EndpointSecurityGroupModalComponent', () => {
  let component: EndpointSecurityGroupModalComponent;
  let fixture: ComponentFixture<EndpointSecurityGroupModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        MockComponent({ selector: 'app-selector-modal', inputs: ['tenantId', 'endpointSecurityGroupId', 'vrfId'] }),
        EndpointSecurityGroupModalComponent,
        MockNgxSmartModalComponent,
        MockFontAwesomeComponent,
      ],
      providers: [
        MockProvider(NgxSmartModalService),
        MockProvider(V2AppCentricApplicationProfilesService),
        MockProvider(V2AppCentricBridgeDomainsService),
        MockProvider(V2AppCentricContractsService),
      ],
      imports: [FormsModule, ReactiveFormsModule, NgSelectModule, HttpClientModule, RouterTestingModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EndpointSecurityGroupModalComponent);
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

  describe('form field validation', () => {
    it('name should have a minimum length of 3 and maximum length of 100', () => {
      const { name } = component.form.controls;

      name.setValue('a');
      expect(name.valid).toBe(false);

      name.setValue('a'.repeat(3));
      expect(name.valid).toBe(true);

      name.setValue('a'.repeat(101));
      expect(name.valid).toBe(false);
    });

    it('name should not allow invalid characters', () => {
      const { name } = component.form.controls;

      name.setValue('invalid/name!');
      expect(name.valid).toBe(false);
    });
    it('description should have a maximum length of 500', () => {
      const { description } = component.form.controls;

      description.setValue('a');
      expect(description.valid).toBe(true);

      description.setValue('a'.repeat(501));
      expect(description.valid).toBe(false);
    });
    it('form fields should have correct required and optional fields by default', () => {
      const requiredFields = ['name'];
      const optionalFields = ['description'];

      requiredFields.forEach(r => {
        expect(isRequired(r)).toBe(true);
      });
      optionalFields.forEach(r => {
        expect(isRequired(r)).toBe(false);
      });
    });
  });

  describe('Create/Update ESG', () => {
    it('should call to create an Endpoint Security Group', () => {
      const service = TestBed.inject(V2AppCentricEndpointSecurityGroupsService);
      const createEndpointSecurityGroupSpy = jest.spyOn(service, 'createOneEndpointSecurityGroup');

      component.ModalMode = ModalMode.Create;
      component.form.setValue({
        name: 'esg1',
        description: 'description!',
        adminState: 'AdminUp',
        preferredGroupMember: true,
        intraEsgIsolation: true,
        vrfId: 'vrf-123',
        applicationProfileId: 'ap-123',
      });

      const saveButton = fixture.debugElement.query(By.css('.btn.btn-success'));
      saveButton.nativeElement.click();

      expect(createEndpointSecurityGroupSpy).toHaveBeenCalled();
    });

    it('should call to update an Endpoint Security Group ', () => {
      const service = TestBed.inject(V2AppCentricEndpointSecurityGroupsService);
      const updateEndpointSecurityGroupSpy = jest.spyOn(service, 'updateOneEndpointSecurityGroup');

      component.ModalMode = ModalMode.Edit;
      component.endpointSecurityGroupId = '123';
      component.form.setValue({
        name: 'esg1',
        description: 'description!',
        adminState: 'AdminUp',
        preferredGroupMember: true,
        intraEsgIsolation: true,
        vrfId: 'vrf-123',
        applicationProfileId: 'ap-123',
      });
      const saveButton = fixture.debugElement.query(By.css('.btn.btn-success'));
      saveButton.nativeElement.click();

      expect(updateEndpointSecurityGroupSpy).toHaveBeenCalled();
    });
  });

  describe('Closing modal functions', () => {
    it('should call ngx.close with the correct argument when cancelled', () => {
      const ngx = component['ngx'];

      const ngxSpy = jest.spyOn(ngx, 'close');

      component['closeModal']();

      expect(ngxSpy).toHaveBeenCalledWith('endpointSecurityGroupModal');
    });

    it('should reset the form when closing the modal', () => {
      component.form.controls.description.setValue('Test');

      const cancelButton = fixture.debugElement.query(By.css('.btn.btn-link'));
      cancelButton.nativeElement.click();

      expect(component.form.controls.description.value).toBe('');
    });
  });

  describe('getData', () => {
    const createEndpointSecurityGroupDto = () => ({
      ModalMode: ModalMode.Edit,
      endpointSecurityGroup: { id: 1 },
    });
    it('should run getData', () => {
      const ngx = TestBed.inject(NgxSmartModalService);

      // spy functions
      jest.spyOn(ngx, 'getModalData').mockImplementation(() => createEndpointSecurityGroupDto());
      jest.spyOn(component, 'getVrfs');
      jest.spyOn(component, 'getApplicationProfiles');

      component.getData();

      // expectations
      expect(component.form.controls.description.enabled).toBe(true);
      expect(component.getVrfs).toHaveBeenCalled();
      expect(component.getApplicationProfiles).toHaveBeenCalled();
    });
  });

  describe('Selector Functions', () => {
    it('should delete selector', () => {
      component.endpointSecurityGroupId = '123';
      // spy functions
      const selector = { id: '1' } as any;
      const deleteOneSelectorSpy = jest.spyOn(component['selectorService'], 'deleteOneSelector').mockResolvedValue({} as never);
      const softDeleteOneSelectorSpy = jest.spyOn(component['selectorService'], 'softDeleteOneSelector').mockResolvedValue({} as never);

      jest.spyOn(component['entityService'], 'deleteEntity').mockImplementationOnce((entity, options) => {
        options.onSuccess();
        return new Subscription();
      });

      const getEsgSpy = jest.spyOn(component, 'getEndpointSecurityGroup');

      component.deleteSelector(selector);

      // expectations
      expect(component['entityService'].deleteEntity).toHaveBeenCalled();
      expect(deleteOneSelectorSpy).toHaveBeenCalledWith({ id: selector.id });
      expect(softDeleteOneSelectorSpy).toHaveBeenCalledWith({ id: selector.id });
      expect(getEsgSpy).toHaveBeenCalled();
    });
    describe('Selector Modal Functions', () => {
      beforeEach(() => {
        jest.spyOn(component, 'getEndpointSecurityGroup');
        jest.spyOn(component['ngx'], 'resetModalData');
      });

      it('should subscribe to SelectorModal onCloseFinished event and unsubscribe afterwards', () => {
        const onCloseFinished = new Subject<void>();
        const mockModal = { onCloseFinished, open: jest.fn() };
        jest.spyOn(component['ngx'], 'getModal').mockReturnValue(mockModal as any);

        const unsubscribeSpy = jest.spyOn(Subscription.prototype, 'unsubscribe');

        component.subscribeToSelectorModal();

        expect(component['ngx'].getModal).toHaveBeenCalledWith('selectorModal');
        expect(component.selectorModalSubscription).toBeDefined();

        onCloseFinished.next();

        expect(component.getEndpointSecurityGroup).toHaveBeenCalled();
        expect(component['ngx'].resetModalData).toHaveBeenCalledWith('selectorModal');

        expect(unsubscribeSpy).toHaveBeenCalled();
      });
      it('should call ngx.setModalData and ngx.getModal().open', () => {
        component.epgSelectors = { data: [] };
        component.tenantId = { id: '1' } as any;
        component.openSelectorModal();

        expect(component['ngx'].setModalData).toHaveBeenCalledWith(expect.any(SelectorModalDto), 'selectorModal');
        expect(component['ngx'].getModal).toHaveBeenCalledWith('selectorModal');

        const modal = component['ngx'].getModal('selectorModal');
        expect(modal).toBeDefined();
      });
    });
  });
});
