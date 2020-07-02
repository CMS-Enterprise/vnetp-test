import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { D3PieChartComponent } from 'src/app/common/d3-pie-chart/d3-pie-chart.component';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { TooltipComponent } from 'src/app/common/tooltip/tooltip.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
  },
];

@NgModule({
  imports: [CommonModule, FontAwesomeModule, RouterModule.forChild(routes)],
  declarations: [DashboardComponent, D3PieChartComponent, TooltipComponent],
})
export class DashboardModule {}
