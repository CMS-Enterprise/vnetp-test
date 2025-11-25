import { AfterViewInit, ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  CreateWorkflowDtoWorkflowTypeEnum,
  Tenant,
  V2AppCentricTenantsService,
  V2WorkflowsService,
  Workflow,
  WorkflowStatusEnum,
} from 'client';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { TableConfig } from 'src/app/common/table/table.component';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';

interface TenantWorkflowSummary {
  tenantId: string;
  tenantName: string;
  environment?: string;
  workflows: Workflow[];
}

type TenantLite = Pick<Tenant, 'id' | 'name' | 'alias' | 'description' | 'environmentId'>;
type TenantTableMode = 'view' | 'approve';

interface TablePagerState {
  page: number;
  perPage: number;
}

interface TenantTableState {
  view: TablePagerState;
  approve: TablePagerState;
}

interface WorkflowTableData {
  data: Workflow[];
  count: number;
  total: number;
  page: number;
  pageCount: number;
}

type LaunchMode = 'module' | 'group';

interface GroupLaunchOption {
  id: string;
  label: string;
  description: string;
  modules: CreateWorkflowDtoWorkflowTypeEnum[];
}

@Component({
  selector: 'app-workflows-management',
  templateUrl: './workflows-management.component.html',
  styleUrls: ['./workflows-management.component.scss'],
})
export class WorkflowsManagementComponent implements OnInit, AfterViewInit {
  @ViewChild('workflowStatusTemplate') workflowStatusTemplate: TemplateRef<any>;
  @ViewChild('approveActionsTemplate') approveActionsTemplate: TemplateRef<any>;
  activeTask: 'view' | 'approve' | 'launch' = 'view';
  tenantWorkflows: TenantWorkflowSummary[] = [];
  launchForm: FormGroup;
  launchSuccessMessage = '';
  launchErrorMessage = '';

  isLoading = false;
  loadingError: string | null = null;
  isLaunching = false;

  readonly workflowTypeOptions = Object.values(CreateWorkflowDtoWorkflowTypeEnum);
  readonly approvalRequiredStatuses = new Set<WorkflowStatusEnum>([
    WorkflowStatusEnum.ValidAwaitingManualApproval,
    WorkflowStatusEnum.InvalidApplyable,
  ]);
  readonly defaultItemsPerPage = 20;
  readonly groupLaunchOptions: GroupLaunchOption[] = [
    {
      id: 'logicalTenantChanges',
      label: 'Logical Tenant Changes Group',
      description: 'Runs the underlay modules required to roll out logical tenant changes across tenant, firewall, and transit tiers.',
      modules: [
        CreateWorkflowDtoWorkflowTypeEnum.TenantUnderlay,
        CreateWorkflowDtoWorkflowTypeEnum.TenantFirewallUnderlay,
        CreateWorkflowDtoWorkflowTypeEnum.TransitTenantUnderlay,
      ],
    },
  ];

  tenantOptions: TenantLite[] = [];
  tenantTableState: Record<string, TenantTableState> = {};

  private expandedTenants: Record<'view' | 'approve', Set<string>> = {
    view: new Set<string>(),
    approve: new Set<string>(),
  };

  private tenantLookup = new Map<string, TenantLite>();
  private approvingWorkflows = new Set<string>();

  private readonly workflowsPerPage = 200;
  private readonly tenantFilter = ['tenantVersion||eq||2'];
  public viewTableConfig: TableConfig<Workflow>;
  public approveTableConfig: TableConfig<Workflow>;

