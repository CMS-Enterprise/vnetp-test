/* eslint-disable */
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { MockComponent, MockFontAwesomeComponent, MockIconButtonComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';

import { ApplicationProfileModalComponent } from './application-profile-modal.component';
import { V2AppCentricApplicationProfilesService, V2AppCentricBridgeDomainsService, V2AppCentricEndpointGroupsService } from 'client';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { Subscription } from 'rxjs';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { By } from '@angular/platform-browser';

describe('ApplicationProfileModalComponent', () => {
  let component: ApplicationProfileModalComponent;
  let fixture: ComponentFixture<ApplicationProfileModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        ApplicationProfileModalComponent,
        MockNgxSmartModalComponent,
        MockFontAwesomeComponent,
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
        MockIconButtonComponent,
        MockComponent({ selector: 'app-endpoint-group-modal', inputs: ['applicationProfileId', 'tenantId'] }),
      ],
      imports: [RouterTestingModule, ReactiveFormsModule, FormsModule, NgSelectModule, HttpClientModule],
      providers: [
        MockProvider(NgxSmartModalService),
        MockProvider(V2AppCentricBridgeDomainsService),
        MockProvider(V2AppCentricEndpointGroupsService),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationProfileModalComponent);
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

  it('should call to create an Application Profile', () => {
    const service = TestBed.inject(V2AppCentricApplicationProfilesService);
    const createAppProfileSpy = jest.spyOn(service, 'createOneApplicationProfile');

    component.modalMode = ModalMode.Create;
    component.form.setValue({
      name: 'ap-1',
      alias: '',
      description: 'description!',
    });

    const saveButton = fixture.debugElement.query(By.css('.btn.btn-success'));
    saveButton.nativeElement.click();

    expect(createAppProfileSpy).toHaveBeenCalled();
  });

  it('should call ngx.close with the correct argument when cancelled', () => {
    const ngx = component['ngx'];

    const ngxSpy = jest.spyOn(ngx, 'close');

    component['closeModal']();

    expect(ngxSpy).toHaveBeenCalledWith('applicationProfileModal');
  });

  it('should reset the form when closing the modal', () => {
    component.form.controls.description.setValue('Test');

    const cancelButton = fixture.debugElement.query(By.css('.btn.btn-link'));
    cancelButton.nativeElement.click();

    expect(component.form.controls.description.value).toBe('');
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

  describe('getData', () => {
    const createAppProfileDto = () => ({
      ModalMode: ModalMode.Edit,
      ApplicationProfile: { id: 1 },
    });
    it('should run getData', () => {
      const ngx = TestBed.inject(NgxSmartModalService);
      jest.spyOn(ngx, 'getModalData').mockImplementation(() => createAppProfileDto());

      component.getData();

      expect(component.form.controls.description.enabled).toBe(true);
    });

    it('should run onInit', () => {
      const bridgeDomainsSpy = jest.spyOn(component, 'getBridgeDomains');

      component.ngOnInit();
      expect(bridgeDomainsSpy).toHaveBeenCalled();
    });
  });
});
