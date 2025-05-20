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
  let mockActivatedRoute: any;
  let formBuilder: UntypedFormBuilder;

  // Helper to build the form, as it's needed in multiple describe blocks
  const buildForm = (fb: UntypedFormBuilder) => {
    return fb.group({
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
  };


  beforeEach(() => {
    // General mocks
    ngxMock = {
      close: jest.fn(),
      resetModalData: jest.fn(),
      getModalData: jest.fn().mockImplementation(() => ({ // Default mock for getModalData
        ModalMode: ModalMode.Create,
        Tenant: { id: 'test-id', name: 'test-name' },
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
      url: '/tenant-v2/tenants', // Example URL
      navigate: jest.fn(),
    };

    // Base mockActivatedRoute, mode will be set in specific describe blocks
    mockActivatedRoute = {
      snapshot: {
        data: {}, // Mode set per describe context
        parent: null,
        // Ensure queryParams is an object
        queryParams: {},
      },
      data: of({}), // Observable part, also set per describe context
      parent: null,
    };
    formBuilder = new UntypedFormBuilder(); // Initialize here
  });

  const configureTestingModuleForMode = async (mode?: ApplicationMode) => {
    if (mode) {
      mockActivatedRoute.snapshot.data.mode = mode;
      mockActivatedRoute.data = of({ mode: mode });
    } else {
      delete mockActivatedRoute.snapshot.data.mode; // For non-mode specific tests or default behavior
      mockActivatedRoute.data = of({});
    }

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      declarations: [TenantSelectModalComponent, MockNgxSmartModalComponent, MockFontAwesomeComponent],
      imports: [ReactiveFormsModule, HttpClientModule, NgSelectModule],
      providers: [
        { provide: NgxSmartModalService, useValue: ngxMock },
        { provide: V2AppCentricTenantsService, useValue: tenantServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        MockProvider(TenantSelectModalHelpText),
        UntypedFormBuilder  // Provide UntypedFormBuilder
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TenantSelectModalComponent);
    component = fixture.componentInstance;
    // component.form is built in ngOnInit which is triggered by detectChanges,
    // or we can assign it directly if ngOnInit doesn't do more complex form setup
    // For these tests, let's ensure form is built before detectChanges if it's simple.
    // Actually, ngOnInit calls buildForm, so detectChanges will handle it.
  };


  it('should create', async () => {
    await configureTestingModuleForMode(); // Default/no specific mode
    fixture.detectChanges(); // ngOnInit builds the form
    expect(component).toBeTruthy();
  });

  describe('when in TenantV2 mode', () => {
    beforeEach(async () => {
      await configureTestingModuleForMode(ApplicationMode.TENANTV2);
      // Form is built in component's ngOnInit, triggered by detectChanges
    });

    it('should detect TenantV2 mode from URL', () => {
      fixture.detectChanges(); // Calls ngOnInit
      expect(component.isTenantV2Mode).toBeTruthy();
      expect(component.isAdminPortalMode).toBeFalsy();
      expect(component.currentMode).toEqual(ApplicationMode.TENANTV2);
    });

    it('should get modal data and retain TenantV2 mode', () => {
      fixture.detectChanges(); // ngOnInit sets initial mode
      // Ensure getModalData mock does not send mode flags to test persistence of route-derived mode
      ngxMock.getModalData.mockImplementation(() => ({
        ModalMode: ModalMode.Create,
        Tenant: { id: 'test-id', name: 'test-name' },
      }));

      component.getData();

      expect(ngxMock.getModalData).toHaveBeenCalledWith('tenantModal');
      expect(component.isTenantV2Mode).toBeTruthy(); // Mode from route should persist
      expect(component.isAdminPortalMode).toBeFalsy();
      expect(component.currentMode).toEqual(ApplicationMode.TENANTV2);
    });

    it('should call createOneTenant when saving in TenantV2 mode with Create mode', () => {
      fixture.detectChanges(); // ngOnInit and builds form
      component.ModalMode = ModalMode.Create;
      // isTenantV2Mode is already true from detectChanges
      component.submitted = false; // Ensure submitted is false initially
      jest.spyOn(component.form, 'invalid', 'get').mockReturnValue(false);

      component.save();
      expect(tenantServiceMock.createOneTenant).toHaveBeenCalled();
    });
  });

  describe('when in AdminPortal mode', () => {
    beforeEach(async () => {
      await configureTestingModuleForMode(ApplicationMode.ADMINPORTAL);
    });

    it('should detect AdminPortal mode from URL', () => {
      fixture.detectChanges();
      expect(component.isAdminPortalMode).toBeTruthy();
      expect(component.isTenantV2Mode).toBeFalsy();
      expect(component.currentMode).toEqual(ApplicationMode.ADMINPORTAL);
    });
    
    it('should call createOneV2TenantTenant when saving in AdminPortal mode with Create mode', () => {
      fixture.detectChanges(); // ngOnInit and builds form
      component.ModalMode = ModalMode.Create;
      // isAdminPortalMode is true
      component.submitted = false;
      jest.spyOn(component.form, 'invalid', 'get').mockReturnValue(false);
      
      component.save();
      expect(tenantServiceMock.createOneV2TenantTenant).toHaveBeenCalled();
    });
  });
  
  describe('when in AppCentric mode', () => {
    beforeEach(async () => {
      await configureTestingModuleForMode(ApplicationMode.APPCENTRIC);
    });

    it('should detect AppCentric mode from URL and set currentMode correctly', () => {
      fixture.detectChanges();
      expect(component.currentMode).toEqual(ApplicationMode.APPCENTRIC);
      expect(component.isAdminPortalMode).toBeFalsy();
      expect(component.isTenantV2Mode).toBeFalsy();
    });
  });

  // General tests that might not depend on specific ApplicationMode or use a default/no mode
  describe('General Modal Functionality', () => {
    beforeEach(async () => {
      await configureTestingModuleForMode(); // Default or no specific mode
      fixture.detectChanges(); // ngOnInit and builds form
    });

    it('should close modal when calling closeModal', () => {
      component.closeModal();
      expect(ngxMock.close).toHaveBeenCalledWith('tenantModal');
    });

    it('should reset form when calling reset', () => {
      component.form.get('description')?.setValue('test value');
      component.reset();
      expect(component.form.get('description')?.value).toBe(''); // or null if buildForm resets to null
      expect(ngxMock.resetModalData).toHaveBeenCalledWith('tenantModal');
    });
    
    it('should call updateOneTenant when saving in Edit mode (generic, mode might influence details later)', () => {
      // This test might need to be within a mode-specific describe if save behavior differs significantly
      // For now, assuming a generic Edit mode test:
      component.ModalMode = ModalMode.Edit;
      component.TenantId = 'test-id';
      component.form.get('name')?.disable(); 
      jest.spyOn(component.form, 'invalid', 'get').mockReturnValue(false);
      
      component.save();
      expect(tenantServiceMock.updateOneTenant).toHaveBeenCalled();
    });
  });

});
