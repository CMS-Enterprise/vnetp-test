import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { of, throwError } from 'rxjs';
import { TenantSelectModalComponent } from './tenant-select-modal.component';
import { Tenant, AdminV2AppCentricTenantsService, V3GlobalEnvironmentService, VrfAdminDtoExternalVrfsEnum } from 'client';
import { ApplicationMode } from 'src/app/models/other/application-mode-enum';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TenantSelectModalHelpText } from 'src/app/helptext/help-text-networking';
import { TenantModalDto } from 'src/app/models/appcentric/tenant-modal-dto';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouteDataUtil } from 'src/app/utils/route-data.util';

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
  environmentId: 'e-1',
};

describe('TenantSelectModalComponent', () => {
  let component: TenantSelectModalComponent;
  let fixture: ComponentFixture<TenantSelectModalComponent>;
  let mockModalService: any;
  let mockTenantService: any;
  let mockRouter: any;
  let mockActivatedRoute: any;
  let mockEnvironmentService: any;

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
      createOneV2Tenant: jest.fn().mockReturnValue(of({})),
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

    mockEnvironmentService = {
      getManyEnvironments: jest.fn().mockReturnValue(of([])),
    };

    // Configure TestBed once
    await TestBed.configureTestingModule({
      declarations: [TenantSelectModalComponent],
      imports: [ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        UntypedFormBuilder,
        { provide: NgxSmartModalService, useValue: mockModalService },
        { provide: AdminV2AppCentricTenantsService, useValue: mockTenantService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: TenantSelectModalHelpText, useValue: {} },
        { provide: V3GlobalEnvironmentService, useValue: mockEnvironmentService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(TenantSelectModalComponent);
    component = fixture.componentInstance;
  });

  // Helper to set context on the existing mocks
  const setupContext = (mode: ApplicationMode, modalDto?: Partial<TenantModalDto>) => {
    jest.spyOn(RouteDataUtil, 'getApplicationModeFromRoute').mockReturnValue(mode);
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

  describe('Component Methods & Save Logic', () => {
    it('should populate form when getData is called in Edit mode', () => {
      const dto = { ModalMode: ModalMode.Edit, Tenant: MOCK_TENANT };
      setupContext(ApplicationMode.TENANTV2, dto);
      component.getData();
      expect(component.ModalMode).toBe(ModalMode.Edit);
      expect(component.form.get('name').value).toBe(MOCK_TENANT.name);
    });

    it('should enable name when Create mode and set admin fields when in admin mode', () => {
      const dto = { ModalMode: ModalMode.Create } as any;
      setupContext(ApplicationMode.ADMINPORTAL, dto);
      component.form.get('name').disable();
      component.getData();
      expect(component.ModalMode).toBe(ModalMode.Create);
      expect(component.form.get('name').enabled).toBe(true);
      // Admin defaults applied
      expect(component.form.get('tenantSize').value).toBeDefined();
      expect(component.form.get('vcdLocation').value).toBeDefined();
      expect(component.form.get('vcdTenantType').value).toBeDefined();
    });

    it('should closeModal and reset', () => {
      setupContext(ApplicationMode.TENANTV2);
      const resetSpy = jest.spyOn(component, 'reset');
      component.closeModal();
      expect(mockModalService.close).toHaveBeenCalledWith('tenantModal');
      expect(resetSpy).toHaveBeenCalled();
    });

    it('reset should rebuild form and vrf configurations and clear submitted', () => {
      setupContext(ApplicationMode.TENANTV2);
      component.submitted = true;
      const oldForm = component.form;
      component.reset();
      expect(component.submitted).toBe(false);
      expect(mockModalService.resetModalData).toHaveBeenCalledWith('tenantModal');
      expect(component.form).not.toBe(oldForm);
      expect(component.vrfConfigurations.length).toBeGreaterThan(0);
    });

    it('initializeExternalConnectivityOptions should populate from enum', () => {
      setupContext(ApplicationMode.TENANTV2);
      (component as any).externalConnectivityOptions = [];
      (component as any).initializeExternalConnectivityOptions();
      expect(component.externalConnectivityOptions.length).toBeGreaterThan(0);
    });

    it('loadEnvironments should set environments on success and handle error', () => {
      setupContext(ApplicationMode.TENANTV2);
      (mockEnvironmentService.getManyEnvironments as jest.Mock).mockReturnValue(of([{ id: 'e-1', externalVrfs: ['A'] }]));
      (component as any).loadEnvironments();
      expect(component.environments.length).toBe(1);

      (mockEnvironmentService.getManyEnvironments as jest.Mock).mockReturnValue(throwError(() => new Error('fail')));
      const errSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
      (component as any).loadEnvironments();
      expect(errSpy).toHaveBeenCalled();
      errSpy.mockRestore();
    });

    it('initializeVrfConfigurations creates default and collapse states', () => {
      setupContext(ApplicationMode.TENANTV2);
      (component as any).initializeVrfConfigurations();
      expect(component.vrfConfigurations.length).toBe(1);
      expect(component.vrfCollapsedStates[0]).toBe(false);
    });

    it('createDefaultVrfConfiguration returns an object with expected shape', () => {
      setupContext(ApplicationMode.TENANTV2);
      const def = (component as any).createDefaultVrfConfiguration();
      expect(def).toHaveProperty('name');
      expect(def).toHaveProperty('defaultExternalVrf');
    });

    it('addVrf pushes a new vrf and collapse state', () => {
      setupContext(ApplicationMode.TENANTV2);
      const initial = component.vrfConfigurations.length;
      component.addVrf();
      expect(component.vrfConfigurations.length).toBe(initial + 1);
      expect(component.vrfCollapsedStates.length).toBe(initial + 1);
    });

    it('removeVrf respects constraints and canRemoveVrf reflects rule', () => {
      setupContext(ApplicationMode.TENANTV2);
      // have at least two VRFs
      component.addVrf();
      component.vrfConfigurations[0].name = 'default_vrf';
      component.vrfConfigurations[1].name = 'other';
      // cannot remove default
      expect(component.canRemoveVrf(0)).toBe(false);
      // can remove other when more than 1
      expect(component.canRemoveVrf(1)).toBe(true);
      component.removeVrf(1);
      expect(component.vrfConfigurations.length).toBe(1);
    });

    it('getAvailableExternalVrfs filters by selected and environment', () => {
      setupContext(ApplicationMode.TENANTV2);
      const vrfA = VrfAdminDtoExternalVrfsEnum.CmsnetTransport as any;
      const vrfB = VrfAdminDtoExternalVrfsEnum.CmsnetSec as any;
      component.environments = [{ id: 'e-1', externalVrfs: [vrfA, vrfB] } as any];
      component.form.get('environmentId').setValue('e-1');
      component.vrfConfigurations[0].externalVrfs = [vrfA] as any;
      const available = component.getAvailableExternalVrfs(0);
      const values = available.map(v => v.value);
      expect(values).toContain(vrfB);
      expect(values).not.toContain(vrfA);
    });

    it('addExternalVrf sets default when first and prevents duplicates', () => {
      setupContext(ApplicationMode.TENANTV2);
      component.vrfConfigurations[0].externalVrfs = [] as any;
      component.addExternalVrf(0, 'A' as any);
      expect(component.vrfConfigurations[0].externalVrfs).toEqual(['A']);
      expect(component.vrfConfigurations[0].defaultExternalVrf).toBe('A');
      component.addExternalVrf(0, 'A' as any);
      expect(component.vrfConfigurations[0].externalVrfs).toEqual(['A']);
    });

    it('addExternalVrfAndClear should add and clear selection', () => {
      setupContext(ApplicationMode.TENANTV2);
      component.selectedExternalVrf = 'A';
      component.addExternalVrfAndClear(0, 'A');
      expect(component.vrfConfigurations[0].externalVrfs).toContain('A');
      expect(component.selectedExternalVrf).toBe('');
    });

    it('getSelectedExternalVrfs returns selected or empty', () => {
      setupContext(ApplicationMode.TENANTV2);
      component.vrfConfigurations[0].externalVrfs = ['A'] as any;
      expect(component.getSelectedExternalVrfs(0)).toEqual(['A']);
      component.vrfConfigurations[0].externalVrfs = undefined as any;
      expect(component.getSelectedExternalVrfs(0)).toEqual([]);
    });

    it('toggleDefaultExternalVrf toggles default correctly', () => {
      setupContext(ApplicationMode.TENANTV2);
      component.vrfConfigurations[0].externalVrfs = ['A', 'B'] as any;
      component.toggleDefaultExternalVrf(0, 'A' as any);
      expect(component.isDefaultExternalVrf(0, 'A' as any)).toBe(true);
      component.toggleDefaultExternalVrf(0, 'A' as any);
      expect(component.isDefaultExternalVrf(0, 'A' as any)).toBe(false);
    });

    it('removeExternalVrf reassigns default and clears when last removed', () => {
      setupContext(ApplicationMode.TENANTV2);
      component.vrfConfigurations[0].externalVrfs = ['A', 'B'] as any;
      component.setDefaultExternalVrf(0, 'A' as any);
      component.removeExternalVrf(0, 'A' as any);
      expect(component.vrfConfigurations[0].externalVrfs).toEqual(['B']);
      expect(component.vrfConfigurations[0].defaultExternalVrf).toBe('B');
      component.removeExternalVrf(0, 'B' as any);
      expect(component.vrfConfigurations[0].externalVrfs).toEqual([]);
      expect(component.vrfConfigurations[0].defaultExternalVrf).toBeUndefined();
    });

    it('setDefaultExternalVrf only sets when exists', () => {
      setupContext(ApplicationMode.TENANTV2);
      component.vrfConfigurations[0].externalVrfs = ['A'] as any;
      component.vrfConfigurations[0].defaultExternalVrf = undefined as any;
      component.setDefaultExternalVrf(0, 'B' as any);
      expect(component.vrfConfigurations[0].defaultExternalVrf).toBeUndefined();
      component.setDefaultExternalVrf(0, 'A' as any);
      expect(component.vrfConfigurations[0].defaultExternalVrf).toBe('A');
    });

    it('toggleVrfCollapse toggles within bounds and ignores out-of-bounds', () => {
      setupContext(ApplicationMode.TENANTV2);
      const initial = component.vrfCollapsedStates[0];
      component.toggleVrfCollapse(0);
      expect(component.vrfCollapsedStates[0]).toBe(!initial);
      // out of bounds should not throw
      component.toggleVrfCollapse(-1);
      component.toggleVrfCollapse(99);
    });

    it('canRemoveExternalVrf false when only one or when default; true otherwise', () => {
      setupContext(ApplicationMode.TENANTV2);
      component.vrfConfigurations[0].externalVrfs = ['A'] as any;
      component.setDefaultExternalVrf(0, 'A' as any);
      expect(component.canRemoveExternalVrf(0, 'A' as any)).toBe(false);
      component.addExternalVrf(0, 'B' as any);
      expect(component.canRemoveExternalVrf(0, 'A' as any)).toBe(false);
      expect(component.canRemoveExternalVrf(0, 'B' as any)).toBe(true);
    });

    it('updateSizeBasedOptions reduces maxExternalRoutes for small sizes', () => {
      setupContext(ApplicationMode.TENANTV2);
      component.vrfConfigurations[0].maxExternalRoutes = 1000 as any;
      component.form.get('tenantSize').setValue('small');
      // triggers valueChanges which calls updateSizeBasedOptions
      expect(component.vrfConfigurations[0].maxExternalRoutes).toBeLessThanOrEqual(500);
    });

    it('save should create tenant when admin create mode and edit when admin edit mode', () => {
      // Create mode
      setupContext(ApplicationMode.ADMINPORTAL, { ModalMode: ModalMode.Create } as any);
      component.getData();
      component.form.patchValue({
        name: 'tenant-name',
        description: 'd',
        alias: 'a',
        environmentId: 'e',
        vendorAgnosticNat: true,
        multiVrf: false,
        multiL3out: false,
      });
      component.vrfConfigurations = [(component as any).createDefaultVrfConfiguration()];
      component.save();
      expect(mockTenantService.createOneV2Tenant).toHaveBeenCalled();

      // Edit mode
      setupContext(ApplicationMode.ADMINPORTAL, { ModalMode: ModalMode.Edit, Tenant: MOCK_TENANT } as any);
      component.getData();
      component.form.patchValue({
        name: 'tenant-name',
        description: 'd',
        alias: 'a',
        environmentId: 'e',
        vendorAgnosticNat: false,
        multiVrf: true,
        multiL3out: true,
      });
      component.save();
      expect(mockTenantService.updateTenantAdmin).toHaveBeenCalled();
    });

    it('save should just close in non-admin mode', () => {
      setupContext(ApplicationMode.TENANTV2, { ModalMode: ModalMode.Create } as any);
      component.getData();
      component.form.patchValue({ name: 'tenant-name', environmentId: 'e' });
      component.save();
      expect(mockModalService.close).toHaveBeenCalledWith('tenantModal');
    });
  });
});
