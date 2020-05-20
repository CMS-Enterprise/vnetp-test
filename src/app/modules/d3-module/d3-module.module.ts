import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { D3GraphComponent } from 'src/app/components/d3-graph/d3-graph.component';
import { D3PieChartComponent } from 'src/app/components/d3-pie-chart/d3-pie-chart.component';

@NgModule({
  declarations: [D3GraphComponent, D3PieChartComponent],
  imports: [CommonModule],
  exports: [D3GraphComponent, D3PieChartComponent],
})
export class D3Module {}
