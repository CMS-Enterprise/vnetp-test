import { Component } from '@angular/core';
import { V2WorkflowsService, Workflow, WorkflowExecutionLog, TerraformShowPlan, WorkflowStatusEnum } from 'client';
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
  public terraformPlan: TerraformShowPlan | null = null;
  public planJson: string | null = null;
  public displayedColumns: string[] = ['actions', 'address', 'type', 'name', 'diff'];

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
          this.terraformPlan = this.workflow.plan.planJson;
          this.planJson = JSON.stringify(this.terraformPlan, null, 2);
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
    this.terraformPlan = null;
    this.planJson = null;
  }

  trackByEventId(index: number, event: any): string {
    return event.id;
  }

  trackByExecutionLogId(index: number, log: WorkflowExecutionLog): string {
    return log.id;
  }

  downloadPlanJson(): void {
    if (!this.planJson) {
      return;
    }
    const blob = new Blob([this.planJson], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `terraform-plan-${this.workflowId}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  hasFormatVersionMismatch(): boolean {
    if (!this.terraformPlan?.prior_state) {
      return false;
    }
    const priorFormatVersion = (this.terraformPlan.prior_state as any).format_version;
    if (!priorFormatVersion) {
      return false;
    }
    return this.terraformPlan.format_version !== priorFormatVersion;
  }

  hasTerraformVersionMismatch(): boolean {
    if (!this.terraformPlan?.prior_state) {
      return false;
    }
    return this.terraformPlan.terraform_version !== this.terraformPlan.prior_state.terraform_version;
  }

  getPriorFormatVersion(): string | null {
    if (!this.terraformPlan?.prior_state) {
      return null;
    }
    return (this.terraformPlan.prior_state as any).format_version || null;
  }
}
