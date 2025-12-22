import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError, Subject } from 'rxjs';
import {
  AdminService,
  CreateWorkflowDtoWorkflowTypeEnum,
  Tenant,
  TenantCatalogItem,
  V2AppCentricTenantsService,
  V2WorkflowsService,
  Workflow,
  WorkflowStatusEnum,
} from 'client';
import { TenantStateService } from 'src/app/services/tenant-state.service';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { NgxSmartModalService } from 'ngx-smart-modal';

import { WorkflowsManagementComponent } from './workflows-management.component';

@Component({
  selector: 'app-table',
  template: '',
})
class TableStubComponent {
  @Input() config: any;
  @Input() data: any;
  @Input() itemsPerPage: any;
  @Input() searchColumns: any;
  @Output() tableEvent = new EventEmitter<any>();
  @Output() itemsPerPageChange = new EventEmitter<any>();
  @Output() clearResults = new EventEmitter<any>();
  @Output() searchParams = new EventEmitter<any>();
}

@Component({
  selector: 'app-workflow-view-modal',
  template: '',
})
class WorkflowViewModalStubComponent {}

describe('WorkflowsManagementComponent', () => {
  let component: WorkflowsManagementComponent;
  let fixture: ComponentFixture<WorkflowsManagementComponent>;
  let currentTenantContext: string | null;

  const workflowsServiceMock = {
    getManyWorkflow: jest.fn(),
    createOneWorkflow: jest.fn(),
    approveWorkflowWorkflow: jest.fn(),
  };
  const tenantsServiceMock = {
    getManyTenant: jest.fn(),
  };
  const adminServiceMock = {
    getTenantCatalogAdmin: jest.fn(),
  };
  const tenantStateServiceMock = {
    setTenant: jest.fn((tenant: string) => {
      currentTenantContext = tenant;
    }),
    clearTenant: jest.fn(() => {
      currentTenantContext = null;
    }),
    getTenant: jest.fn(() => currentTenantContext),
  };
  let workflowModalClose$: Subject<void>;
  let workflowModalInstance: any;
  const ngxSmartModalMock = {
    setModalData: jest.fn(),
    resetModalData: jest.fn(),
    getModal: jest.fn(() => workflowModalInstance),
  };

  const catalogMock: TenantCatalogItem[] = [
    { tenant: 'acct-one', tenantFullName: 'Account One' } as TenantCatalogItem,
    { tenant: 'acct-two', tenantFullName: 'Account Two' } as TenantCatalogItem,
  ];

  const createTenant = (id: string, alias: string, environmentId: string): Tenant =>
    ({
      id,
      name: alias,
      alias,
      description: alias,
      environmentId,
    } as Tenant);

  const createWorkflow = (
    id: string,
    tenantId: string,
    status: WorkflowStatusEnum,
    module: CreateWorkflowDtoWorkflowTypeEnum = CreateWorkflowDtoWorkflowTypeEnum.TenantUnderlay,
  ): Workflow =>
    ({
      id,
      tenantId,
      name: id,
      tenantIdDisplayName: tenantId,
      status,
      terraformModule: module,
      approvalType: 'manual',
      createdAt: '2024-01-01T00:00:00Z',
      finishedAt: null,
      plan: null as any,
      events: [],
      validationResult: null as any,
      currentJobId: 1,
    } as unknown as Workflow);

  const tenantResponses: Record<string, any> = {
    'acct-one': createTenantResponse([createTenant('tenant-1', 'Tenant One', 'Prod'), createTenant('tenant-2', 'Tenant Two', 'Stage')]),
    'acct-two': createTenantResponse([createTenant('tenant-3', 'Tenant Three', 'Prod')]),
  };

  const workflowResponses: Record<string, any> = {
    'acct-one': createWorkflowResponse([
      createWorkflow('wf-1', 'tenant-1', WorkflowStatusEnum.ValidAwaitingManualApproval),
      createWorkflow('wf-2', 'tenant-2', WorkflowStatusEnum.Completed),
    ]),
    'acct-two': createWorkflowResponse([]),
  };

  const emptyTenantResponse = createTenantResponse([]);
  const emptyWorkflowResponse = createWorkflowResponse([]);

  function createTenantResponse(data: Tenant[]) {
    return {
      totalPages: 1,
      count: data.length,
      total: data.length,
      page: 1,
      pageCount: 1,
      data,
    };
  }

  function createWorkflowResponse(data: Workflow[]) {
    return {
      totalPages: 1,
      count: data.length,
      total: data.length,
      page: 1,
      pageCount: 1,
      data,
    };
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WorkflowsManagementComponent, TableStubComponent, WorkflowViewModalStubComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: V2WorkflowsService, useValue: workflowsServiceMock },
        { provide: V2AppCentricTenantsService, useValue: tenantsServiceMock },
        { provide: AdminService, useValue: adminServiceMock },
        { provide: TenantStateService, useValue: tenantStateServiceMock },
        { provide: NgxSmartModalService, useValue: ngxSmartModalMock },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    currentTenantContext = null;
    workflowModalClose$ = new Subject<void>();
    workflowModalInstance = {
      open: jest.fn(),
      onCloseFinished: workflowModalClose$,
    };
    ngxSmartModalMock.getModal.mockReturnValue(workflowModalInstance);
  });

  const setupSuccessMocks = () => {
    adminServiceMock.getTenantCatalogAdmin.mockReturnValue(of(catalogMock));
    tenantsServiceMock.getManyTenant.mockImplementation(() => {
      const response = tenantResponses[currentTenantContext ?? 'acct-one'] ?? emptyTenantResponse;
      return of(response);
    });
    workflowsServiceMock.getManyWorkflow.mockImplementation(() => {
      const response = workflowResponses[currentTenantContext ?? 'acct-one'] ?? emptyWorkflowResponse;
      return of(response);
    });
    workflowsServiceMock.createOneWorkflow.mockReturnValue(of(null));
    workflowsServiceMock.approveWorkflowWorkflow.mockReturnValue(of(null));
  };

  const createComponent = (configureMocks?: () => void) => {
    if (configureMocks) {
      configureMocks();
    } else {
      setupSuccessMocks();
    }
    fixture = TestBed.createComponent(WorkflowsManagementComponent);
    component = fixture.componentInstance;
    component['workflowStatusTemplate'] = {} as any;
    component['approveActionsTemplate'] = {} as any;
    component['workflowActionsTemplate'] = {} as any;
    fixture.detectChanges();
  };

  const getTenant = (id: string) => component['tenantAccounts'].flatMap(account => account.tenants).find(tenant => tenant.tenantId === id);

  const requireTenant = (id: string) => {
    const tenant = getTenant(id);
    if (!tenant) {
      throw new Error(`Missing tenant ${id} in test data`);
    }
    return tenant;
  };

  it('should load tenant accounts on init', () => {
    createComponent();

    expect(adminServiceMock.getTenantCatalogAdmin).toHaveBeenCalledTimes(1);
    expect(component.tenantAccounts.length).toBe(2);
    expect(component.tenantAccounts[0].tenants.length).toBe(2);
    expect(component.tenantOptions.length).toBe(3);
    expect(component.launchForm.get('tenantId')?.value).toBe(component.tenantOptions[0].tenantId);
  });

  it('should handle empty catalog gracefully', () => {
    createComponent(() => {
      adminServiceMock.getTenantCatalogAdmin.mockReturnValue(of([]));
      tenantsServiceMock.getManyTenant.mockReturnValue(of(emptyTenantResponse));
      workflowsServiceMock.getManyWorkflow.mockReturnValue(of(emptyWorkflowResponse));
      workflowsServiceMock.createOneWorkflow.mockReturnValue(of(null));
      workflowsServiceMock.approveWorkflowWorkflow.mockReturnValue(of(null));
    });

    expect(component.tenantAccounts.length).toBe(0);
    expect(component.tenantOptions.length).toBe(0);
    expect(component.loadingError).toBeNull();
  });

  it('should capture errors while loading catalog', () => {
    createComponent(() => {
      adminServiceMock.getTenantCatalogAdmin.mockReturnValue(throwError(() => new Error('boom')));
      tenantsServiceMock.getManyTenant.mockReturnValue(of(emptyTenantResponse));
      workflowsServiceMock.getManyWorkflow.mockReturnValue(of(emptyWorkflowResponse));
      workflowsServiceMock.createOneWorkflow.mockReturnValue(of(null));
      workflowsServiceMock.approveWorkflowWorkflow.mockReturnValue(of(null));
    });

    expect(component.loadingError).toBe('Unable to load workflow data. Please refresh.');
    expect(component.tenantAccounts).toEqual([]);
  });

  it('should toggle tasks and tenant expansion state', () => {
    createComponent();

    component.setTask('approve');
    expect(component.activeTask).toBe('approve');

    const tenantId = component.tenantAccounts[0].tenants[0].tenantId;
    expect(component.isTenantExpanded('view', tenantId)).toBe(false);
    component.toggleTenant('view', tenantId);
    expect(component.isTenantExpanded('view', tenantId)).toBe(true);
    component.toggleTenant('view', tenantId);
    expect(component.isTenantExpanded('view', tenantId)).toBe(false);
  });

  it('should compute pending approvals across accounts', () => {
    createComponent();

    const pendingTenants = component.tenantsWithPendingApprovals;
    expect(pendingTenants.length).toBe(1);
    expect(pendingTenants[0].tenantId).toBe('tenant-1');

    const pendingAccounts = component.accountsWithPendingApprovals;
    expect(pendingAccounts.length).toBe(1);
    expect(pendingAccounts[0].accountName).toBe('acct-one');
    expect(pendingAccounts[0].tenants.length).toBe(1);
  });

  it('should return pending workflows for a tenant', () => {
    createComponent();
    const tenant = requireTenant('tenant-1');
    const pending = component.getPendingApprovals(tenant);
    expect(pending.length).toBe(1);
    expect(pending[0].id).toBe('wf-1');
  });

  it('should return workflow totals grouped by status', () => {
    createComponent();
    const tenant = requireTenant('tenant-1');
    const totals = component.getWorkflowTotals(tenant);
    // ValidAwaitingManualApproval is excluded from totals buckets but still counts toward total
    expect(totals).toEqual({ total: 1, running: 0, completed: 0, pending: 0, failed: 0 });
  });

  it('should ignore approval when tenant is missing', () => {
    createComponent();
    jest.spyOn(component as any, 'loadData').mockImplementation(() => {});
    component.approveWorkflow('unknown', 'wf-1');
    expect(workflowsServiceMock.approveWorkflowWorkflow).not.toHaveBeenCalled();
  });

  it('should approve a workflow within tenant context', () => {
    createComponent();
    jest.spyOn(component as any, 'loadData').mockImplementation(() => {});
    const tenant = requireTenant('tenant-1');

    component.approveWorkflow(tenant.tenantId, 'wf-1');

    expect(workflowsServiceMock.approveWorkflowWorkflow).toHaveBeenCalledWith({ id: 'wf-1' });
    expect(tenantStateServiceMock.setTenant).toHaveBeenCalledWith(tenant.accountName);
    expect(tenantStateServiceMock.clearTenant).toHaveBeenCalled();
  });

  it('should approve all pending workflows for a tenant', () => {
    createComponent();
    jest.spyOn(component as any, 'loadData').mockImplementation(() => {});
    const tenant = requireTenant('tenant-1');

    component.approveAllForTenant(tenant.tenantId);

    expect(workflowsServiceMock.approveWorkflowWorkflow).toHaveBeenCalledWith({ id: 'wf-1' });
    expect(tenantStateServiceMock.setTenant).toHaveBeenCalledWith(tenant.accountName);
  });

  it('should skip duplicate approvals for the same workflow', () => {
    createComponent();
    jest.spyOn(component as any, 'loadData').mockImplementation(() => {});
    const tenant = requireTenant('tenant-1');
    component['approvingWorkflows'].add('wf-1');

    component.approveWorkflow(tenant.tenantId, 'wf-1');

    expect(workflowsServiceMock.approveWorkflowWorkflow).not.toHaveBeenCalledWith({ id: 'wf-1' });
  });

  it('should skip approve all when no pending workflows', () => {
    createComponent();
    jest.spyOn(component as any, 'loadData').mockImplementation(() => {});
    const tenant = requireTenant('tenant-2');

    component.approveAllForTenant(tenant.tenantId);

    expect(workflowsServiceMock.approveWorkflowWorkflow).not.toHaveBeenCalled();
  });

  it('should skip approve-all when tenant not found', () => {
    createComponent();
    jest.spyOn(component as any, 'loadData').mockImplementation(() => {});
    component.approveAllForTenant('unknown');
    expect(workflowsServiceMock.approveWorkflowWorkflow).not.toHaveBeenCalled();
  });

  it('should handle approval errors gracefully for single workflow', () => {
    createComponent();
    const loadSpy = jest.spyOn(component as any, 'loadData').mockImplementation(() => {});
    workflowsServiceMock.approveWorkflowWorkflow.mockReturnValueOnce(throwError(() => new Error('fail')));
    const tenant = requireTenant('tenant-1');

    component.approveWorkflow(tenant.tenantId, 'wf-1');

    expect(loadSpy).toHaveBeenCalled();
  });

  it('should handle approval errors gracefully for approve all', () => {
    createComponent();
    const loadSpy = jest.spyOn(component as any, 'loadData').mockImplementation(() => {});
    workflowsServiceMock.approveWorkflowWorkflow.mockReturnValue(throwError(() => new Error('fail')));
    const tenant = requireTenant('tenant-1');

    component.approveAllForTenant(tenant.tenantId);

    expect(loadSpy).toHaveBeenCalled();
  });

  it('should mark controls when launch form invalid', () => {
    createComponent();
    component.launchForm.get('tenantId')?.setValue('');
    const markSpy = jest.spyOn(component.launchForm, 'markAllAsTouched');

    component.onLaunchWorkflow();

    expect(markSpy).toHaveBeenCalled();
    expect(component.launchErrorMessage).toBe('');
  });

  it('should warn when selected tenant option is missing', () => {
    createComponent();
    component.launchForm.patchValue({ tenantId: 'missing', moduleType: CreateWorkflowDtoWorkflowTypeEnum.TenantUnderlay });

    component.onLaunchWorkflow();

    expect(component.launchErrorMessage).toBe('Please select a tenant.');
  });

  it('should launch individual workflow success path', () => {
    createComponent();
    jest.spyOn(component as any, 'loadData').mockImplementation(() => {});
    const tenantOption = component.tenantOptions[0];
    component.launchForm.patchValue({
      tenantId: tenantOption.tenantId,
      launchMode: 'module',
      moduleType: CreateWorkflowDtoWorkflowTypeEnum.TenantUnderlay,
    });

    component.onLaunchWorkflow();

    expect(workflowsServiceMock.createOneWorkflow).toHaveBeenCalled();
    expect(component.launchSuccessMessage).toContain('workflow launched');
    expect(component.launchForm.get('tenantId')?.value).toBe(tenantOption.tenantId);
  });

  it('should fall back to single module when group has no modules', () => {
    createComponent();
    jest.spyOn(component as any, 'loadData').mockImplementation(() => {});
    component['groupLaunchOptions'] = [{ id: 'custom-group', label: 'Custom', description: 'x', modules: [] }];
    const tenantOption = component.tenantOptions[0];
    component.launchForm.patchValue({
      launchMode: 'group',
      tenantId: tenantOption.tenantId,
      groupType: 'custom-group',
    });

    component.onLaunchWorkflow();

    expect(workflowsServiceMock.createOneWorkflow).toHaveBeenCalled();
  });

  it('should launch workflow group and trigger each module', () => {
    createComponent();
    jest.spyOn(component as any, 'loadData').mockImplementation(() => {});
    const tenantOption = component.tenantOptions[0];
    const modules = component['groupLaunchOptions'][0].modules;
    component.launchForm.patchValue({
      launchMode: 'group',
      tenantId: tenantOption.tenantId,
      groupType: component['groupLaunchOptions'][0].id,
    });
    jest.clearAllMocks();
    workflowsServiceMock.createOneWorkflow.mockReturnValue(of(null));

    component.onLaunchWorkflow();

    expect(workflowsServiceMock.createOneWorkflow).toHaveBeenCalledTimes(modules.length);
    expect(component.launchSuccessMessage).toContain(`${modules.length} workflows`);
  });

  it('should surface launch errors to the user', () => {
    createComponent();
    jest.spyOn(component as any, 'loadData').mockImplementation(() => {});
    const tenantOption = component.tenantOptions[0];
    workflowsServiceMock.createOneWorkflow.mockReturnValueOnce(throwError(() => new Error('boom')));
    component.launchForm.patchValue({
      tenantId: tenantOption.tenantId,
      launchMode: 'module',
      moduleType: CreateWorkflowDtoWorkflowTypeEnum.TenantUnderlay,
    });

    component.onLaunchWorkflow();

    expect(component.launchErrorMessage).toBe('Unable to launch workflow. Please try again.');
  });

  it('should toggle launch mode pills', () => {
    createComponent();
    const control = component.launchForm.get('launchMode');
    if (!control) {
      throw new Error('Missing launchMode control');
    }
    const spy = jest.spyOn(control, 'setValue');

    component.setLaunchMode('module');
    expect(spy).not.toHaveBeenCalled();

    component.setLaunchMode('group');
    expect(spy).toHaveBeenCalledWith('group');
  });

  it('should compute tenant table data and clamp pages', () => {
    createComponent();
    const tenant = requireTenant('tenant-1');
    component['tenantTableState'][tenant.tenantId] = {
      view: { page: 5, perPage: 1 },
      approve: { page: 1, perPage: 20 },
    };

    const result = component.getTenantTableData(tenant, 'view');
    expect(result.page).toBe(1);
    expect(result.data.length).toBe(1);
  });

  it('should update table pager state via events', () => {
    createComponent();
    const tenant = requireTenant('tenant-1');
    component.onTenantTableEvent(tenant.tenantId, 'view', new TableComponentDto(5, 3));
    const state = component['tenantTableState'][tenant.tenantId].view;
    expect(state.perPage).toBe(5);
    expect(state.page).toBe(3);

    component.onTenantTableEvent(tenant.tenantId, 'view', null);
    expect(component['tenantTableState'][tenant.tenantId].view.page).toBe(3);
  });

  it('should provide trackBy helpers and formatting utilities', () => {
    createComponent();
    const tenant = requireTenant('tenant-1');
    const account = component.tenantAccounts[0];
    expect(component.trackByTenant(0, tenant)).toBe(tenant.tenantId);
    expect(component.trackByAccount(0, account)).toBe(account.accountName);
    expect(component.trackByWorkflow(0, createWorkflow('wf-x', tenant.tenantId, WorkflowStatusEnum.Pending))).toBe('wf-x');
    expect(component.formatStatus('in_progress')).toBe('In Progress');
    expect(component.formatStatus(undefined as any)).toBe('');
    expect(component.formatLabel(undefined as any)).toBe('');
    expect(component.formatLabel('tenant_underlay')).toBe('Tenant_underlay');
    expect(component.formatDate(undefined)).toBe('—');
    expect(component.formatDate('2024-01-01T00:00:00Z')).not.toBe('—');
    expect(component.formatDate('invalid-date')).toBe('—');
  });

  it('should maintain tenant selection defaults', () => {
    createComponent();
    component.launchForm.patchValue({ tenantId: '' });
    component.tenantOptions = [{ accountName: 'acct', accountDisplayName: 'Account', tenantId: 't-id', tenantName: 'Tenant' }];
    component['ensureLaunchFormTenant']();
    expect(component.launchForm.get('tenantId')?.value).toBe('t-id');

    component.launchForm.patchValue({ tenantId: '' });
    component.tenantOptions = [];
    component['ensureLaunchFormTenant']();
    expect(component.launchForm.get('tenantId')?.value).toBe('');
  });

  it('should build select options sorted by account and tenant name', () => {
    createComponent();
    const options = component['buildTenantSelectOptions']([
      {
        accountName: 'acct-b',
        accountDisplayName: 'B',
        tenants: [{ tenantId: 't2', tenantName: 'Tenant B', accountName: 'acct-b', accountDisplayName: 'B', workflows: [] }],
      },
      {
        accountName: 'acct-a',
        accountDisplayName: 'A',
        tenants: [{ tenantId: 't1', tenantName: 'Tenant A', accountName: 'acct-a', accountDisplayName: 'A', workflows: [] }],
      },
    ]);
    expect(options[0].accountDisplayName).toBe('A');
    expect(options[0].tenantId).toBe('t1');
  });

  it('should include tenants without workflows per account', () => {
    createComponent();
    const accountSummary = component['buildTenantWorkflowsForAccount'](
      'acct-one',
      'Account One',
      tenantResponses['acct-one'].data,
      workflowResponses['acct-one'].data.slice(0, 1),
    );
    const emptyTenant = accountSummary.find(summary => summary.tenantId === 'tenant-2');
    expect(emptyTenant).toBeDefined();
    expect(emptyTenant?.workflows.length).toBe(0);
    const populatedTenant = accountSummary.find(summary => summary.tenantId === 'tenant-1');
    expect(populatedTenant?.accountName).toBe('acct-one');
    expect(populatedTenant?.environment).toBe('Prod');
  });

  it('should manage launch mode validators when toggling', () => {
    createComponent();
    component['updateLaunchModeValidators']('group');
    expect(component.launchForm.get('moduleType')?.validator).toBeNull();
    expect(component.launchForm.get('groupType')?.validator).toBeDefined();

    component['updateLaunchModeValidators']('module');
    expect(component.launchForm.get('moduleType')?.validator).toBeDefined();
  });

  it('should provide tenant table state per tenant', () => {
    createComponent();
    const state = component['getTenantTableState']('custom-tenant', 'view');
    expect(state).toEqual({ page: 1, perPage: 20 });
    const sameState = component['getTenantTableState']('custom-tenant', 'view');
    expect(sameState).toBe(state);
  });

  it('should run work inside tenant context helper', done => {
    createComponent();
    (component as any)
      .runInTenantContext('acct-one', () => of('value'))
      .subscribe(result => {
        expect(result).toBe('value');
        expect(tenantStateServiceMock.setTenant).toHaveBeenCalledWith('acct-one');
        expect(tenantStateServiceMock.clearTenant).toHaveBeenCalled();
        done();
      });
  });

  it('should load account data using tenant context', done => {
    createComponent();
    jest.spyOn(component as any, 'runInTenantContext').mockImplementation((_tenant: string, work: () => any) => work());
    tenantsServiceMock.getManyTenant.mockReturnValue(of(tenantResponses['acct-one']));
    workflowsServiceMock.getManyWorkflow.mockReturnValue(of(workflowResponses['acct-one']));

    (component as any).loadAccountData(catalogMock[0]).subscribe(summary => {
      expect(summary.accountName).toBe('acct-one');
      expect(summary.tenants.length).toBeGreaterThan(0);
      done();
    });
  });

  it('should expose view and approve table configs', () => {
    createComponent();
    const tenant = requireTenant('tenant-1');
    const viewConfig = component.getViewTableConfig(tenant.tenantId);
    const approveConfig = component.getApproveTableConfig(tenant.tenantId);
    expect(viewConfig.description).toBe(`view-workflows-${tenant.tenantId}`);
    expect(approveConfig.description).toBe(`approve-workflows-${tenant.tenantId}`);
    const sampleWorkflow = createWorkflow('wf-sample', tenant.tenantId, WorkflowStatusEnum.Pending);
    expect(viewConfig.columns[1].template?.()).toBe(component['workflowStatusTemplate']);
    expect(viewConfig.columns[2].value?.(sampleWorkflow)).toBe(component.formatLabel(sampleWorkflow.terraformModule));
    expect(viewConfig.columns[3].value?.(sampleWorkflow)).toBe(component.formatLabel(sampleWorkflow.approvalType as any));
    expect(typeof viewConfig.columns[4].value?.(sampleWorkflow)).toBe('string');
    expect(typeof viewConfig.columns[5].value?.(sampleWorkflow)).toBe('string');
    expect(viewConfig.columns[6].template?.()).toBe(component['workflowActionsTemplate']);
    expect(approveConfig.columns[1].template?.()).toBe(component['workflowStatusTemplate']);
    expect(typeof approveConfig.columns[2].value?.(sampleWorkflow)).toBe('string');
    expect(approveConfig.columns[3].value?.(sampleWorkflow)).toBe(component.formatLabel(sampleWorkflow.terraformModule));
    expect(approveConfig.columns[4].value?.(sampleWorkflow)).toBe(component.formatLabel(sampleWorkflow.approvalType as any));
    expect(approveConfig.columns[5].template?.()).toBe(component['approveActionsTemplate']);
  });

  it('should reflect launch mode helpers', () => {
    createComponent();
    component.launchForm.patchValue({ launchMode: 'group', groupType: component['groupLaunchOptions'][0].id });
    expect(component.isGroupLaunchMode()).toBe(true);
    expect(component.selectedGroupOption?.id).toBe(component['groupLaunchOptions'][0].id);
  });

  it('should use approve table data when mode is approve', () => {
    createComponent();
    const tenant = requireTenant('tenant-1');
    component['tenantTableState'][tenant.tenantId] = {
      view: { page: 1, perPage: 20 },
      approve: { page: 1, perPage: 20 },
    };

    const result = component.getTenantTableData(tenant, 'approve');
    expect(result.data.length).toBe(component.getPendingApprovals(tenant).length);
  });

  it('should report when workflow is currently approving', () => {
    createComponent();
    component['approvingWorkflows'].add('wf-1');
    expect(component.isApproving('wf-1')).toBe(true);
    expect(component.isApproving('wf-x')).toBe(false);
  });

  it('should open workflow view modal with tenant context and refresh after close', () => {
    createComponent();
    const loadSpy = jest.spyOn(component as any, 'loadData').mockImplementation(() => {});
    const tenant = requireTenant('tenant-1');
    const workflow = tenant.workflows[0];

    component.openWorkflowDetails(workflow);

    expect(tenantStateServiceMock.setTenant).toHaveBeenCalledWith(tenant.accountName);
    expect(ngxSmartModalMock.setModalData).toHaveBeenCalledWith({ workflowId: workflow.id }, 'workflowViewModal');
    expect(workflowModalInstance.open).toHaveBeenCalled();

    workflowModalClose$.next();
    expect(ngxSmartModalMock.resetModalData).toHaveBeenCalledWith('workflowViewModal');
    expect(tenantStateServiceMock.clearTenant).toHaveBeenCalled();
    expect(loadSpy).toHaveBeenCalled();
  });

  it('should skip opening workflow modal when context missing', () => {
    createComponent();
    const workflow = createWorkflow('wf-missing', 'unknown-tenant', WorkflowStatusEnum.Pending);

    component.openWorkflowDetails(workflow);

    expect(ngxSmartModalMock.setModalData).not.toHaveBeenCalled();
    expect(workflowModalInstance.open).not.toHaveBeenCalled();
  });

  it('should handle missing data when loading account details', done => {
    createComponent();
    jest.spyOn(component as any, 'runInTenantContext').mockImplementation((_tenant: string, work: () => any) => work());
    tenantsServiceMock.getManyTenant.mockReturnValue(of(undefined as any));
    workflowsServiceMock.getManyWorkflow.mockReturnValue(of(undefined as any));

    (component as any).loadAccountData(catalogMock[0]).subscribe(summary => {
      expect(summary.tenants.length).toBe(0);
      done();
    });
  });

  it('should fall back to tenant name and environment defaults', () => {
    createComponent();
    const tenants = [
      {
        id: 'tenant-fallback',
        name: 'Tenant Name',
        alias: undefined,
        environmentId: undefined,
      } as unknown as Tenant,
    ];
    const workflows = [createWorkflow('wf-fallback', 'tenant-fallback', WorkflowStatusEnum.Completed)];

    const summaries = component['buildTenantWorkflowsForAccount']('acct', 'Account', tenants, workflows);
    expect(summaries[0].tenantName).toBe('Tenant Name');
    expect(summaries[0].environment).toBe('Unspecified');
  });

  it('should fall back to tenant id when metadata missing', () => {
    createComponent();
    const tenants = [
      {
        id: 'tenant-id',
        name: undefined,
        alias: undefined,
        environmentId: undefined,
      } as unknown as Tenant,
    ];
    const workflows: Workflow[] = [];

    const summaries = component['buildTenantWorkflowsForAccount']('acct', 'Account', tenants, workflows);
    expect(summaries[0].tenantName).toBe('tenant-id');
    expect(summaries[0].environment).toBe('Unspecified');
  });
});
