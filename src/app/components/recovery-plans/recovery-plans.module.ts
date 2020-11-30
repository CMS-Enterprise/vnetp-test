import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from 'src/app/common/shared.module';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconButtonModule } from 'src/app/common/icon-button/icon-button.module';
import { TableModule } from 'src/app/common/table/table.module';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { RecoveryPlanListComponent } from './components/recovery-plan-list.component';

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
    SharedModule,
    TableModule,
  ],
  declarations: [RecoveryPlanListComponent],
})
export class RecoveryPlanModule {}
