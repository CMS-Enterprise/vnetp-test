import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { D3PieChartComponent } from './d3-pie-chart.component';

@NgModule({
  imports: [CommonModule],
  declarations: [D3PieChartComponent],
  exports: [D3PieChartComponent],
})
export class D3PieChartModule {}
