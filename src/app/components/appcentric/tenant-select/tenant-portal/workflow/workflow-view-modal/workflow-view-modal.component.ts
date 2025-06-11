import { Component } from '@angular/core';
import { V2WorkflowsService, Workflow } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { WorkflowViewModalDto } from './workflow-view-modal-dto';

@Component({
  selector: 'app-workflow-view-modal',
  templateUrl: './workflow-view-modal.component.html',
})
export class WorkflowViewModalComponent {
  public workflow: Workflow;
  public workflowId: string;

  constructor(private readonly workflowService: V2WorkflowsService, private readonly ngxSmartModal: NgxSmartModalService) {}

  getData() {
    const data = this.ngxSmartModal.getModalData('workflowViewModal') as WorkflowViewModalDto;
    this.workflowId = data.workflowId;
    this.getWorkflow();
  }

  getWorkflow() {
    this.workflowService
      .getOneWorkflow({
        id: this.workflowId,
        relations: ['plan'],
      })
      .subscribe(workflow => {
        this.workflow = workflow;
      });
  }

  reset() {
    this.workflow = null;
    this.workflowId = null;
  }
}
