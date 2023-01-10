import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconButtonModule } from 'src/app/common/icon-button/icon-button.module';
import { TableModule } from 'src/app/common/table/table.module';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { RecoveryPlanListComponent } from './components/recovery-plan-list/recovery-plan-list.component';
import { RecoveryPlanModalComponent } from './components/recovery-plan-modal/recovery-plan-modal.component';
import { YesNoModalModule } from 'src/app/common/yes-no-modal/yes-no-modal.module';

const routes: Routes = [
  {
    path: '',
    component: RecoveryPlanListComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    IconButtonModule,
    NgSelectModule,
    NgxSmartModalModule,
    RouterModule.forChild(routes),
    TableModule,
    YesNoModalModule,
  ],
  declarations: [RecoveryPlanListComponent, RecoveryPlanModalComponent],
  exports: [RecoveryPlanListComponent, RecoveryPlanModalComponent],
})
export class RecoveryPlanModule {}
