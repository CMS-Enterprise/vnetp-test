/* eslint-disable */
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { MockFontAwesomeComponent, MockIconButtonComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';

import { SubnetsEditModalComponent } from './subnets-edit-modal.component';
import { By } from '@angular/platform-browser';
import { V2AppCentricAppCentricSubnetsService } from 'client';
import { ModalMode } from 'src/app/models/other/modal-mode';

describe('SubnetsEditModalComponent', () => {
  let component: SubnetsEditModalComponent;
  let fixture: ComponentFixture<SubnetsEditModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SubnetsEditModalComponent, MockNgxSmartModalComponent, MockFontAwesomeComponent, MockIconButtonComponent],
      imports: [ReactiveFormsModule, HttpClientModule],
      providers: [MockProvider(NgxSmartModalService), MockProvider(V2AppCentricAppCentricSubnetsService)],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubnetsEditModalComponent);
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
    const service = TestBed.inject(V2AppCentricAppCentricSubnetsService);
    const createSubnetSpy = jest.spyOn(service, 'createOneAppCentricSubnet');

    component.modalMode = ModalMode.Create;
    component.form.setValue({
      name: 'subnet1',
      description: '',
      alias: '',
      gatewayIp: '192.168.0.1/24',
      treatAsVirtualIpAddress: true,
      primaryIpAddress: false,
      advertisedExternally: false,
      preferred: false,
      sharedBetweenVrfs: false,
      ipDataPlaneLearning: true,
    });

    const saveButton = fixture.debugElement.query(By.css('.btn.btn-success'));
    saveButton.nativeElement.click();

    expect(createSubnetSpy).toHaveBeenCalled();
  });

  it('should call to update a Route Profile', () => {
    const service = TestBed.inject(V2AppCentricAppCentricSubnetsService);
    const updateSubnetSpy = jest.spyOn(service, 'updateOneAppCentricSubnet');

    component.modalMode = ModalMode.Edit;
    component.subnetId = '123';
    component.form.setValue({
      name: 'subnet1',
      description: '',
      alias: '',
      gatewayIp: '192.168.0.1/24',
      treatAsVirtualIpAddress: true,
      primaryIpAddress: false,
      advertisedExternally: false,
      preferred: false,
      sharedBetweenVrfs: false,
      ipDataPlaneLearning: true,
    });

    const saveButton = fixture.debugElement.query(By.css('.btn.btn-success'));
    saveButton.nativeElement.click();

    expect(updateSubnetSpy).toHaveBeenCalled();
  });

  it('should call ngx.close with the correct argument when cancelled', () => {
    const ngx = component['ngx'];

    const ngxSpy = jest.spyOn(ngx, 'close');

    component['closeModal']();

    expect(ngxSpy).toHaveBeenCalledWith('subnetsEditModal');
  });

  it('should reset the form when closing the modal', () => {
    component.form.controls.description.setValue('Test');

    const cancelButton = fixture.debugElement.query(By.css('.btn.btn-link'));
    cancelButton.nativeElement.click();

    expect(component.form.controls.description.value).toBe('');
  });

  describe('getData', () => {
    const createSubnetDto = () => ({
      ModalMode: ModalMode.Edit,
      subnet: { id: 1 },
    });
    it('should run getData', () => {
      const ngx = TestBed.inject(NgxSmartModalService);
      jest.spyOn(ngx, 'getModalData').mockImplementation(() => createSubnetDto());

      component.getData();

      expect(component.form.controls.description.enabled).toBe(true);
    });
  });
});
