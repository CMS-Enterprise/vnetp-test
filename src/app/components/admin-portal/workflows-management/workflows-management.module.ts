import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { WorkflowsManagementComponent } from './workflows-management.component';
import { TableModule } from 'src/app/common/table/table.module';

@NgModule({
  declarations: [WorkflowsManagementComponent],
  imports: [CommonModule, ReactiveFormsModule, TableModule],
  exports: [WorkflowsManagementComponent],
})
export class WorkflowsManagementModule {}

