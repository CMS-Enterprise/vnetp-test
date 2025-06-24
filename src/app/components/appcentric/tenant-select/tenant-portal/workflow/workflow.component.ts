import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CreateWorkflowDtoWorkflowTypeEnum, GetManyWorkflowResponseDto, V2WorkflowsService, Workflow } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { AdvancedSearchAdapter } from 'src/app/common/advanced-search/advanced-search.adapter';
import { TableConfig } from 'src/app/common/table/table.component';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { WorkflowViewModalData } from './workflow-view-modal/workflow-view-modal.data';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.component.html',
  styleUrls: ['./workflow.component.css'],
})
export class WorkflowComponent implements OnInit {
  public tenantId: string;
  public workflows: GetManyWorkflowResponseDto;
  public isLoading = false;
  public tableComponentDto = new TableComponentDto();
  public perPage = 20;
  public CreateWorkflowDtoWorkflowTypeEnum = CreateWorkflowDtoWorkflowTypeEnum;
  public workflowViewModalSubscription: Subscription;

  constructor(
    private readonly workflowService: V2WorkflowsService,
    private readonly router: Router,
    private readonly ngxSmartModal: NgxSmartModalService,
    private readonly ngx: NgxSmartModalService,
  ) {
    const advancedSearchAdapter = new AdvancedSearchAdapter<Workflow>();
    advancedSearchAdapter.setService(this.workflowService);
    advancedSearchAdapter.setServiceName('V2WorkflowsService');
    this.config.advancedSearchAdapter = advancedSearchAdapter;

    const match = this.router.routerState.snapshot.url.match(
      /tenant-select\/edit\/[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}/,
    );
    if (match) {
      const uuid = match[0].split('/')[2];
      this.tenantId = uuid;
    }
  }

  ngOnInit(): void {
    this.getWorkflows();
  }

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

  public config: TableConfig<any> = {
    description: 'Workflows',
    columns: [
      { name: 'Name', property: 'name' },
      { name: 'Status', property: 'status' },
      { name: 'Terraform Module', property: 'terraformModule' },
      { name: 'Approval Type', property: 'approvalType' },
      { name: 'Created At', property: 'createdAt' },
      { name: 'Finished At', property: 'finishedAt' },
      { name: '', template: () => this.actionsTemplate },
    ],
  };

  public onTableEvent(event: TableComponentDto): void {
    this.tableComponentDto = event;
    this.getWorkflows(event);
  }

  createWorkflow(workflowType: CreateWorkflowDtoWorkflowTypeEnum) {
    const modalDto = new YesNoModalDto('Create Workflow', `Are you sure you would like to create a ${workflowType} workflow?`);

    const onConfirm = () => {
      this.workflowService
        .createOneWorkflow({
          createWorkflowDto: {
            tenantId: this.tenantId,
            workflowType,
          },
        })
        .subscribe(() => {
          this.getWorkflows();
        });
    };

    const onClose = () => {
      this.getWorkflows();
    };

    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm, onClose);
  }

  getWorkflows(event?) {
    this.isLoading = true;
    let eventParams;
    if (event) {
      this.tableComponentDto.page = event.page ?? 1;
      this.tableComponentDto.perPage = event.perPage ?? 20;
      const { searchText } = event;
      const propertyName = event.searchColumn ?? null;
      if (propertyName) {
        eventParams = `${propertyName}||cont||${searchText}`;
      }
    }
    this.isLoading = true;
    this.workflowService
      .getManyWorkflow({
        fields: ['id', 'name', 'status', 'terraformModule', 'approvalType', 'createdAt', 'finishedAt'],
        filter: [`tenantId||eq||${this.tenantId}`, eventParams],
        sort: ['createdAt,DESC'],
        page: this.tableComponentDto.page,
        perPage: this.tableComponentDto.perPage,
      })
      .subscribe(response => {
        this.workflows = response;
        this.isLoading = false;
      });
  }

  deleteWorkflow(workflow: Workflow) {
    const modalDto = new YesNoModalDto('Delete Workflow', `Are you sure you would like to delete ${workflow.name}?`);

    const onConfirm = () => {
      this.workflowService.deleteOneWorkflow({ id: workflow.id }).subscribe(() => {
        this.getWorkflows();
      });
    };

    const onClose = () => {
      this.getWorkflows();
    };

    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm, onClose);
  }

  openWorkflowViewModal(workflow: Workflow) {
    this.subscribeToWorkflowViewModal();
    const data: WorkflowViewModalData = {
      workflowId: workflow.id,
    };
    data.workflowId = workflow.id;
    this.ngxSmartModal.setModalData(data, 'workflowViewModal');
    this.ngxSmartModal.getModal('workflowViewModal').open();
  }

  subscribeToWorkflowViewModal() {
    this.workflowViewModalSubscription = this.ngxSmartModal.getModal('workflowViewModal').onCloseFinished.subscribe(() => {
      this.ngxSmartModal.resetModalData('workflowViewModal');
      this.workflowViewModalSubscription.unsubscribe();
      // get search params from local storage
      // const params = this.tableContextService.getSearchLocalStorage();
      // const { filteredResults } = params;
      this.getWorkflows();
    });
  }
}
