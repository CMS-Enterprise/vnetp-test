/* eslint-disable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';
import {
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

  // describe('Name', () => {
  //   it('should have a minimum length of 3 and maximum length of 100', () => {
  //     const { name } = component.form.controls;

  //     name.setValue('a');
  //     expect(name.valid).toBe(false);

  //     name.setValue('a'.repeat(3));
  //     expect(name.valid).toBe(true);

  //     name.setValue('a'.repeat(101));
  //     expect(name.valid).toBe(false);
  //   });

  //   it('should not allow invalid characters', () => {
  //     const { name } = component.form.controls;

  //     name.setValue('invalid/name!');
  //     expect(name.valid).toBe(false);
  //   });
  // });

  // describe('alias', () => {
  //   it('should have a maximum length of 100', () => {
  //     const { alias } = component.form.controls;

  //     alias.setValue('a');
  //     expect(alias.valid).toBe(true);

  //     alias.setValue('a'.repeat(101));
  //     expect(alias.valid).toBe(false);
  //   });
  // });

  // describe('description', () => {
  //   it('should have a maximum length of 500', () => {
  //     const { description } = component.form.controls;

  //     description.setValue('a');
  //     expect(description.valid).toBe(true);

  //     description.setValue('a'.repeat(501));
  //     expect(description.valid).toBe(false);
  //   });
  // });

  // it('should have correct required and optional fields by default', () => {
  //   const requiredFields = ['name'];
  //   const optionalFields = ['alias', 'description'];

  //   requiredFields.forEach(r => {
  //     expect(isRequired(r)).toBe(true);
  //   });
  //   optionalFields.forEach(r => {
  //     expect(isRequired(r)).toBe(false);
  //   });
  // });

  // it('should call to create an Endpoint Group', () => {
  //   const service = TestBed.inject(V2AppCentricEndpointSecurityGroupsService);
  //   const createEndpointSecurityGroupSpy = jest.spyOn(service, 'createOneEndpointSecurityGroup');

  //   component.ModalMode = ModalMode.Create;
  //   component.form.setValue({
  //     name: 'epg1',
  //     bridgeDomain: 'bd-123',
  //     applicationProfileId: 'ap-123',
  //     intraEpgIsolation: true,
  //     alias: '',
  //     description: 'description!',
  //   });

  //   const saveButton = fixture.debugElement.query(By.css('.btn.btn-success'));
  //   saveButton.nativeElement.click();

  //   expect(createEndpointSecurityGroupSpy).toHaveBeenCalled();
  // });

  // it('should call to update an Endpoint Group ', () => {
  //   const service = TestBed.inject(V2AppCentricEndpointSecurityGroupsService);
  //   const updateEndpointSecurityGroupSpy = jest.spyOn(service, 'updateOneEndpointSecurityGroup');

  //   component.ModalMode = ModalMode.Edit;
  //   component.endpointSecurityGroupId = '123';
  //   component.form.setValue({
  //     bridgeDomain: 'bd-123',
  //     applicationProfileId: 'ap-123',
  //     intraEpgIsolation: true,
  //     name: 'epg1',
  //     alias: '',
  //     description: 'updated description!',
  //   });

  //   const saveButton = fixture.debugElement.query(By.css('.btn.btn-success'));
  //   saveButton.nativeElement.click();

  //   expect(updateEndpointSecurityGroupSpy).toHaveBeenCalled();
  // });

  // it('should call ngx.close with the correct argument when cancelled', () => {
  //   const ngx = component['ngx'];

  //   const ngxSpy = jest.spyOn(ngx, 'close');

  //   component['closeModal']();

  //   expect(ngxSpy).toHaveBeenCalledWith('endpointSecurityGroupModal');
  // });

  // it('should reset the form when closing the modal', () => {
  //   component.form.controls.description.setValue('Test');

  //   const cancelButton = fixture.debugElement.query(By.css('.btn.btn-link'));
  //   cancelButton.nativeElement.click();

  //   expect(component.form.controls.description.value).toBe('');
  // });

  // describe('getData', () => {
  //   const createEndpointSecurityGroupDto = () => ({
  //     ModalMode: ModalMode.Edit,
  //     endpointSecurityGroup: { id: 1 },
  //   });
  //   it('should run getData', () => {
  //     const ngx = TestBed.inject(NgxSmartModalService);
  //     jest.spyOn(ngx, 'getModalData').mockImplementation(() => createEndpointSecurityGroupDto());

  //     component.getData();

  //     expect(component.form.controls.description.enabled).toBe(true);
  //   });
  // });
});
