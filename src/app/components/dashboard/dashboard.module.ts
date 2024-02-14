import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TooltipModule } from 'src/app/common/tooltip/tooltip.module';
import { TableModule } from 'src/app/common/table/table.module';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { ChangeRequestModalModule } from '../change-request-modal/change-request-modal.module';
import { NgxSmartModalModule } from 'ngx-smart-modal';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
  },
];
@NgModule({
  imports: [
    ChangeRequestModalModule,
    CommonModule,
    FontAwesomeModule,
    RouterModule.forChild(routes),
    TableModule,
    TooltipModule,
    NgxSmartModalModule,
  ],
  declarations: [DashboardComponent],
})
export class DashboardModule {}
