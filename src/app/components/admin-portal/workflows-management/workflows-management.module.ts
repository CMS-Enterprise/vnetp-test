import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { WorkflowsManagementComponent } from './workflows-management.component';
import { TableModule } from 'src/app/common/table/table.module';
import { WorkflowModule } from '../../appcentric/tenant-select/tenant-portal/workflow/workflow.module';

@NgModule({
  declarations: [WorkflowsManagementComponent],
  imports: [CommonModule, ReactiveFormsModule, TableModule, WorkflowModule],
  exports: [WorkflowsManagementComponent],
})
export class WorkflowsManagementModule {}
