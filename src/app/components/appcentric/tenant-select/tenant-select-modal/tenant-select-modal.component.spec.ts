/* eslint-disable */
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { MockFontAwesomeComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';
import { of } from 'rxjs';

import { TenantSelectModalComponent } from './tenant-select-modal.component';
import { Tenant, V2AppCentricTenantsService } from 'client';
import { By } from '@angular/platform-browser';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { ApplicationMode } from 'src/app/models/other/application-mode-enum';
import { TenantModalDto } from 'src/app/models/appcentric/tenant-modal-dto';
import { TenantSelectModalHelpText } from 'src/app/helptext/help-text-networking';

describe('TenantSelectModalComponent', () => {
  let component: TenantSelectModalComponent;
  let fixture: ComponentFixture<TenantSelectModalComponent>;
  let ngxMock: any;
  let tenantServiceMock: any;
  let routerMock: any;

  beforeEach(() => {
    ngxMock = {
      close: jest.fn(),
      resetModalData: jest.fn(),
      getModalData: jest.fn().mockImplementation(() => ({
        ModalMode: ModalMode.Create,
        Tenant: { id: 'test-id', name: 'test-name', datacenterId: 'test-dc' },
        isAdminPortalMode: false,
        isTenantV2Mode: true,
      })),
      setModalData: jest.fn(),
      getModal: jest.fn().mockImplementation(() => ({
        open: jest.fn(),
        onCloseFinished: { subscribe: jest.fn() },
      })),
    };

    tenantServiceMock = {
      createOneTenant: jest.fn().mockReturnValue(of({})),
      updateOneTenant: jest.fn().mockReturnValue(of({})),
      createOneV2TenantTenant: jest.fn().mockReturnValue(of({})),
    };

    routerMock = {
      url: '/tenant-v2/tenants',
      navigate: jest.fn(),
    };

    TestBed.configureTestingModule({
      declarations: [TenantSelectModalComponent, MockNgxSmartModalComponent, MockFontAwesomeComponent],
      imports: [ReactiveFormsModule, HttpClientModule, NgSelectModule],
      providers: [
        { provide: NgxSmartModalService, useValue: ngxMock },
        { provide: V2AppCentricTenantsService, useValue: tenantServiceMock },
        { provide: Router, useValue: routerMock },
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({ mode: ApplicationMode.TENANTV2 }),
            snapshot: { queryParams: {} },
          },
        },
        MockProvider(TenantSelectModalHelpText),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TenantSelectModalComponent);
    component = fixture.componentInstance;
    const formBuilder = TestBed.inject(UntypedFormBuilder);
    component.form = formBuilder.group({
      name: ['test-name'],
      alias: [''],
      description: ['test description'],
      tenantSize: ['medium'],
      vendorAgnosticNat: [false],
      northSouthFirewallVendor: ['PANOS'],
      northSouthFirewallArchitecture: ['Virtual'],
      northSouthHa: [true],
      northSouthHaMode: ['Active-Passive'],
      eastWestFirewallVendor: ['PANOS'],
      eastWestFirewallArchitecture: ['Virtual'],
      eastWestHa: [true],
      eastWestHaMode: ['Active-Passive'],
      regionalHa: [false],
      primaryDatacenter: ['East'],
      secondaryDatacenter: [''],
      deploymentMode: ['Hot Site First'],
      vcdLocation: ['VCD-East'],
      vcdTenantType: ['new'],
      vcdTenantId: [''],
      northSouthAppId: [true],
      eastWestAppId: [true],
      nat64NorthSouth: [true],
      eastWestAllowSgBypass: [false],
      eastWestNat: [false],
    });
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

  it('should detect TenantV2 mode from URL', () => {
    // This should be set during component initialization
    expect(component.isTenantV2Mode).toBeTruthy();
  });

  it('should close modal when calling closeModal', () => {
    component.closeModal();
    expect(ngxMock.close).toHaveBeenCalledWith('tenantModal');
  });

  it('should reset form when calling reset', () => {
    // Set a value to check it gets reset
    component.form.get('description').setValue('test value');

    // Call reset
    component.reset();

    // Check form is reset
    expect(component.form.get('description').value).toBe('');
    expect(ngxMock.resetModalData).toHaveBeenCalledWith('tenantModal');
  });

  it('should get modal data when calling getData', () => {
    component.getData();
    expect(ngxMock.getModalData).toHaveBeenCalledWith('tenantModal');
    expect(component.isTenantV2Mode).toBeTruthy();
  });

  it('should call createOneTenant when saving in TenantV2 mode with Create mode', () => {
    // Set mode and mock valid form
    component.ModalMode = ModalMode.Create;
    component.isTenantV2Mode = true;
    component.submitted = false;

    // Force form validity to be true to bypass validation
    jest.spyOn(component.form, 'invalid', 'get').mockReturnValue(false);

    // Call save
    component.save();

    // Check createOneTenant was called
    expect(tenantServiceMock.createOneTenant).toHaveBeenCalled();
  });

  it('should call updateOneTenant when saving in Edit mode', () => {
    // Set up edit mode
    component.ModalMode = ModalMode.Edit;
    component.TenantId = 'test-id';
    component.form.get('name').disable(); // Name is disabled in edit mode

    // Force form validity to be true to bypass validation
    jest.spyOn(component.form, 'invalid', 'get').mockReturnValue(false);

    // Call save
    component.save();

    // Check updateOneTenant was called
    expect(tenantServiceMock.updateOneTenant).toHaveBeenCalled();
  });

  it('should call createOneV2TenantTenant when in AdminPortal mode', () => {
    // Set adminPortal mode
    component.isAdminPortalMode = true;
    component.isTenantV2Mode = false;
    component.ModalMode = ModalMode.Create;

    // Force form validity to be true to bypass validation
    jest.spyOn(component.form, 'invalid', 'get').mockReturnValue(false);

    // Call save
    component.save();

    // Check createOneV2TenantTenant was called
    expect(tenantServiceMock.createOneV2TenantTenant).toHaveBeenCalled();
  });
});
