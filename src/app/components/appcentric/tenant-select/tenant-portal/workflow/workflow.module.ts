import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TableModule } from 'src/app/common/table/table.module';
import { IconButtonModule } from 'src/app/common/icon-button/icon-button.module';
import { ImportExportModule } from 'src/app/common/import-export/import-export.module';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'src/app/common/tooltip/tooltip.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { YesNoModalModule } from 'src/app/common/yes-no-modal/yes-no-modal.module';
import { WorkflowComponent } from './workflow.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { WorkflowViewModalComponent } from './workflow-view-modal/workflow-view-modal.component';

const routes: Routes = [
  {
    path: '',
    component: WorkflowComponent,
  },
];

@NgModule({
  declarations: [WorkflowComponent, WorkflowViewModalComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FontAwesomeModule,
    TableModule,
    IconButtonModule,
    ImportExportModule,
    NgxSmartModalModule,
    FormsModule,
    ReactiveFormsModule,
    TooltipModule,
    NgSelectModule,
    YesNoModalModule,
    MatTabsModule,
    MatCardModule,
    MatChipsModule,
    MatExpansionModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
  ],
  exports: [WorkflowComponent, WorkflowViewModalComponent],
})
export class WorkflowModule {}
