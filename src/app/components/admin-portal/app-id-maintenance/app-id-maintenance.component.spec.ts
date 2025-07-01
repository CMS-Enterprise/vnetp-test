import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AppIdMaintenanceComponent } from './app-id-maintenance.component';
import { AuthService } from '../../../services/auth.service';
import { TenantStateService } from '../../../services/tenant-state.service';
import { Tier, V1RuntimeDataAppIdRuntimeService, V1TiersService } from '../../../../../client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { RuntimeDataService } from '../../../services/runtime-data.service';
import { MatDialog } from '@angular/material/dialog';
import { of, Subject, Subscription, throwError } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import SubscriptionUtil from '../../../utils/SubscriptionUtil';
import { TierManagementSaveChanges } from './tier-management-modal/tier-management-modal.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

const mockAuthService = {
  getTenants: jest.fn(),
  currentUserValue: { token: 'test-token' },
};

const mockTenantStateService = {
  setTenant: jest.fn(),
  clearTenant: jest.fn(),
};

const mockTierService = {
  getManyTier: jest.fn(),
  toggleAppIdTier: jest.fn(),
};

const mockNgxSmartModalService = {
  getModal: jest.fn().mockReturnValue({
    onOpen: of(null),
    onClose: of(null),
    setData: jest.fn().mockReturnThis(),
    open: jest.fn().mockReturnThis(),
    close: jest.fn().mockReturnThis(),
  }),
};

const mockAppIdService = {
  runAppIdMaintenanceAppIdRuntime: jest.fn(),
  createRuntimeDataJobAppIdRuntime: jest.fn(),
};

const mockRuntimeDataService = {
  pollJobStatus: jest.fn(),
};

const mockDialog = {
  open: jest.fn(),
};

const mockTenants = [
  { tenant: 'tenant-a', tenantQueryParameter: 'tenant-a' },
  { tenant: 'tenant-b', tenantQueryParameter: 'tenant-b' },
];

const mockTiersTenantA: Tier[] = [
  {
    id: '1',
    name: 'tier-1',
    appIdEnabled: true,
    appVersion: '1.0',
    runtimeDataLastRefreshed: '2023-01-01',
    datacenterId: 'dc1',
  },
];

const mockTiersTenantB: Tier[] = [{ id: '2', name: 'tier-2', appIdEnabled: false, datacenterId: 'dc2' }];