  constructor(
    private fb: FormBuilder,
    private workflowsService: V2WorkflowsService,
    private tenantsService: V2AppCentricTenantsService,
    private cdRef: ChangeDetectorRef,
  ) {
    const defaultModuleType = this.workflowTypeOptions[0] ?? '';
    const defaultGroup = this.groupLaunchOptions[0]?.id ?? '';
    this.launchForm = this.fb.group({
      launchMode: ['module', Validators.required],
      tenantId: ['', Validators.required],
      moduleType: [defaultModuleType, Validators.required],
      groupType: [defaultGroup],
    });

    this.updateLaunchModeValidators('module');
    this.launchForm
      .get('launchMode')
      ?.valueChanges.subscribe(mode => this.updateLaunchModeValidators(mode as LaunchMode));
  }

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.initializeTableConfigs();
  }

  setTask(task: 'view' | 'approve' | 'launch'): void {
    this.activeTask = task;
  }

  toggleTenant(task: 'view' | 'approve', tenantId: string): void {
    const set = this.expandedTenants[task];
    if (set.has(tenantId)) {
      set.delete(tenantId);
    } else {
      set.add(tenantId);
    }
  }

  isTenantExpanded(task: 'view' | 'approve', tenantId: string): boolean {
    return this.expandedTenants[task].has(tenantId);
  }

  get tenantsWithPendingApprovals(): TenantWorkflowSummary[] {
    return this.tenantWorkflows.filter(tenant => this.getPendingApprovals(tenant).length > 0);
  }

  get totalPendingApprovals(): number {
    return this.tenantsWithPendingApprovals.reduce(
      (total, tenant) => total + this.getPendingApprovals(tenant).length,
      0,
    );
  }

  getPendingApprovals(tenant: TenantWorkflowSummary): Workflow[] {
    return tenant.workflows.filter(workflow => this.approvalRequiredStatuses.has(workflow.status as WorkflowStatusEnum));
  }

  getWorkflowTotals(tenant: TenantWorkflowSummary): { total: number; running: number; completed: number } {
    const total = tenant.workflows.length;
    const runningStatuses = new Set<WorkflowStatusEnum>([
      WorkflowStatusEnum.Pending,
      WorkflowStatusEnum.Planning,
      WorkflowStatusEnum.Validating,
      WorkflowStatusEnum.Applying,
      WorkflowStatusEnum.Approved,
    ]);
    const completedStatuses = new Set<WorkflowStatusEnum>([
      WorkflowStatusEnum.Completed,
      WorkflowStatusEnum.CompletedNoChanges,
      WorkflowStatusEnum.ApplyFailed,
    ]);
    const running = tenant.workflows.filter(workflow => runningStatuses.has(workflow.status as WorkflowStatusEnum)).length;
    const completed = tenant.workflows.filter(workflow => completedStatuses.has(workflow.status as WorkflowStatusEnum)).length;
    return { total, running, completed };
  }

  approveWorkflow(_tenantId: string, workflowId: string): void {
    if (!workflowId || this.approvingWorkflows.has(workflowId)) {
      return;
    }
    this.approvingWorkflows.add(workflowId);
    this.workflowsService
      .approveWorkflowWorkflow({ id: workflowId })
      .pipe(
        finalize(() => {
          this.approvingWorkflows.delete(workflowId);
        }),
      )
      .subscribe({
        next: () => this.loadData(),
        error: () => this.loadData(),
      });
  }

  approveAllForTenant(tenantId: string): void {
    const tenant = this.tenantWorkflows.find(tw => tw.tenantId === tenantId);
    if (!tenant) {
      return;
    }
    const pending = this.getPendingApprovals(tenant);
    if (pending.length === 0) {
      return;
    }
    pending.forEach(wf => this.approvingWorkflows.add(wf.id));
    forkJoin(pending.map(workflow => this.workflowsService.approveWorkflowWorkflow({ id: workflow.id })))
      .pipe(
        finalize(() => {
          pending.forEach(wf => this.approvingWorkflows.delete(wf.id));
        }),
      )
      .subscribe({
        next: () => this.loadData(),
        error: () => this.loadData(),
      });
  }

  isApproving(workflowId: string): boolean {
    return this.approvingWorkflows.has(workflowId);
  }

  onLaunchWorkflow(): void {
    if (this.launchForm.invalid || this.isLaunching) {
      this.launchForm.markAllAsTouched();
      return;
    }
    const tenantId = this.launchForm.get('tenantId')?.value;
    const launchMode = (this.launchForm.get('launchMode')?.value as LaunchMode) ?? 'module';
    const moduleType = this.launchForm.get('moduleType')?.value as CreateWorkflowDtoWorkflowTypeEnum;
    const groupType = this.launchForm.get('groupType')?.value;
    const groupOption = this.groupLaunchOptions.find(option => option.id === groupType);

    this.launchSuccessMessage = '';
    this.launchErrorMessage = '';
    this.isLaunching = true;
    const request$ =
      launchMode === 'group'
        ? this.launchWorkflowGroup(tenantId, groupType)
        : this.launchIndividualWorkflow(tenantId, moduleType);

    request$
      .pipe(
        finalize(() => {
          this.isLaunching = false;
        }),
      )
      .subscribe({
        next: () => {
          this.launchSuccessMessage =
            launchMode === 'group'
              ? `${groupOption?.label ?? 'Workflow group'} launched (${groupOption?.modules.length ?? 0} workflows).`
              : `${this.formatLabel(moduleType)} workflow launched.`;
          this.loadData();
          this.resetLaunchFormAfterSubmit(launchMode, tenantId);
        },
        error: () => {
          this.launchErrorMessage = 'Unable to launch workflow. Please try again.';
        },
      });
  }

  trackByTenant(_index: number, tenant: TenantWorkflowSummary): string {
    return tenant.tenantId;
  }

  trackByWorkflow(_index: number, workflow: Workflow): string {
    return workflow.id;
  }

  formatStatus(status: string): string {
    if (!status) {
      return '';
    }
    return status
      .split('_')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  formatLabel(value: string): string {
    if (!value) {
      return '';
    }
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  formatDate(value?: string): string {
    if (!value) {
      return '—';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '—';
    }
    return date.toLocaleString();
  }

  getTenantTableData(tenant: TenantWorkflowSummary, mode: TenantTableMode): WorkflowTableData {
    const source = this.getTenantTableSource(tenant, mode);
    const state = this.getTenantTableState(tenant.tenantId, mode);
    const total = source.length;
    const pageCount = Math.max(1, Math.ceil(total / state.perPage) || 1);
    if (state.page > pageCount) {
      state.page = pageCount;
    }
    const startIndex = (state.page - 1) * state.perPage;
    const pagedData = source.slice(startIndex, startIndex + state.perPage);
    return {
      data: pagedData,
      count: pagedData.length,
      total,
      page: state.page,
      pageCount,
    };
  }

  getTenantTableState(tenantId: string, mode: TenantTableMode): TablePagerState {
    return this.ensureTenantTableState(tenantId)[mode];
  }

  onTenantTableEvent(tenantId: string, mode: TenantTableMode, event: TableComponentDto): void {
    if (!event) {
      return;
    }
    const state = this.getTenantTableState(tenantId, mode);
    if (event.perPage) {
      state.perPage = event.perPage;
    }
    if (event.page) {
      state.page = event.page;
    }
  }

  getViewTableConfig(tenantId: string): TableConfig<Workflow> {
    return {
      ...this.viewTableConfig,
      description: `view-workflows-${tenantId}`,
    };
  }

  getApproveTableConfig(tenantId: string): TableConfig<Workflow> {
    return {
      ...this.approveTableConfig,
      description: `approve-workflows-${tenantId}`,
    };
  }

  isGroupLaunchMode(): boolean {
    return (this.launchForm.get('launchMode')?.value as LaunchMode) === 'group';
  }

  get selectedGroupOption(): GroupLaunchOption | undefined {
    const selectedId = this.launchForm.get('groupType')?.value;
    return this.groupLaunchOptions.find(option => option.id === selectedId);
  }

  setLaunchMode(mode: LaunchMode): void {
    const control = this.launchForm.get('launchMode');
    if (control?.value === mode) {
      return;
    }
    control?.setValue(mode);
  }

  private loadData(): void {
    this.isLoading = true;
    this.loadingError = null;
    forkJoin({
      workflows: this.workflowsService.getManyWorkflow({
        perPage: this.workflowsPerPage,
        page: 1,
        sort: ['createdAt,DESC'],
        fields: ['id', 'name', 'status', 'tenantId', 'terraformModule', 'approvalType', 'createdAt', 'finishedAt'],
      }),
      tenants: this.tenantsService.getManyTenant({
        perPage: 200,
        page: 1,
        filter: this.tenantFilter,
        fields: ['id', 'name', 'alias', 'description', 'environmentId'],
      }),
    })
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: ({ workflows, tenants }) => {
          this.buildTenantLookup(tenants.data);
          this.tenantWorkflows = this.buildTenantWorkflows(workflows.data);
          this.ensureLaunchFormTenant();
        },
        error: () => {
          this.loadingError = 'Unable to load workflow data. Please refresh.';
          this.tenantWorkflows = [];
        },
      });
  }

  private ensureLaunchFormTenant(): void {
    const currentTenantId = this.launchForm.get('tenantId')?.value;
    if (!currentTenantId && this.tenantOptions.length) {
      this.launchForm.patchValue({ tenantId: this.tenantOptions[0].id });
    }
  }

  private buildTenantLookup(tenants: TenantLite[]): void {
    this.tenantLookup.clear();
    tenants?.forEach(tenant => {
      this.tenantLookup.set(tenant.id, tenant);
    });
    this.tenantOptions = (tenants || []).slice().sort((a, b) => {
      const aName = a.alias || a.name || a.id;
      const bName = b.alias || b.name || b.id;
      return aName.localeCompare(bName);
    });
  }

  private buildTenantWorkflows(workflows: Workflow[]): TenantWorkflowSummary[] {
    const summaries = new Map<string, TenantWorkflowSummary>();
    workflows?.forEach(workflow => {
      const existing = summaries.get(workflow.tenantId);
      if (existing) {
        existing.workflows.push(workflow);
      } else {
        summaries.set(workflow.tenantId, {
          tenantId: workflow.tenantId,
          tenantName: this.getTenantName(workflow.tenantId),
          environment: this.getTenantEnvironment(workflow.tenantId),
          workflows: [workflow],
        });
      }
    });
    return Array.from(summaries.values()).sort((a, b) => a.tenantName.localeCompare(b.tenantName));
  }

  private getTenantName(tenantId: string): string {
    const tenant = this.tenantLookup.get(tenantId);
    return tenant?.alias || tenant?.name || tenantId;
  }

  private getTenantEnvironment(tenantId: string): string {
    const tenant = this.tenantLookup.get(tenantId);
    return tenant?.environmentId || 'Unspecified';
  }

  private initializeTableConfigs(): void {
    this.viewTableConfig = {
      description: 'admin-workflows-view',
      hideSearchBar: true,
      hideAdvancedSearch: true,
      columns: [
        { name: 'Name', property: 'name' },
        { name: 'Status', template: () => this.workflowStatusTemplate },
        { name: 'Terraform Module', value: wf => this.formatLabel(wf.terraformModule) },
        { name: 'Approval Type', value: wf => this.formatLabel(wf.approvalType) },
        { name: 'Created', value: wf => this.formatDate(wf.createdAt) },
        { name: 'Finished', value: wf => this.formatDate(wf.finishedAt) },
      ],
    };

    this.approveTableConfig = {
      description: 'admin-workflows-approve',
      hideSearchBar: true,
      hideAdvancedSearch: true,
      columns: [
        { name: 'Name', property: 'name' },
        { name: 'Status', template: () => this.workflowStatusTemplate },
        { name: 'Created', value: wf => this.formatDate(wf.createdAt) },
        { name: 'Terraform Module', value: wf => this.formatLabel(wf.terraformModule) },
        { name: 'Approval Type', value: wf => this.formatLabel(wf.approvalType) },
        { name: 'Actions', template: () => this.approveActionsTemplate },
      ],
    };

    this.cdRef.detectChanges();
  }

  private ensureTenantTableState(tenantId: string): TenantTableState {
    if (!this.tenantTableState[tenantId]) {
      this.tenantTableState[tenantId] = {
        view: { page: 1, perPage: this.defaultItemsPerPage },
        approve: { page: 1, perPage: this.defaultItemsPerPage },
      };
    }
    return this.tenantTableState[tenantId];
  }

  private getTenantTableSource(tenant: TenantWorkflowSummary, mode: TenantTableMode): Workflow[] {
    if (mode === 'approve') {
      return this.getPendingApprovals(tenant);
    }
    return tenant.workflows;
  }

  private updateLaunchModeValidators(mode: LaunchMode): void {
    const moduleCtrl = this.launchForm.get('moduleType');
    const groupCtrl = this.launchForm.get('groupType');
    if (mode === 'module') {
      moduleCtrl?.setValidators([Validators.required]);
      groupCtrl?.clearValidators();
    } else {
      groupCtrl?.setValidators([Validators.required]);
      moduleCtrl?.clearValidators();
    }
    moduleCtrl?.updateValueAndValidity({ emitEvent: false });
    groupCtrl?.updateValueAndValidity({ emitEvent: false });
  }

  private launchIndividualWorkflow(tenantId: string, workflowType: CreateWorkflowDtoWorkflowTypeEnum) {
    return this.workflowsService.createOneWorkflow({
      createWorkflowDto: {
        tenantId,
        workflowType,
      },
    });
  }

  private launchWorkflowGroup(tenantId: string, groupId: string) {
    const option = this.groupLaunchOptions.find(opt => opt.id === groupId);
    const modules = option?.modules ?? [];
    if (!modules.length) {
      const fallbackType =
        this.workflowTypeOptions[0] ?? CreateWorkflowDtoWorkflowTypeEnum.TenantUnderlay;
      return this.launchIndividualWorkflow(tenantId, fallbackType);
    }
    return forkJoin(
      modules.map(workflowType =>
        this.workflowsService.createOneWorkflow({
          createWorkflowDto: {
            tenantId,
            workflowType,
          },
        }),
      ),
    );
  }

  private resetLaunchFormAfterSubmit(mode: LaunchMode, tenantId: string): void {
    const defaultModuleType = this.workflowTypeOptions[0] ?? '';
    const defaultGroup = this.groupLaunchOptions[0]?.id ?? '';
    this.launchForm.reset({
      launchMode: mode,
      tenantId,
      moduleType: defaultModuleType,
      groupType: defaultGroup,
    });
    this.updateLaunchModeValidators(mode);
  }
}

