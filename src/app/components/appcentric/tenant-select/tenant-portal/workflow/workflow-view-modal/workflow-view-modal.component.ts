import { Component } from '@angular/core';
import { V2WorkflowsService, Workflow, WorkflowExecutionLog } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { WorkflowViewModalData } from './workflow-view-modal.data';

@Component({
  selector: 'app-workflow-view-modal',
  templateUrl: './workflow-view-modal.component.html',
  styleUrls: ['./workflow-view-modal.component.scss'],
})
export class WorkflowViewModalComponent {
  public workflow: Workflow;
  public workflowId: string;
  public planJson: string;
  public displayedColumns: string[] = ['actions', 'address', 'type', 'name', 'diff'];
  public showTerraformPlan = false;

  constructor(private readonly workflowService: V2WorkflowsService, private readonly ngxSmartModal: NgxSmartModalService) {}

  getData() {
    const data = this.ngxSmartModal.getModalData('workflowViewModal') as WorkflowViewModalData;
    this.workflowId = data.workflowId;
    this.getWorkflow();
  }

  getWorkflow() {
    this.workflowService
      .getOneWorkflow({
        id: this.workflowId,
        relations: ['plan', 'events', 'executionLogs'],
      })
      .subscribe(workflow => {
        this.workflow = workflow;
        if (this.workflow.plan?.planJson) {
          const planObject = this.workflow.plan.planJson;
          this.planJson = JSON.stringify(planObject, null, 2);
        }
      });
  }

  approveWorkflow() {
    this.workflowService.approveWorkflowWorkflow({ id: this.workflowId }).subscribe(() => {
      this.getWorkflow();
    });
  }

  disapproveWorkflow() {
    this.workflowService.disapproveWorkflowWorkflow({ id: this.workflowId }).subscribe(() => {
      this.getWorkflow();
    });
  }

  applyWorkflow() {
    this.workflowService.applyWorkflowWorkflow({ id: this.workflowId }).subscribe(() => {
      this.getWorkflow();
    });
  }

  reset() {
    this.workflow = null;
    this.workflowId = null;
    this.planJson = null;
    this.showTerraformPlan = false;
  }

  trackByEventId(index: number, event: any): string {
    return event.id;
  }

  trackByExecutionLogId(index: number, log: WorkflowExecutionLog): string {
    return log.id;
  }

  toggleTerraformPlan(): void {
    this.showTerraformPlan = !this.showTerraformPlan;
  }
}