describe('AppIdMaintenanceComponent', () => {
  let component: AppIdMaintenanceComponent;
  let fixture: ComponentFixture<AppIdMaintenanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppIdMaintenanceComponent],
      imports: [MatTableModule, MatCheckboxModule, NoopAnimationsModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: TenantStateService, useValue: mockTenantStateService },
        { provide: V1TiersService, useValue: mockTierService },
        { provide: NgxSmartModalService, useValue: mockNgxSmartModalService },
        { provide: V1RuntimeDataAppIdRuntimeService, useValue: mockAppIdService },
        { provide: RuntimeDataService, useValue: mockRuntimeDataService },
        { provide: MatDialog, useValue: mockDialog },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AppIdMaintenanceComponent);
    component = fixture.componentInstance;
    jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal').mockImplementation((dto, ngx, onConfirm) => {
      onConfirm();
      return new Subscription();
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit and getTenants', () => {
    it('should call getTenants on init', () => {
      mockAuthService.getTenants.mockReturnValue(of([]));
      const getTenantsSpy = jest.spyOn(component, 'getTenants');
      component.ngOnInit();
      expect(getTenantsSpy).toHaveBeenCalled();
    });

    it('should fetch and process tenants correctly', fakeAsync(() => {
      mockAuthService.getTenants.mockReturnValue(of(mockTenants));
      mockTierService.getManyTier.mockImplementation(() => {
        const tenant = mockTenantStateService.setTenant.mock.calls[mockTenantStateService.setTenant.mock.calls.length - 1][0];
        if (tenant === 'tenant-a') {
          return of(mockTiersTenantA as any);
        }
        if (tenant === 'tenant-b') {
          return of(mockTiersTenantB as any);
        }
        return of([]);
      });

      component.getTenants();
      tick();

      expect(component.dataSource.data.length).toBe(2);
      const tenantA = component.dataSource.data.find(t => t.tenant === 'tenant-a');
      expect(tenantA.appIdEnabled).toBe(true);
      expect(tenantA.currentVersion).toBe('1.0');
      expect(tenantA.lastUpdated).toBe('2023-01-01');
      expect(tenantA.isRefreshDisabled).toBe(false);
      expect(tenantA.isUpdateDisabled).toBe(false);

      const tenantB = component.dataSource.data.find(t => t.tenant === 'tenant-b');
      expect(tenantB.appIdEnabled).toBe(false);
      expect(tenantB.currentVersion).toBe(null);
      expect(tenantB.lastUpdated).toBe(null);
      expect(tenantB.isRefreshDisabled).toBe(true);
      expect(tenantB.isUpdateDisabled).toBe(true);
    }));

    it('should handle empty tenants list', () => {
      mockAuthService.getTenants.mockReturnValue(of([]));
      component.getTenants();
      expect(component.dataSource.data.length).toBe(0);
    });

    it('should handle getTenants error', fakeAsync(() => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockAuthService.getTenants.mockReturnValue(throwError(() => new Error('API Error')));
      component.getTenants();
      tick();
      expect(component.dataSource.data.length).toBe(0);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching tenant data:', expect.any(Error));
    }));
  });

  describe('Selection Model', () => {
    beforeEach(() => {
      component.dataSource.data = [
        { tenant: 't1', isUpdateDisabled: false },
        { tenant: 't2', isUpdateDisabled: false },
        { tenant: 't3', isUpdateDisabled: true },
      ] as any[];
    });

    it('isAllSelected should work correctly', () => {
      expect(component.isAllSelected()).toBe(false);
      component.selection.select(...component.dataSource.data.filter(r => !r.isUpdateDisabled));
      expect(component.isAllSelected()).toBe(true);
      component.selection.clear();
      component.selection.select(component.dataSource.data[0]);
      expect(component.isAllSelected()).toBe(false);
    });

    it('toggleAll should select all selectable rows when none selected', () => {
      component.toggleAll();
      expect(component.selection.selected.length).toBe(2);
      expect(component.isAllSelected()).toBe(true);
    });

    it('toggleAll should clear selection if all are selected', () => {
      component.selection.select(...component.dataSource.data.filter(r => !r.isUpdateDisabled));
      component.toggleAll();
      expect(component.selection.selected.length).toBe(0);
    });

    it('isAnySelectedTenantUpdateDisabled should be true if a disabled tenant is selected', () => {
      component.selection.select(component.dataSource.data[2]); // t3 is disabled
      expect(component.isAnySelectedTenantUpdateDisabled).toBe(true);
    });

    it('isAnySelectedTenantUpdateDisabled should be false if only enabled tenants are selected', () => {
      component.selection.select(component.dataSource.data[0]); // t1 is enabled
      expect(component.isAnySelectedTenantUpdateDisabled).toBe(false);
    });

    it('isAnySelectedTenantUpdateDisabled should be false if nothing is selected', () => {
      expect(component.isAnySelectedTenantUpdateDisabled).toBe(false);
    });
  });

  describe('update', () => {
    it('should run update on selected tenants and handle success and failure', fakeAsync(() => {
      const getTenantsSpy = jest.spyOn(component, 'getTenants').mockImplementation();
      const tenant1 = {
        tenant: 'tenant-a',
        isUpdateDisabled: false,
        updateJobStatus: null,
        currentVersion: '1.0',
        lastUpdated: '2023-01-01',
        appIdEnabled: true,
        isRefreshDisabled: false,
      };
      const tenant2 = {
        tenant: 'tenant-b',
        isUpdateDisabled: false,
        updateJobStatus: null,
        currentVersion: '1.0',
        lastUpdated: '2023-01-01',
        appIdEnabled: true,
        isRefreshDisabled: false,
      };
      component.dataSource.data = [tenant1, tenant2] as any[];
      component.selection.select(tenant1 as any, tenant2 as any);

      mockAppIdService.runAppIdMaintenanceAppIdRuntime.mockImplementation(() => {
        const tenant = mockTenantStateService.setTenant.mock.calls[mockTenantStateService.setTenant.mock.calls.length - 1][0];
        if (tenant === 'tenant-a') {
          return of({ result: 'success' });
        }
        return throwError(() => new Error('Failure'));
      });

      component.update();
      tick();

      expect(tenant1.updateJobStatus).toBe('success');
      expect(tenant2.updateJobStatus).toBe('error');
      expect(component.selection.isEmpty()).toBe(true);
      expect(getTenantsSpy).toHaveBeenCalled();
    }));
  });

  describe('refreshTenant and refreshAppId', () => {
    let tenant: any;

    beforeEach(() => {
      tenant = {
        tenant: 'tenant-a',
        tenantQueryParameter: 'tenant-a',
        isRefreshingAppIdRuntimeData: false,
        appIdJobStatus: null,
      };
    });

    it('should call refreshAppId when refreshTenant is confirmed', () => {
      mockAppIdService.createRuntimeDataJobAppIdRuntime.mockReturnValue(of({ id: 'job-123' }));
      mockRuntimeDataService.pollJobStatus.mockReturnValue(of({ status: 'successful' }));
      const refreshAppIdSpy = jest.spyOn(component, 'refreshAppId');
      component.refreshTenant(tenant);
      expect(refreshAppIdSpy).toHaveBeenCalledWith(tenant);
    });

    it('should not refresh if already refreshing', () => {
      tenant.isRefreshingAppIdRuntimeData = true;
      component.refreshAppId(tenant);
      expect(mockAppIdService.createRuntimeDataJobAppIdRuntime).not.toHaveBeenCalled();
      tenant.isRefreshingAppIdRuntimeData = false;
    });

    it('should handle successful job creation and polling', fakeAsync(() => {
      const getTenantsSpy = jest.spyOn(component, 'getTenants').mockImplementation();
      mockAppIdService.createRuntimeDataJobAppIdRuntime.mockReturnValue(of({ id: 'job-123' }));
      mockRuntimeDataService.pollJobStatus.mockReturnValue(of({ status: 'successful' }));
      component.refreshAppId(tenant);
      tick();
      expect(tenant.appIdJobStatus).toBe('successful');
      expect(getTenantsSpy).toHaveBeenCalled();
      expect(tenant.isRefreshingAppIdRuntimeData).toBe(true);
    }));

    it('should handle job creation error', fakeAsync(() => {
      mockAppIdService.createRuntimeDataJobAppIdRuntime.mockReturnValue(throwError(() => new Error('Job Creation Failed')));
      component.refreshAppId(tenant);
      tick();
      expect(tenant.appIdJobStatus).toBe('error');
      expect(tenant.isRefreshingAppIdRuntimeData).toBe(false);
    }));

    it('should handle polling error', fakeAsync(() => {
      mockAppIdService.createRuntimeDataJobAppIdRuntime.mockReturnValue(of({ id: 'job-123' }));
      mockRuntimeDataService.pollJobStatus.mockReturnValue(throwError(() => new Error('Polling Failed')));
      component.refreshAppId(tenant);
      tick();
      expect(tenant.appIdJobStatus).toBe('error');
      expect(tenant.isRefreshingAppIdRuntimeData).toBe(false);
    }));

    it('should handle unsuccessful job status from polling', fakeAsync(() => {
      const getTenantsSpy = jest.spyOn(component, 'getTenants').mockImplementation();
      mockAppIdService.createRuntimeDataJobAppIdRuntime.mockReturnValue(of({ id: 'job-123' }));
      mockRuntimeDataService.pollJobStatus.mockReturnValue(of({ status: 'error' }));
      component.refreshAppId(tenant);
      tick();
      expect(tenant.appIdJobStatus).toBe('error');
      expect(getTenantsSpy).not.toHaveBeenCalled();
      expect(tenant.isRefreshingAppIdRuntimeData).toBe(true);
    }));
  });

  describe('Tier Management Modal', () => {
    const tenant = {
      tenant: 'tenant-a',
      tiers: [{ id: '1', appIdEnabled: false }],
    } as any;
    const mockDialogRef = {
      componentInstance: {
        saveChanges: new Subject<TierManagementSaveChanges>(),
        closeModal: new Subject<void>(),
      },
      close: jest.fn(),
    };

    beforeEach(() => {
      mockDialog.open.mockReturnValue(mockDialogRef as any);
    });

    it('should open tier management modal and handle save', fakeAsync(() => {
      const handleTierUpdatesSpy = jest.spyOn(component, 'handleTierUpdates').mockImplementation();
      component.openTierManagementModal(tenant);
      expect(mockDialog.open).toHaveBeenCalled();

      const changes = { tiersToUpdate: [{ id: '1', appIdEnabled: true }] };
      mockDialogRef.componentInstance.saveChanges.next(changes);
      tick();

      expect(handleTierUpdatesSpy).toHaveBeenCalledWith(tenant, changes.tiersToUpdate);
      expect(mockDialogRef.close).toHaveBeenCalled();
    }));

    it('should close modal on closeModal event', () => {
      component.openTierManagementModal(tenant);
      mockDialogRef.componentInstance.closeModal.next();
      expect(mockDialogRef.close).toHaveBeenCalled();
    });
  });

  describe('handleTierUpdates', () => {
    const tenant = { tenant: 'tenant-a' };
    const tiersToUpdate = [{ id: '1', appIdEnabled: true }];

    it('should call tier service to update tiers and refresh tenants on success', fakeAsync(() => {
      const getTenantsSpy = jest.spyOn(component, 'getTenants').mockImplementation();
      mockTierService.toggleAppIdTier.mockReturnValue(of({}));
      component.handleTierUpdates(tenant as any, tiersToUpdate);
      tick();
      expect(mockTierService.toggleAppIdTier).toHaveBeenCalledWith({ id: '1' });
      expect(getTenantsSpy).toHaveBeenCalled();
    }));

    it('should handle errors during tier updates', fakeAsync(() => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const getTenantsSpy = jest.spyOn(component, 'getTenants').mockImplementation();
      mockTierService.toggleAppIdTier.mockReturnValue(throwError(() => new Error('Update failed')));
      component.handleTierUpdates(tenant as any, tiersToUpdate);
      tick();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to update tier 1 for tenant tenant-a', expect.any(Error));
      expect(getTenantsSpy).toHaveBeenCalled(); // still called because of forkJoin
    }));
  });
});
