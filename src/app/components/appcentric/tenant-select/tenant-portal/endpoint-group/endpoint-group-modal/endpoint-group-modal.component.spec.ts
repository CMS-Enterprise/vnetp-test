import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EndpointGroupModalComponent } from './endpoint-group-modal.component';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';
import {
  V2AppCentricApplicationProfilesService,
  V2AppCentricBridgeDomainsService,
  V2AppCentricContractsService,
  V2AppCentricEndpointGroupsService,
} from '../../../../../../../../client';
import { MockFontAwesomeComponent, MockNgxSmartModalComponent } from '../../../../../../../test/mock-components';
import { NgSelectModule } from '@ng-select/ng-select';
import { By } from '@angular/platform-browser';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { MockProvider } from 'src/test/mock-providers';
import { HttpClientModule } from '@angular/common/http';

describe('EndpointGroupModalComponent', () => {
  let component: EndpointGroupModalComponent;
  let fixture: ComponentFixture<EndpointGroupModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EndpointGroupModalComponent, MockNgxSmartModalComponent, MockFontAwesomeComponent],
      providers: [
        MockProvider(NgxSmartModalService),
        MockProvider(V2AppCentricApplicationProfilesService),
        MockProvider(V2AppCentricBridgeDomainsService),
        MockProvider(V2AppCentricContractsService),
      ],
      imports: [FormsModule, ReactiveFormsModule, NgSelectModule, HttpClientModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EndpointGroupModalComponent);
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
    const requiredFields = ['name'];
    const optionalFields = ['alias', 'description'];

    requiredFields.forEach(r => {
      expect(isRequired(r)).toBe(true);
    });
    optionalFields.forEach(r => {
      expect(isRequired(r)).toBe(false);
    });
  });

  it('should call to create a Route Profile', () => {
    const service = TestBed.inject(V2AppCentricEndpointGroupsService);
    const createEndpointGroupSpy = jest.spyOn(service, 'createOneEndpointGroup');

    component.ModalMode = ModalMode.Create;
    component.form.setValue({
      name: 'route-profile1',
      bridgeDomain: 'bd-123',
      applicationProfileId: 'ap-123',
      intraEpgIsolation: true,
      alias: '',
      description: 'description!',
    });

    const saveButton = fixture.debugElement.query(By.css('.btn.btn-success'));
    saveButton.nativeElement.click();

    expect(createEndpointGroupSpy).toHaveBeenCalled();
  });

  it('should call to update a Route Profile', () => {
    const service = TestBed.inject(V2AppCentricEndpointGroupsService);
    const updateEndpointGroupSpy = jest.spyOn(service, 'updateOneEndpointGroup');

    component.ModalMode = ModalMode.Edit;
    component.endpointGroupId = '123';
    component.form.setValue({
      bridgeDomain: 'bd-123',
      applicationProfileId: 'ap-123',
      intraEpgIsolation: true,
      name: 'route-profile1',
      alias: '',
      description: 'updated description!',
    });

    const saveButton = fixture.debugElement.query(By.css('.btn.btn-success'));
    saveButton.nativeElement.click();

    expect(updateEndpointGroupSpy).toHaveBeenCalled();
  });

  it('should call ngx.close with the correct argument when cancelled', () => {
    const ngx = component['ngx'];

    const ngxSpy = jest.spyOn(ngx, 'close');

    component['closeModal']();

    expect(ngxSpy).toHaveBeenCalledWith('endpointGroupModal');
  });

  it('should reset the form when closing the modal', () => {
    component.form.controls.description.setValue('Test');

    const cancelButton = fixture.debugElement.query(By.css('.btn.btn-link'));
    cancelButton.nativeElement.click();

    expect(component.form.controls.description.value).toBe('');
  });

  describe('getData', () => {
    const createEndpointGroupDto = () => ({
      ModalMode: ModalMode.Edit,
      ApplicationProfile: { id: 1 },
    });
    it('should run getData', () => {
      const ngx = TestBed.inject(NgxSmartModalService);
      jest.spyOn(ngx, 'getModalData').mockImplementation(() => createEndpointGroupDto());

      component.getData();

      expect(component.form.controls.description.enabled).toBe(true);
    });
  });
});
