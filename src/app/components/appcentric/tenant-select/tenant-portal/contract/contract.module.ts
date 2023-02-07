import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ContractComponent } from './contract.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { IconButtonModule } from 'src/app/common/icon-button/icon-button.module';
import { ImportExportModule } from 'src/app/common/import-export/import-export.module';
import { TableModule } from 'src/app/common/table/table.module';
import { YesNoModalModule } from 'src/app/common/yes-no-modal/yes-no-modal.module';
import { TooltipModule } from 'src/app/common/tooltip/tooltip.module';
import { ContractModalComponent } from './contract-modal/contract-modal.component';
import { SubjectModalComponent } from './subject-modal/subject-modal.component';
import { AddFilterModalComponent } from './subject-modal/add-filter-modal/add-filter-modal.component';
import { SubjectEditModalComponent } from './subject-modal/subject-edit-modal/subject-edit-modal.component';

const routes: Routes = [
  {
    path: '',
    component: ContractComponent,
  },
];

@NgModule({
  declarations: [ContractComponent, ContractModalComponent, SubjectModalComponent, AddFilterModalComponent, SubjectEditModalComponent],
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
  ],
})
export class ContractModule {}
