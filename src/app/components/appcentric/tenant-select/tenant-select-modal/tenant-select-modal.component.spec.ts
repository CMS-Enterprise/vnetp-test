import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { of, throwError } from 'rxjs';
import { TenantSelectModalComponent } from './tenant-select-modal.component';
import { Tenant, AdminV2AppCentricTenantsService } from 'client';
import { ApplicationMode } from 'src/app/models/other/application-mode-enum';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TenantSelectModalHelpText } from 'src/app/helptext/help-text-networking';
import { TenantModalDto } from 'src/app/models/appcentric/tenant-modal-dto';

const MOCK_TENANT: Tenant = {
  id: 't-1',
  name: 'mock-tenant',
  alias: 'Mock',
  description: 'A mock tenant',
  datacenterId: 'dc-1',
  datacenter: { id: 'dc-1', name: 'Mock DC' } as any,
  multiVrf: false,
  multiL3out: false,
  allowServiceGraphBypass: false,
};

describe('TenantSelectModalComponent', () => {
  let component: TenantSelectModalComponent;
  let fixture: ComponentFixture<TenantSelectModalComponent>;
  let mockModalService: any;
  let mockTenantService: any;
  let mockRouter: any;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    // Define the mocks
    mockModalService = {
      close: jest.fn(),
      resetModalData: jest.fn(),
      getModalData: jest.fn(),
      getModal: jest.fn().mockReturnValue({
        getData: jest.fn(),
      }),
    };

    mockTenantService = {
      createTenantWithVrfs: jest.fn().mockReturnValue(of({})),
      updateTenantAdmin: jest.fn().mockReturnValue(of({})),
      updateTenantBasic: jest.fn().mockReturnValue(of({})),
    };

    mockRouter = {
      navigate: jest.fn(),
    };

    mockActivatedRoute = {
      data: of({}),
      snapshot: { data: {} },
    };

    // Configure TestBed once
    await TestBed.configureTestingModule({
      declarations: [TenantSelectModalComponent],
      imports: [ReactiveFormsModule],
      providers: [
        UntypedFormBuilder,
        { provide: NgxSmartModalService, useValue: mockModalService },
        { provide: AdminV2AppCentricTenantsService, useValue: mockTenantService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: TenantSelectModalHelpText, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(TenantSelectModalComponent);
    component = fixture.componentInstance;
  });

  // Helper to set context on the existing mocks
  const setupContext = (mode: ApplicationMode, modalDto?: Partial<TenantModalDto>) => {
    mockActivatedRoute.data = of({ mode });
    mockActivatedRoute.snapshot.data.mode = mode;
    mockModalService.getModalData.mockReturnValue(modalDto || {});
    fixture.detectChanges(); // Triggers ngOnInit and other lifecycle hooks
  };

  it('should create', () => {
    setupContext(ApplicationMode.TENANTV2);
    expect(component).toBeTruthy();
  });

  describe('Mode Detection', () => {
    it('should correctly identify TENANTV2 mode', () => {
      setupContext(ApplicationMode.TENANTV2);
      expect(component.isTenantV2Mode).toBe(true);
      expect(component.isAdminPortalMode).toBe(false);
    });

    it('should correctly identify ADMINPORTAL mode', () => {
      setupContext(ApplicationMode.ADMINPORTAL);
      expect(component.isAdminPortalMode).toBe(true);
      expect(component.isTenantV2Mode).toBe(false);
    });
  });

  describe('Form Logic', () => {
    beforeEach(() => {
      setupContext(ApplicationMode.ADMINPORTAL);
    });

    it('should update App-ID availability based on firewall vendor', fakeAsync(() => {
      component.form.get('northSouthFirewallVendor').setValue('ASA');
      tick();
      expect(component.form.get('northSouthAppId').disabled).toBe(true);
      component.form.get('northSouthFirewallVendor').setValue('PANOS');
      tick();
      expect(component.form.get('northSouthAppId').enabled).toBe(true);
    }));

    it('should clear secondary DC if it matches primary', fakeAsync(() => {
      component.form.get('regionalHa').setValue(true);
      tick();
      component.form.get('primaryDatacenter').setValue('East');
      tick();
      component.form.get('secondaryDatacenter').setValue('East');
      tick();
      expect(component.form.get('secondaryDatacenter').value).toBe('');
    }));
  });

  describe('Component Methods & Save Logic', () => {
    it('should populate form when getData is called in Edit mode', () => {
      const dto = { ModalMode: ModalMode.Edit, Tenant: MOCK_TENANT };
      setupContext(ApplicationMode.TENANTV2, dto);
      component.getData();
      expect(component.ModalMode).toBe(ModalMode.Edit);
      expect(component.form.get('name').value).toBe(MOCK_TENANT.name);
    });

    it('should call createOneTenant in TenantV2 mode', () => {
      setupContext(ApplicationMode.TENANTV2, { ModalMode: ModalMode.Create });
      component.getData();
      component.form.get('name').setValue('new-tenant');
      component.save();
      expect(mockTenantService.createOneTenant).toHaveBeenCalled();
      expect(mockModalService.close).toHaveBeenCalledWith('tenantModal');
    });

    it('should call updateOneTenant in Edit mode', () => {
      setupContext(ApplicationMode.TENANTV2, { ModalMode: ModalMode.Edit, Tenant: MOCK_TENANT });
      component.getData();
      component.save();
      expect(mockTenantService.updateOneTenant).toHaveBeenCalledWith(expect.objectContaining({ id: MOCK_TENANT.id }));
    });

    it('should not close modal on API failure', () => {
      mockTenantService.updateOneTenant.mockReturnValue(throwError(() => new Error('API Error')));
      setupContext(ApplicationMode.TENANTV2, { ModalMode: ModalMode.Edit, Tenant: MOCK_TENANT });
      component.getData();
      component.save();
      expect(mockModalService.close).not.toHaveBeenCalled();
    });
  });

  describe('Admin Portal Save Logic', () => {
    beforeEach(() => {
      setupContext(ApplicationMode.ADMINPORTAL, { ModalMode: ModalMode.Create });
      component.getData();
      component.form.get('name').setValue('admin-tenant');
    });

    it('should call createTenantWithVrfs for AdminPortal create', () => {
      component.save();
      expect(mockTenantService.createTenantWithVrfs).toHaveBeenCalledWith({
        tenantAdminCreateDto: expect.objectContaining({
          name: 'admin-tenant',
          vrfs: expect.any(Array),
        }),
      });
    });

    it('should not save if form is invalid', () => {
      component.form.get('name').setValue(''); // make form invalid
      component.save();
      expect(mockTenantService.createTenantWithVrfs).not.toHaveBeenCalled();
    });

    it('should handle onFileSelected', () => {
      const file = new File([''], 'test-file.json', { type: 'application/json' });
      const event = { target: { files: [file] } };
      component.onFileSelected(event as any);
      expect(component.selectedFile).toBe(file);
    });

    it('should correctly build payload with various options', fakeAsync(() => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      // Simulate various form inputs
      component.form.get('vcdTenantType').setValue('existing');
      tick();
      component.form.get('vcdTenantId').setValue('vcd-123');
      tick();

      component.save();

      expect(consoleSpy).toHaveBeenCalledWith(
        'AdminPortal Tenant Configuration:',
        expect.objectContaining({
          vcdTenantId: 'vcd-123',
          tenantAdminCreateDto: expect.objectContaining({
            name: 'admin-tenant',
          }),
        }),
      );
      consoleSpy.mockRestore();
    }));
  });

  describe('updateAppIdAvailability', () => {
    it('should disable northSouthAppId if vendor is not PANOS', () => {
      const dto = {
        ModalMode: ModalMode.Edit,
        Tenant: MOCK_TENANT,
        northSouthFirewallVendor: 'ASA',
      };
      setupContext(ApplicationMode.ADMINPORTAL, dto as any);
      component.getData();
      expect(component.form.get('northSouthAppId').disabled).toBe(true);
    });

    it('should enable eastWestAppId if vendor is PANOS', () => {
      const dto = {
        ModalMode: ModalMode.Edit,
        Tenant: MOCK_TENANT,
        eastWestFirewallVendor: 'PANOS',
      };
      setupContext(ApplicationMode.ADMINPORTAL, dto as any);
      component.getData();
      expect(component.form.get('eastWestAppId').enabled).toBe(true);
    });

    it('should disable eastWestAppId if vendor is not PANOS', () => {
      const dto = {
        ModalMode: ModalMode.Edit,
        Tenant: MOCK_TENANT,
        eastWestFirewallVendor: 'ASA',
      };
      setupContext(ApplicationMode.ADMINPORTAL, dto as any);
      component.getData();
      expect(component.form.get('eastWestAppId').disabled).toBe(true);
    });
  });

  describe('updateSizeBasedOptions', () => {
    beforeEach(() => {
      setupContext(ApplicationMode.ADMINPORTAL);
    });

    it('should disable options for small tenants', fakeAsync(() => {
      component.form.get('tenantSize').setValue('small');
      tick();
      expect(component.form.get('eastWestFirewallArchitecture').disabled).toBe(true);
      expect(component.form.get('eastWestHa').disabled).toBe(true);
      expect(component.form.get('eastWestHaMode').disabled).toBe(true);
    }));

    it('should disable options for x-small tenants', fakeAsync(() => {
      component.form.get('tenantSize').setValue('x-small');
      tick();
      expect(component.form.get('eastWestFirewallArchitecture').disabled).toBe(true);
      expect(component.form.get('eastWestHa').disabled).toBe(true);
      expect(component.form.get('eastWestHaMode').disabled).toBe(true);
    }));

    it('should enable options for medium tenants and enable HA mode when HA is checked', fakeAsync(() => {
      component.form.get('eastWestHa').setValue(true);
      tick();
      component.form.get('tenantSize').setValue('medium');
      tick();
      expect(component.form.get('eastWestFirewallArchitecture').enabled).toBe(true);
      expect(component.form.get('eastWestHa').enabled).toBe(true);
      expect(component.form.get('eastWestHaMode').enabled).toBe(true);
    }));

    it('should enable options for medium tenants but disable HA mode when HA is unchecked', fakeAsync(() => {
      component.form.get('eastWestHa').setValue(false);
      tick();
      component.form.get('tenantSize').setValue('medium');
      tick();
      expect(component.form.get('eastWestFirewallArchitecture').enabled).toBe(true);
      expect(component.form.get('eastWestHa').enabled).toBe(true);
      expect(component.form.get('eastWestHaMode').disabled).toBe(true);
    }));
  });
});
