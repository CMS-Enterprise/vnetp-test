import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TooltipModule } from 'src/app/common/tooltip/tooltip.module';
import { TableModule } from 'src/app/common/table/table.module';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { YesNoModalModule } from 'src/app/common/yes-no-modal/yes-no-modal.module';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
  },
];
@NgModule({
  imports: [CommonModule, FontAwesomeModule, RouterModule.forChild(routes), TableModule, TooltipModule, YesNoModalModule],
  declarations: [DashboardComponent],
})
export class DashboardModule {}
