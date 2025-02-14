/* eslint-disable */
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { MockFontAwesomeComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';

import { VrfModalComponent } from './vrf-modal.component';
import { By } from '@angular/platform-browser';
import { V2AppCentricVrfsService } from 'client';
import { ModalMode } from 'src/app/models/other/modal-mode';

describe('VrfModalComponent', () => {
  let component: VrfModalComponent;
  let fixture: ComponentFixture<VrfModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VrfModalComponent, MockNgxSmartModalComponent, MockFontAwesomeComponent],
      imports: [RouterTestingModule, HttpClientModule, ReactiveFormsModule],
      providers: [MockProvider(NgxSmartModalService)],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VrfModalComponent);
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
    const optionalFields = ['alias', 'description', 'policyControlEnforced', 'policyControlEnforcementIngress'];

    requiredFields.forEach(r => {
      expect(isRequired(r)).toBe(true);
    });
    optionalFields.forEach(r => {
      expect(isRequired(r)).toBe(false);
    });
  });

  it('should call to create a Vrf', () => {
    const service = TestBed.inject(V2AppCentricVrfsService);
    const createVrfSpy = jest.spyOn(service, 'createOneVrf');

    component.modalMode = ModalMode.Create;
    component.form.setValue({
      policyControlEnforced: true,
      policyControlEnforcementIngress: true,
      name: 'vrf1',
      alias: '',
      description: 'description!',
    });

    const saveButton = fixture.debugElement.query(By.css('.btn.btn-success'));
    saveButton.nativeElement.click();

    expect(createVrfSpy).toHaveBeenCalled();
  });

  it('should call to update a Vrf', () => {
    const service = TestBed.inject(V2AppCentricVrfsService);
    const updateVrfSpy = jest.spyOn(service, 'updateOneVrf');

    component.modalMode = ModalMode.Edit;
    component.vrfId = '123';
    component.form.setValue({
      policyControlEnforced: true,
      policyControlEnforcementIngress: true,
      name: 'vrf1',
      alias: '',
      description: 'updated description!',
    });

    const saveButton = fixture.debugElement.query(By.css('.btn.btn-success'));
    saveButton.nativeElement.click();

    expect(updateVrfSpy).toHaveBeenCalled();
  });

  it('should call ngx.close with the correct argument when cancelled', () => {
    const ngx = component['ngx'];

    const ngxSpy = jest.spyOn(ngx, 'close');

    component['closeModal']();

    expect(ngxSpy).toHaveBeenCalledWith('vrfModal');
  });

  it('should reset the form when closing the modal', () => {
    component.form.controls.description.setValue('Test');

    const cancelButton = fixture.debugElement.query(By.css('.btn.btn-link'));
    cancelButton.nativeElement.click();

    expect(component.form.controls.description.value).toBe('');
  });

  describe('getData', () => {
    const createVrfDto = () => ({
      ModalMode: ModalMode.Edit,
      vrf: { id: 1 },
    });
    it('should run getData', () => {
      const ngx = TestBed.inject(NgxSmartModalService);
      jest.spyOn(ngx, 'getModalData').mockImplementation(() => createVrfDto());

      component.getData();

      expect(component.form.controls.description.enabled).toBe(true);
    });
  });
});
