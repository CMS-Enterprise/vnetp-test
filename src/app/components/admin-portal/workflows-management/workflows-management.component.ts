import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { forkJoin, from, of, Observable, Subscription } from 'rxjs';
import { concatMap, finalize, map, switchMap, toArray } from 'rxjs/operators';
import { TableConfig } from 'src/app/common/table/table.component';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { TenantStateService } from 'src/app/services/tenant-state.service';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { WorkflowViewModalData } from '../../appcentric/tenant-select/tenant-portal/workflow/workflow-view-modal/workflow-view-modal.data';

interface TenantWorkflowSummary {
  tenantId: string;
  tenantName: string;
  accountName: string;
  accountDisplayName: string;
  environment?: string;
  workflows: Workflow[];
}

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

interface WorkflowTotals {
  total: number;
  pending: number;
  running: number;
  completed: number;
  failed: number;
}

type LaunchMode = 'module' | 'group';

interface GroupLaunchOption {
  id: string;
  label: string;
  description: string;
  modules: CreateWorkflowDtoWorkflowTypeEnum[];
}

interface TenantAccountSummary {
  accountName: string;
  accountDisplayName: string;
  tenants: TenantWorkflowSummary[];
}

interface TenantSelectOption {
  accountName: string;
  accountDisplayName: string;
  tenantId: string;
  tenantName: string;
}

type WorkflowWithAccountContext = Workflow & {
  __accountName: string;
  __accountDisplayName: string;
};

