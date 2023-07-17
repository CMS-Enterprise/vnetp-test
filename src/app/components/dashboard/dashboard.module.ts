import { NgModule } from '@angular/core';
import { D3PieChartModule } from 'src/app/common/d3-pie-chart/d3-pie-chart.module';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TooltipModule } from 'src/app/common/tooltip/tooltip.module';
import { TableModule } from 'src/app/common/table/table.module';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { SharedModule } from 'src/app/common/shared.module';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
  },
];
@NgModule({
  imports: [CommonModule, D3PieChartModule, FontAwesomeModule, SharedModule, RouterModule.forChild(routes), TableModule, TooltipModule],
  declarations: [DashboardComponent],
})
export class DashboardModule {}
