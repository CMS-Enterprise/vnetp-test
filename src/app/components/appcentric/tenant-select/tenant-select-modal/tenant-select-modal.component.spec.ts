import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { of } from 'rxjs';
import { TenantSelectModalComponent } from './tenant-select-modal.component';
import { Tenant, AdminV2AppCentricTenantsService } from 'client';
import { ApplicationMode } from 'src/app/models/other/application-mode-enum';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TenantSelectModalHelpText } from 'src/app/helptext/help-text-networking';
import { TenantModalDto } from 'src/app/models/appcentric/tenant-modal-dto';
import { HttpClientTestingModule } from '@angular/common/http/testing';

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
      imports: [ReactiveFormsModule, HttpClientTestingModule],
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

  describe('Component Methods & Save Logic', () => {
    it('should populate form when getData is called in Edit mode', () => {
      const dto = { ModalMode: ModalMode.Edit, Tenant: MOCK_TENANT };
      setupContext(ApplicationMode.TENANTV2, dto);
      component.getData();
      expect(component.ModalMode).toBe(ModalMode.Edit);
      expect(component.form.get('name').value).toBe(MOCK_TENANT.name);
    });
  });
});