@Component({
  selector: 'app-workflows-management',
  templateUrl: './workflows-management.component.html',
  styleUrls: ['./workflows-management.component.scss'],
})
export class WorkflowsManagementComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('workflowStatusTemplate') workflowStatusTemplate: TemplateRef<any>;
  @ViewChild('approveActionsTemplate') approveActionsTemplate: TemplateRef<any>;
  @ViewChild('workflowActionsTemplate') workflowActionsTemplate: TemplateRef<any>;
  activeTask: 'view' | 'approve' | 'launch' = 'view';
  tenantAccounts: TenantAccountSummary[] = [];
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
  readonly pendingStatuses = new Set<WorkflowStatusEnum>([WorkflowStatusEnum.Pending, WorkflowStatusEnum.Approved]);
  readonly runningStatuses = new Set<WorkflowStatusEnum>([
    WorkflowStatusEnum.Planning,
    WorkflowStatusEnum.Validating,
    WorkflowStatusEnum.Applying,
  ]);
  readonly completedStatuses = new Set<WorkflowStatusEnum>([
    WorkflowStatusEnum.Completed,
    WorkflowStatusEnum.CompletedNoChanges,
    WorkflowStatusEnum.Disapproved,
  ]);
  readonly failedStatuses = new Set<WorkflowStatusEnum>([
    WorkflowStatusEnum.PlanFailed,
    WorkflowStatusEnum.ApplyFailed,
    WorkflowStatusEnum.PlanIncomplete,
  ]);
  readonly defaultItemsPerPage = 20;
  groupLaunchOptions: GroupLaunchOption[] = [
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

  tenantOptions: TenantSelectOption[] = [];
  tenantTableState: Record<string, TenantTableState> = {};

  private expandedTenants: Record<'view' | 'approve', Set<string>> = {
    view: new Set<string>(),
    approve: new Set<string>(),
  };

  private approvingWorkflows = new Set<string>();
  private workflowViewModalSubscription?: Subscription;
  private modalPreviousTenant: string | null = null;

  private readonly workflowsPerPage = 200;
  private readonly tenantFilter = ['tenantVersion||eq||2'];
  public viewTableConfig: TableConfig<Workflow>;
  public approveTableConfig: TableConfig<Workflow>;

  constructor(
    private fb: FormBuilder,
    private workflowsService: V2WorkflowsService,
    private tenantsService: V2AppCentricTenantsService,
    private cdRef: ChangeDetectorRef,
    private adminService: AdminService,
    private tenantStateService: TenantStateService,
    private ngxSmartModal: NgxSmartModalService,
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
    this.launchForm.get('launchMode')?.valueChanges.subscribe(mode => this.updateLaunchModeValidators(mode as LaunchMode));
  }

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.initializeTableConfigs();
  }

  ngOnDestroy(): void {
    this.workflowViewModalSubscription?.unsubscribe();
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
    return this.allTenantSummaries.filter(tenant => this.getPendingApprovals(tenant).length > 0);
  }

  get totalPendingApprovals(): number {
    return this.tenantsWithPendingApprovals.reduce((total, tenant) => total + this.getPendingApprovals(tenant).length, 0);
  }

  get accountsWithPendingApprovals(): TenantAccountSummary[] {
    return this.tenantAccounts
      .map(account => ({
        ...account,
        tenants: account.tenants.filter(tenant => this.getPendingApprovals(tenant).length > 0),
      }))
      .filter(account => account.tenants.length > 0);
  }

  getPendingApprovals(tenant: TenantWorkflowSummary): Workflow[] {
    return tenant.workflows.filter(workflow => this.approvalRequiredStatuses.has(workflow.status as WorkflowStatusEnum));
  }

  getWorkflowTotals(tenant: TenantWorkflowSummary): WorkflowTotals {
    const totals: WorkflowTotals = {
      total: tenant.workflows.length,
      pending: 0,
      running: 0,
      completed: 0,
      failed: 0,
    };

    tenant.workflows.forEach(workflow => {
      const status = (workflow.status as WorkflowStatusEnum) ?? null;
      if (!status) {
        return;
      }
      if (this.approvalRequiredStatuses.has(status)) {
        return;
      }
      if (this.pendingStatuses.has(status)) {
        totals.pending += 1;
        return;
      }
      if (this.failedStatuses.has(status)) {
        totals.failed += 1;
        return;
      }
      if (this.completedStatuses.has(status)) {
        totals.completed += 1;
        return;
      }
      if (this.runningStatuses.has(status)) {
        totals.running += 1;
      }
    });

    return totals;
  }

  approveWorkflow(tenantId: string, workflowId: string): void {
    if (!workflowId || this.approvingWorkflows.has(workflowId)) {
      return;
    }
    const tenant = this.findTenantSummary(tenantId);
    if (!tenant) {
      return;
    }
    this.approvingWorkflows.add(workflowId);
    this.runInTenantContext(tenant.accountName, () => this.workflowsService.approveWorkflowWorkflow({ id: workflowId }))
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
    const tenant = this.findTenantSummary(tenantId);
    if (!tenant) {
      return;
    }
    const pending = this.getPendingApprovals(tenant);
    if (pending.length === 0) {
      return;
    }
    pending.forEach(wf => this.approvingWorkflows.add(wf.id));
    this.runInTenantContext(tenant.accountName, () =>
      forkJoin(pending.map(workflow => this.workflowsService.approveWorkflowWorkflow({ id: workflow.id }))),
    )
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

  openWorkflowDetails(workflow: Workflow): void {
    if (!workflow?.id) {
      return;
    }
    const context = this.getWorkflowAccountContext(workflow);
    if (!context?.accountName) {
      return;
    }
    this.modalPreviousTenant = this.tenantStateService.getTenant();
    this.tenantStateService.setTenant(context.accountName);
    this.subscribeToWorkflowViewModal();
    const data: WorkflowViewModalData = {
      workflowId: workflow.id,
    };
    this.ngxSmartModal.setModalData(data, 'workflowViewModal');
    this.ngxSmartModal.getModal('workflowViewModal').open();
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
    const tenantOption = this.tenantOptions.find(option => option.tenantId === tenantId);
    if (!tenantOption) {
      this.launchErrorMessage = 'Please select a tenant.';
      return;
    }

    this.launchSuccessMessage = '';
    this.launchErrorMessage = '';
    this.isLaunching = true;
    const request$ =
      launchMode === 'group'
        ? this.launchWorkflowGroup(tenantOption.accountName, tenantId, groupType)
        : this.launchIndividualWorkflow(tenantOption.accountName, tenantId, moduleType);

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

  trackByAccount(_index: number, account: TenantAccountSummary): string {
    return account.accountName;
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

  private get allTenantSummaries(): TenantWorkflowSummary[] {
    return this.tenantAccounts.flatMap(account => account.tenants);
  }

  private findTenantSummary(tenantId: string): TenantWorkflowSummary | undefined {
    return this.allTenantSummaries.find(tenant => tenant.tenantId === tenantId);
  }

  private loadData(): void {
    this.isLoading = true;
    this.loadingError = null;
    this.adminService
      .getTenantCatalogAdmin()
      .pipe(
        switchMap(catalog => {
          if (!catalog || catalog.length === 0) {
            return of([]);
          }
          return from(catalog).pipe(
            concatMap(item => this.loadAccountData(item)),
            toArray(),
          );
        }),
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe({
        next: accounts => {
          this.tenantAccounts = accounts;
          this.tenantOptions = this.buildTenantSelectOptions(accounts);
          this.ensureLaunchFormTenant();
        },
        error: () => {
          this.loadingError = 'Unable to load workflow data. Please refresh.';
          this.tenantAccounts = [];
          this.tenantOptions = [];
        },
      });
  }

  private ensureLaunchFormTenant(): void {
    const currentTenantId = this.launchForm.get('tenantId')?.value;
    if (!currentTenantId && this.tenantOptions.length) {
      this.launchForm.patchValue({ tenantId: this.tenantOptions[0].tenantId });
    }
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
        { name: 'Details', template: () => this.workflowActionsTemplate },
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

  private launchIndividualWorkflow(
    accountName: string,
    tenantId: string,
    workflowType: CreateWorkflowDtoWorkflowTypeEnum,
  ): Observable<any> {
    return this.runInTenantContext(accountName, () =>
      this.workflowsService.createOneWorkflow({
        createWorkflowDto: {
          tenantId,
          workflowType,
        },
      }),
    );
  }

  private launchWorkflowGroup(accountName: string, tenantId: string, groupId: string): Observable<any> {
    const option = this.groupLaunchOptions.find(opt => opt.id === groupId);
    const modules = option?.modules ?? [];
    if (!modules.length) {
      const fallbackType = this.workflowTypeOptions[0] ?? CreateWorkflowDtoWorkflowTypeEnum.TenantUnderlay;
      return this.launchIndividualWorkflow(accountName, tenantId, fallbackType);
    }
    return this.runInTenantContext(accountName, () =>
      forkJoin(
        modules.map(workflowType =>
          this.workflowsService.createOneWorkflow({
            createWorkflowDto: {
              tenantId,
              workflowType,
            },
          }),
        ),
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

  private loadAccountData(catalogItem: TenantCatalogItem): Observable<TenantAccountSummary> {
    const accountName = catalogItem.tenant;
    const accountDisplayName = catalogItem.tenantFullName || this.formatLabel(accountName);
    return this.runInTenantContext(accountName, () =>
      forkJoin({
        tenants: this.tenantsService.getManyTenant({
          perPage: 200,
          page: 1,
          filter: this.tenantFilter,
          fields: ['id', 'name', 'alias', 'description', 'environmentId'],
        }),
        workflows: this.workflowsService.getManyWorkflow({
          perPage: this.workflowsPerPage,
          page: 1,
          sort: ['createdAt,DESC'],
          fields: ['id', 'name', 'status', 'tenantId', 'terraformModule', 'approvalType', 'createdAt', 'finishedAt'],
        }),
      }),
    ).pipe(
      map(({ tenants, workflows }) => ({
        accountName,
        accountDisplayName,
        tenants: this.buildTenantWorkflowsForAccount(accountName, accountDisplayName, tenants?.data ?? [], workflows?.data ?? []),
      })),
    );
  }

  private buildTenantWorkflowsForAccount(
    accountName: string,
    accountDisplayName: string,
    tenants: Tenant[],
    workflows: Workflow[],
  ): TenantWorkflowSummary[] {
    const tenantMap = new Map<string, Tenant>();
    tenants?.forEach(tenant => tenantMap.set(tenant.id, tenant));

    const summaries = new Map<string, TenantWorkflowSummary>();
    workflows?.forEach(workflow => {
      const workflowWithContext = this.withAccountContext(workflow, accountName, accountDisplayName);
      const tenantInfo = tenantMap.get(workflow.tenantId);
      const tenantName = tenantInfo?.alias || tenantInfo?.name || workflow.tenantId;
      const environment = tenantInfo?.environmentId || 'Unspecified';

      let summary = summaries.get(workflow.tenantId);
      if (!summary) {
        summary = {
          tenantId: workflow.tenantId,
          tenantName,
          accountName,
          accountDisplayName,
          environment,
          workflows: [],
        };
        summaries.set(workflow.tenantId, summary);
      }
      summary.workflows.push(workflowWithContext);
    });

    tenantMap.forEach((tenantInfo, tenantId) => {
      if (!summaries.has(tenantId)) {
        summaries.set(tenantId, {
          tenantId,
          tenantName: tenantInfo?.alias || tenantInfo?.name || tenantId,
          accountName,
          accountDisplayName,
          environment: tenantInfo?.environmentId || 'Unspecified',
          workflows: [],
        });
      }
    });

    return Array.from(summaries.values()).sort((a, b) => a.tenantName.localeCompare(b.tenantName));
  }

  private buildTenantSelectOptions(accounts: TenantAccountSummary[]): TenantSelectOption[] {
    const options: TenantSelectOption[] = [];
    accounts.forEach(account => {
      account.tenants.forEach(tenant => {
        options.push({
          accountName: account.accountName,
          accountDisplayName: account.accountDisplayName,
          tenantId: tenant.tenantId,
          tenantName: tenant.tenantName,
        });
      });
    });
    return options.sort((a, b) => {
      const aLabel = `${a.accountDisplayName}-${a.tenantName}`;
      const bLabel = `${b.accountDisplayName}-${b.tenantName}`;
      return aLabel.localeCompare(bLabel);
    });
  }

  private runInTenantContext<T>(tenantName: string, work: () => Observable<T>): Observable<T> {
    this.tenantStateService.setTenant(tenantName);
    return work().pipe(
      finalize(() => {
        this.tenantStateService.clearTenant();
      }),
    );
  }

  private withAccountContext(workflow: Workflow, accountName: string, accountDisplayName: string): WorkflowWithAccountContext {
    return {
      ...workflow,
      __accountName: accountName,
      __accountDisplayName: accountDisplayName,
    };
  }

  private getWorkflowAccountContext(workflow: Workflow): { accountName?: string; accountDisplayName?: string } | null {
    const context = workflow as WorkflowWithAccountContext;
    if (!context.__accountName) {
      return null;
    }
    return {
      accountName: context.__accountName,
      accountDisplayName: context.__accountDisplayName,
    };
  }

  private subscribeToWorkflowViewModal(): void {
    this.workflowViewModalSubscription?.unsubscribe();
    const modal = this.ngxSmartModal.getModal('workflowViewModal');
    this.workflowViewModalSubscription = modal.onCloseFinished.subscribe(() => {
      this.ngxSmartModal.resetModalData('workflowViewModal');
      this.workflowViewModalSubscription?.unsubscribe();
      this.workflowViewModalSubscription = undefined;
      if (this.modalPreviousTenant) {
        this.tenantStateService.setTenant(this.modalPreviousTenant);
      } else {
        this.tenantStateService.clearTenant();
      }
      this.modalPreviousTenant = null;
      this.loadData();
    });
  }
}
